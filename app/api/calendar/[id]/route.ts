import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { CalendarWeek } from '@/models/CalendarWeek'
import { Post } from '@/models/Post'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const user = await User.findById(session.userId)
    const calendar = await CalendarWeek.findOne({
      _id: id,
      workspaceId: user?.workspaceId,
    })

    if (!calendar) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const posts = await Post.find({ calendarWeekId: id }).sort({ scheduledAt: 1 })

    return NextResponse.json({ data: { calendar, posts } })
  } catch (err) {
    console.error('[calendar/:id GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const user = await User.findById(session.userId)
    const calendar = await CalendarWeek.findOne({
      _id: id,
      workspaceId: user?.workspaceId,
    })
    if (!calendar) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await Post.deleteMany({ calendarWeekId: id })
    await CalendarWeek.findByIdAndDelete(id)

    return NextResponse.json({ data: null })
  } catch (err) {
    console.error('[calendar/:id DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
