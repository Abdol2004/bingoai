import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { getSession } from '@/lib/auth'
import { generateStrategy } from '@/lib/ai/claude'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const workspace = await Workspace.findById(user.workspaceId)
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    if (!workspace.niche) {
      return NextResponse.json({ error: 'Please set your niche first' }, { status: 400 })
    }

    const platforms = Object.entries(workspace.platforms)
      .filter(([, v]) => v.enabled)
      .map(([k]) => k)

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: 'Please connect at least one platform first' },
        { status: 400 }
      )
    }

    const strategy = await generateStrategy({
      niche: workspace.niche,
      tone: workspace.tone,
      goals: workspace.goals,
      frequency: workspace.postingFrequency,
      campaignFocus: workspace.campaignFocus,
      campaignBrief: workspace.campaignBrief,
    })

    workspace.strategy = strategy
    workspace.strategyGeneratedAt = new Date()
    await workspace.save()

    return NextResponse.json({ data: { strategy } })
  } catch (err) {
    console.error('[strategy generate]', err)
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 })
  }
}
