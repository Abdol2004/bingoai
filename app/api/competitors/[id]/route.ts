import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Competitor } from '@/models/Competitor'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const user = await User.findById(session.userId)
    const result = await Competitor.findOneAndDelete({
      _id: id,
      workspaceId: user?.workspaceId,
    })

    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: null })
  } catch (err) {
    console.error('[competitor DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
