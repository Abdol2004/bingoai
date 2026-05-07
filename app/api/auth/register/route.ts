import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { hashPassword, signJWT } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email: parsed.data.email })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(parsed.data.password)

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    })

    const workspace = await Workspace.create({
      userId: user._id,
      name: `${parsed.data.name}'s Workspace`,
    })

    user.workspaceId = workspace._id
    await user.save()

    const token = await signJWT({ userId: user._id.toString(), email: user.email })

    const res = NextResponse.json(
      { data: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    )

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return res
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
