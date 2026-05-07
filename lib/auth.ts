import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')

export type SessionPayload = { userId: string; email: string }

export async function signJWT(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined
  if (req) {
    token = req.cookies.get('token')?.value
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get('token')?.value
  }
  if (!token) return null
  return verifyJWT(token)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
