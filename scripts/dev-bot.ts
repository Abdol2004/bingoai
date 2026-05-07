/**
 * Local dev Telegram bot — polling mode.
 * Run in a separate terminal: npm run dev:bot
 *
 * In production (Render), the bot uses webhooks via /api/telegram/webhook instead.
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { Telegraf } from 'telegraf'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  console.error('❌  TELEGRAM_BOT_TOKEN not set in .env.local')
  process.exit(1)
}

const bot = new Telegraf(token)

bot.start(async (ctx) => {
  const chatId = ctx.chat.id.toString()
  const name   = ctx.from.first_name ?? 'there'

  await ctx.reply(
    `🐾 *Woof! Hey ${name}!*\n\nI'm Bingo — your AI content dog.\n\nYour personal Chat ID is:\n\`${chatId}\`\n\nCopy that and paste it in the *Connect* page inside Bingo so I can send you X posts and calendar alerts.`,
    { parse_mode: 'Markdown' }
  )
})

bot.command('id', async (ctx) => {
  await ctx.reply(
    `Your Chat ID: \`${ctx.chat.id}\``,
    { parse_mode: 'Markdown' }
  )
})

bot.command('help', async (ctx) => {
  await ctx.reply(
    `*Bingo Commands*\n\n/start — get your Chat ID\n/id — show Chat ID again\n/help — show this message`,
    { parse_mode: 'Markdown' }
  )
})

// Drop any pending webhook so polling works cleanly
bot.telegram.deleteWebhook().then(() => {
  bot.launch()
  console.log('🐾  Bingo bot is running in polling mode')
  console.log('    Message @bingooaibot on Telegram to test it')
})

process.once('SIGINT',  () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
