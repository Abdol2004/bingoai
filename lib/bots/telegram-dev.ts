import { Telegraf } from 'telegraf'

let started = false

export function startDevBot() {
  if (started) return
  started = true

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('[bot] TELEGRAM_BOT_TOKEN not set — Telegram bot disabled')
    return
  }

  const bot = new Telegraf(token)

  bot.start(async (ctx) => {
    const chatId = ctx.chat.id.toString()
    const name   = ctx.from.first_name ?? 'there'
    await ctx.reply(
      `Woof! Hey ${name}\n\nI am Bingo, your AI content dog.\n\nYour Chat ID is:\n${chatId}\n\nCopy it and paste it in the Connect page so I can send you your X post drafts and calendar alerts.`,
      { parse_mode: 'Markdown' }
    )
  })

  bot.command('id', async (ctx) => {
    await ctx.reply(`Your Chat ID: \`${ctx.chat.id}\``, { parse_mode: 'Markdown' })
  })

  bot.command('help', async (ctx) => {
    await ctx.reply(
      `Bingo commands\n\n/start — get your Chat ID\n/id — show Chat ID again`,
      { parse_mode: 'Markdown' }
    )
  })

  // Clear any existing webhook so polling works cleanly
  bot.telegram.deleteWebhook({ drop_pending_updates: true })
    .then(() => {
      bot.launch()
      console.log('🐾  Bingo bot running (polling mode) — message @bingooaibot on Telegram')
    })
    .catch((err: Error) => {
      console.error('[bot] Failed to start:', err.message)
    })

  process.once('SIGINT',  () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
