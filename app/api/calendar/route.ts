import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { CalendarWeek } from '@/models/CalendarWeek'
import { Post } from '@/models/Post'
import { getSession } from '@/lib/auth'
import { generateCalendar } from '@/lib/ai/claude'
import { parseISO, setHours, setMinutes, addDays, format } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const calendars = await CalendarWeek.find({ workspaceId: user.workspaceId })
      .sort({ weekStart: -1 })
      .limit(8)

    return NextResponse.json({ data: calendars })
  } catch (err) {
    console.error('[calendar GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      startDate,
      endDate,
      postTimes = ['10:00'],
      pillars = ['educational', 'engagement', 'value', 'ragebait'],
      postsPerDay = 1,
      voiceType = 'personal',
    } = body

    const preferredTime = Array.isArray(postTimes) ? postTimes[0] : postTimes

    await connectDB()
    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const workspace = await Workspace.findById(user.workspaceId)
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    if (!workspace.strategy) {
      return NextResponse.json({ error: 'Please generate a strategy first' }, { status: 400 })
    }

    const weekStart = startDate ? parseISO(startDate) : new Date()
    const weekEnd   = endDate   ? parseISO(endDate)   : addDays(weekStart, 6)

    const [timeH, timeM] = preferredTime.split(':').map(Number)

    const totalDays = Math.round((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalPosts = totalDays * postsPerDay

    const result = await generateCalendar({
      niche: workspace.niche,
      tone: workspace.tone,
      goals: workspace.goals,
      frequency: totalPosts,
      platforms: ['x'],
      strategy: workspace.strategy,
      weekStart,
      pillars,
      preferredTime,
      campaignFocus: workspace.campaignFocus,
      campaignBrief: workspace.campaignBrief,
      voiceType,
    })

    const calendar = await CalendarWeek.create({
      workspaceId: workspace._id,
      weekStart,
      weekEnd,
      status: 'pending_approval',
      overallStrategy: result.overallStrategy,
    })

    // Track how many posts have been assigned per date so we can rotate times
    const dateCount: Record<string, number> = {}

    const posts = await Post.insertMany(
      result.posts.map((p, i) => {
        const date    = parseISO(p.date)
        const dateKey = p.date

        const slotIndex = dateCount[dateKey] ?? 0
        dateCount[dateKey] = slotIndex + 1

        const timeStr  = Array.isArray(postTimes) ? (postTimes[slotIndex] ?? postTimes[0]) : postTimes
        const [tH, tM] = (timeStr as string).split(':').map(Number)
        const scheduledAt = setMinutes(setHours(date, tH || 10), tM || 0)

        return {
          workspaceId: workspace._id,
          calendarWeekId: calendar._id,
          platform: 'x',
          topic: p.topic,
          contentBrief: p.contentBrief,
          imagePrompt: p.imagePrompt,
          contentPillar: p.contentPillar ?? pillars[i % pillars.length],
          voiceType,
          scheduledAt,
          status: 'draft',
        }
      })
    )

    return NextResponse.json({ data: { calendar, posts } }, { status: 201 })
  } catch (err) {
    console.error('[calendar POST]', err)
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 })
  }
}
