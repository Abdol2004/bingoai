import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { CalendarWeek } from '@/models/CalendarWeek'
import { Post } from '@/models/Post'
import { getSession } from '@/lib/auth'
import { schedulePost } from '@/lib/queue/agenda'
import { sendCalendarNotification } from '@/lib/bots/telegram'
import { format } from 'date-fns'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (calendar.status === 'approved') {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 })
    }

    const posts = await Post.find({ calendarWeekId: id, status: 'draft' })

    // Schedule each post via Agenda
    await Promise.all(
      posts.map(async (post) => {
        const jobId = await schedulePost(post._id.toString(), post.scheduledAt)
        await Post.findByIdAndUpdate(post._id, {
          status: 'approved',
          agendaJobId: jobId,
        })
      })
    )

    calendar.status = 'approved'
    calendar.approvedAt = new Date()
    await calendar.save()

    // Send Telegram notification if user has a chat ID
    if (user?.telegramChatId) {
      const workspace = await Workspace.findById(user.workspaceId)
      const enabledPlatforms = workspace
        ? Object.entries(workspace.platforms)
            .filter(([, v]) => (v as { enabled?: boolean }).enabled)
            .map(([k]) => k)
        : []

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        await sendCalendarNotification({
          chatId: user.telegramChatId,
          weekStart: format(calendar.weekStart, 'MMM d, yyyy'),
          postCount: posts.length,
          platforms: enabledPlatforms,
          approvalLink: `${appUrl}/calendar/${id}`,
        })
      } catch (e) {
        console.warn('[approve] Could not send TG notification:', e)
      }
    }

    return NextResponse.json({ data: { calendar, scheduledCount: posts.length } })
  } catch (err) {
    console.error('[calendar/:id/approve]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
