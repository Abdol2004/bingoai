import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const workspace = await Workspace.findById(user.workspaceId)
    return NextResponse.json({ data: workspace })
  } catch (err) {
    console.error('[workspace GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    await connectDB()

    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    // Update telegramChatId on user if provided
    if (body.telegramChatId !== undefined) {
      await User.findByIdAndUpdate(session.userId, { telegramChatId: body.telegramChatId })
      delete body.telegramChatId
    }

    const workspace = await Workspace.findByIdAndUpdate(
      user.workspaceId,
      { $set: body },
      { new: true, runValidators: true }
    )

    return NextResponse.json({ data: workspace })
  } catch (err) {
    console.error('[workspace PUT]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
