/**
 * ContentPilot Worker
 * Runs as a separate Render background service.
 * Handles:
 *   - Agenda job processing (generate & post content)
 *   - Discord bot gateway connection
 */

import mongoose from 'mongoose'
import Agenda, { Job } from 'agenda'
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js'
import { Telegraf } from 'telegraf'

// ── Env check ──────────────────────────────────────────────────────────────────
const {
  MONGODB_URI,
  TELEGRAM_BOT_TOKEN,
  DISCORD_BOT_TOKEN,
  DEEPSEEK_API_KEY,
  OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL,
} = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI is required')
if (!DEEPSEEK_API_KEY) console.warn('[worker] DEEPSEEK_API_KEY not set')
if (!OPENAI_API_KEY) console.warn('[worker] OPENAI_API_KEY not set')

// ── Inline AI imports (avoids Next.js module bundling) ──────────────────────
import OpenAI from 'openai'
import axios from 'axios'

const deepseekClient = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: DEEPSEEK_API_KEY })
const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY })

async function generateCaption(topic: string, contentBrief: string, tone: string, platform: string) {
  const platformGuide =
    platform === 'x'
      ? 'Max 280 chars. Punchy. Include 2-3 hashtags.'
      : platform === 'telegram'
        ? 'Up to 1024 chars. Markdown bold (**text**). No hashtags.'
        : 'Up to 2000 chars. Markdown supported. Community-focused.'

  const res = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: `You are a social media copywriter. Tone: ${tone}.` },
      {
        role: 'user',
        content: `Write a ${platform} caption.\nTopic: ${topic}\nBrief: ${contentBrief}\n${platformGuide}\nCaption only.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 512,
  })
  return res.choices?.[0]?.message.content?.trim() ?? topic
}

async function generateImage(prompt: string): Promise<Buffer> {
  const res = await openaiClient.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })
  const url = res.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from DALL-E 3')
  const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
  return Buffer.from(imgRes.data)
}

// ── Mongoose models (inline to avoid Next.js imports) ─────────────────────────
import { Schema, model, models } from 'mongoose'

const PostSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    calendarWeekId: { type: Schema.Types.ObjectId },
    platform: String,
    topic: String,
    contentBrief: String,
    imagePrompt: String,
    caption: String,
    scheduledAt: Date,
    status: { type: String, default: 'draft' },
    error: String,
    sentAt: Date,
  },
  { timestamps: true }
)

const WorkspaceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  tone: String,
  platforms: {
    telegram: { enabled: Boolean, channelId: String },
    discord: { enabled: Boolean, channelId: String, guildId: String },
    x: { enabled: Boolean },
  },
})

const UserSchema = new Schema({ telegramChatId: String, workspaceId: Schema.Types.ObjectId })

const Post = models.Post ?? model('Post', PostSchema)
const Workspace = models.Workspace ?? model('Workspace', WorkspaceSchema)
const User = models.User ?? model('User', UserSchema)

// ── Discord client ─────────────────────────────────────────────────────────────
let discordClient: Client | null = null

function getDiscordClient(): Client {
  if (!discordClient) {
    discordClient = new Client({ intents: [GatewayIntentBits.Guilds] })
  }
  return discordClient
}

async function postToDiscord(channelId: string, caption: string, imageBuffer: Buffer, topic: string) {
  const client = getDiscordClient()
  const channel = await client.channels.fetch(channelId)
  if (!channel || !channel.isTextBased()) throw new Error(`Channel ${channelId} not found or not text`)

  const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' })

  // @ts-expect-error - send exists on text channels
  await channel.send({ content: caption, files: [attachment] })
}

// ── Telegram client ────────────────────────────────────────────────────────────
function getTelegramBot(): Telegraf {
  if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not set')
  return new Telegraf(TELEGRAM_BOT_TOKEN)
}

async function postToTelegram(chatId: string, caption: string, imageBuffer: Buffer) {
  const bot = getTelegramBot()
  await bot.telegram.sendPhoto(chatId, { source: imageBuffer }, { caption, parse_mode: 'Markdown' })
}

// ── Main job handler ───────────────────────────────────────────────────────────
async function handleGenerateAndPost(job: Job) {
  const { postId } = job.attrs.data as { postId: string }
  console.log(`[worker] Processing post ${postId}`)

  const post = await Post.findById(postId)
  if (!post) {
    console.warn(`[worker] Post ${postId} not found`)
    return
  }

  if (post.status === 'sent') {
    console.log(`[worker] Post ${postId} already sent, skipping`)
    return
  }

  post.status = 'generating'
  await post.save()

  try {
    const workspace = await Workspace.findById(post.workspaceId)
    if (!workspace) throw new Error('Workspace not found')

    // Generate caption
    const caption = await generateCaption(
      post.topic,
      post.contentBrief || post.topic,
      workspace.tone || 'professional',
      post.platform
    )

    // Generate image
    const imagePrompt = post.imagePrompt || `Professional image about: ${post.topic}`
    const imageBuffer = await generateImage(imagePrompt)

    // Post to platform
    if (post.platform === 'telegram') {
      const channelId = workspace.platforms?.telegram?.channelId
      if (!channelId) throw new Error('Telegram channel ID not configured')
      await postToTelegram(channelId, caption, imageBuffer)
    } else if (post.platform === 'discord') {
      const channelId = workspace.platforms?.discord?.channelId
      if (!channelId) throw new Error('Discord channel ID not configured')
      await postToDiscord(channelId, caption, imageBuffer, post.topic)
    } else if (post.platform === 'x') {
      // Send to user's personal Telegram for manual posting
      const user = await User.findOne({ workspaceId: post.workspaceId })
      const chatId = user?.telegramChatId
      if (!chatId) throw new Error('User Telegram Chat ID not configured for X posts')

      const bot = getTelegramBot()
      await bot.telegram.sendPhoto(
        chatId,
        { source: imageBuffer },
        {
          caption: `📱 *Post for X (Twitter)*\n\n${caption}`,
          parse_mode: 'Markdown',
        }
      )
      await bot.telegram.sendMessage(
        chatId,
        `⏰ Scheduled for: ${new Date(post.scheduledAt).toLocaleString()}\n\n_Post this manually on X._`,
        { parse_mode: 'Markdown' }
      )
    }

    post.caption = caption
    post.status = 'sent'
    post.sentAt = new Date()
    await post.save()

    console.log(`[worker] ✅ Post ${postId} sent to ${post.platform}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[worker] ❌ Post ${postId} failed:`, message)
    post.status = 'failed'
    post.error = message
    await post.save()
    throw err
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('[worker] Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI!)
  console.log('[worker] MongoDB connected')

  // Start Agenda
  const agenda = new Agenda({
    db: { address: MONGODB_URI!, collection: 'agendaJobs' },
    processEvery: '30 seconds',
    maxConcurrency: 5,
  })

  agenda.define('generate-and-post', handleGenerateAndPost)

  await agenda.start()
  console.log('[worker] Agenda started')

  // Start Discord bot
  if (DISCORD_BOT_TOKEN) {
    const client = getDiscordClient()

    client.once('ready', () => {
      console.log(`[worker] Discord bot ready as ${client.user?.tag}`)
    })

    client.on('error', (err) => {
      console.error('[worker] Discord error:', err.message)
    })

    await client.login(DISCORD_BOT_TOKEN)
  } else {
    console.warn('[worker] DISCORD_BOT_TOKEN not set, Discord bot disabled')
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[worker] Shutting down...')
    await agenda.stop()
    if (discordClient) discordClient.destroy()
    await mongoose.disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  console.log(`[worker] Running. App URL: ${NEXT_PUBLIC_APP_URL ?? 'not set'}`)
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err)
  process.exit(1)
})
