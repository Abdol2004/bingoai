import { NextRequest, NextResponse } from 'next/server'
import { getTelegramBot } from '@/lib/bots/telegram'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const bot = getTelegramBot()

    // Handle /start command to help users get their chat ID
    bot.start(async (ctx) => {
      const chatId = ctx.chat.id.toString()
      await connectDB()

      await ctx.reply(
        `👋 Welcome to ContentPilot!\n\nYour Chat ID is: \`${chatId}\`\n\nCopy this ID and paste it in your ContentPilot Connect settings to receive X posts and calendar notifications.`,
        { parse_mode: 'Markdown' }
      )
    })

    bot.command('id', async (ctx) => {
      const chatId = ctx.chat.id.toString()
      await ctx.reply(`Your Chat ID: \`${chatId}\``, { parse_mode: 'Markdown' })
    })

    await bot.handleUpdate(body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[telegram webhook]', err)
    return NextResponse.json({ ok: false })
  }
}
