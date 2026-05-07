import { Telegraf } from 'telegraf'
import axios from 'axios'

let bot: Telegraf | null = null

export function getTelegramBot(): Telegraf {
  if (!bot) {
    if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not set')
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
  }
  return bot
}

export async function sendMessage(chatId: string, text: string) {
  const b = getTelegramBot()
  await b.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' })
}

export async function sendPhoto(chatId: string, imageBuffer: Buffer, caption: string) {
  const b = getTelegramBot()
  await b.telegram.sendPhoto(
    chatId,
    { source: imageBuffer },
    { caption, parse_mode: 'Markdown' }
  )
}

export async function sendCalendarNotification(params: {
  chatId: string
  weekStart: string
  postCount: number
  platforms: string[]
  approvalLink: string
}) {
  const { chatId, weekStart, postCount, platforms, approvalLink } = params
  const text = `📅 *Your content calendar is ready for review!*

Week of: ${weekStart}
Posts: ${postCount}
Platforms: ${platforms.join(', ')}

[View & Approve Calendar](${approvalLink})

Once you approve, posts will be automatically sent out on schedule.`
  await sendMessage(chatId, text)
}

export async function sendXPost(params: {
  chatId: string
  imageBuffer: Buffer
  caption: string
  scheduledAt: string
}) {
  const { chatId, imageBuffer, caption, scheduledAt } = params
  await sendPhoto(chatId, imageBuffer, `📱 *Post for X (Twitter)*\n\n${caption}`)
  await sendMessage(chatId, `⏰ Was scheduled for: ${scheduledAt}\n\n_Post this manually on X._`)
}

export async function registerWebhook(webhookUrl: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set')
  const res = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
    url: webhookUrl,
  })
  return res.data
}
