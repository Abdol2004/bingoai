import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Post } from '@/models/Post'
import { getSession } from '@/lib/auth'
import { cancelJob } from '@/lib/queue/agenda'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const user = await User.findById(session.userId)
    const post = await Post.findOne({ _id: id, workspaceId: user?.workspaceId })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[post GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    await connectDB()

    const user = await User.findById(session.userId)
    const post = await Post.findOneAndUpdate(
      { _id: id, workspaceId: user?.workspaceId },
      {
        $set: {
          ...(body.topic && { topic: body.topic }),
          ...(body.contentBrief && { contentBrief: body.contentBrief }),
          ...(body.imagePrompt && { imagePrompt: body.imagePrompt }),
          ...(body.caption && { caption: body.caption }),
          ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }),
          ...(body.platform && { platform: body.platform }),
        },
      },
      { new: true }
    )

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[post PUT]', err)
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
    const post = await Post.findOne({ _id: id, workspaceId: user?.workspaceId })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (post.agendaJobId) {
      try { await cancelJob(post.agendaJobId) } catch {}
    }

    await Post.findByIdAndDelete(id)
    return NextResponse.json({ data: null })
  } catch (err) {
    console.error('[post DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
