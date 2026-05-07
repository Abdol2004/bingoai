import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { Post } from '@/models/Post'
import { getSession } from '@/lib/auth'
import { generateXPost, type ContentPillar } from '@/lib/ai/deepseek'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const user      = await User.findById(session.userId)
    const post      = await Post.findOne({ _id: id, workspaceId: user?.workspaceId })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const workspace = await Workspace.findById(user?.workspaceId)

    const caption = await generateXPost({
      topic:        post.topic,
      contentBrief: post.contentBrief || post.topic,
      pillar:       (post.contentPillar ?? 'value') as ContentPillar,
      voiceType:    (post.voiceType ?? 'personal') as 'personal' | 'brand',
    })

    // Save caption so user can reuse it
    post.caption = caption
    await post.save()

    return NextResponse.json({ data: { caption } })
  } catch (err) {
    console.error('[post caption]', err)
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 })
  }
}
