import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')

const PROTECTED = ['/dashboard', '/strategy', '/calendar', '/connect', '/content', '/competitors']
const AUTH_ONLY = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.includes(pathname)

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.delete('token')
      return res
    }
  }

  if (isAuthOnly && token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {}
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/strategy/:path*',
    '/calendar/:path*',
    '/connect/:path*',
    '/content/:path*',
    '/competitors/:path*',
    '/login',
    '/register',
  ],
}
