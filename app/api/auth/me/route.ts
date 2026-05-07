import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await User.findById(session.userId).select('-password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const workspace = user.workspaceId
      ? await Workspace.findById(user.workspaceId)
      : null

    return NextResponse.json({ data: { user, workspace } })
  } catch (err) {
    console.error('[me]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
