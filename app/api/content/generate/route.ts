import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { getSession } from '@/lib/auth'
import { generateXPost, generateImageGuidance, type ContentPillar } from '@/lib/ai/deepseek'
import { z } from 'zod'

const schema = z.object({
  topic:     z.string().min(3),
  pillar:    z.enum(['educational', 'engagement', 'ragebait', 'value']),
  voiceType: z.enum(['personal', 'brand']).optional().default('personal'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    await connectDB()
    const user = await User.findById(session.userId)
    const workspace = await Workspace.findById(user?.workspaceId)
    if (!workspace) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const { topic, pillar, voiceType } = parsed.data

    const brand = workspace.brandSettings ?? {}

    const [post, imageGuidance] = await Promise.all([
      generateXPost({ topic, contentBrief: topic, pillar: pillar as ContentPillar, voiceType }),
      generateImageGuidance({
        topic,
        pillar: pillar as ContentPillar,
        brandColors:      [brand.primaryColor, brand.secondaryColor].filter(Boolean).join(', ') || undefined,
        logoDescription:  brand.logoDescription || undefined,
        preferredSize:    (brand.preferredImageSize as '1024x1024' | '1792x1024' | '1024x1792') ?? '1024x1024',
      }),
    ])

    return NextResponse.json({ data: { post, imageGuidance } })
  } catch (err) {
    console.error('[content generate]', err)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
