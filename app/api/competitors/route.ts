import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Competitor } from '@/models/Competitor'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  platform: z.string().min(1),
  handle: z.string().min(1),
  url: z.string().url(),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.userId)
    const competitors = await Competitor.find({ workspaceId: user?.workspaceId }).sort({
      createdAt: -1,
    })

    return NextResponse.json({ data: competitors })
  } catch (err) {
    console.error('[competitors GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    await connectDB()
    const user = await User.findById(session.userId)
    if (!user?.workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const competitor = await Competitor.create({
      workspaceId: user.workspaceId,
      ...parsed.data,
    })

    return NextResponse.json({ data: competitor }, { status: 201 })
  } catch (err) {
    console.error('[competitors POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
