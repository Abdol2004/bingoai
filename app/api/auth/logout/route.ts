import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ data: null })
  res.cookies.delete('token')
  return res
}
