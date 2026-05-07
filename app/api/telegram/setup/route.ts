import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { registerWebhook } from '@/lib/bots/telegram'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) return NextResponse.json({ error: 'APP_URL not configured' }, { status: 500 })

    const webhookUrl = `${appUrl}/api/telegram/webhook`
    const result = await registerWebhook(webhookUrl)

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('[telegram setup]', err)
    return NextResponse.json({ error: 'Failed to register webhook' }, { status: 500 })
  }
}
