'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PawPrint, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router  = useRouter()
  const { refresh } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Login failed'); return }
      await refresh()
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 page-enter"
         style={{ background: 'var(--bg)' }}>

      {/* Background paw prints — hidden on tiny screens */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none hidden sm:block">
        {[
          { size: 60, top: '10%', left: '5%',  opacity: 0.04, delay: '0s' },
          { size: 40, top: '70%', left: '8%',  opacity: 0.03, delay: '0.5s' },
          { size: 80, top: '20%', right: '6%', opacity: 0.04, delay: '1s' },
          { size: 50, top: '80%', right: '4%', opacity: 0.03, delay: '1.5s' },
        ].map((p, i) => (
          <PawPrint key={i} size={p.size}
            style={{ position: 'absolute', top: p.top, left: p.left, right: (p as {right?: string}).right,
                     color: 'var(--primary)', opacity: p.opacity,
                     animation: `float 4s ease-in-out ${p.delay} infinite` }} />
        ))}
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 logo-wag group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.35)' }}>
              <PawPrint size={26} className="wag-icon" style={{ color: '#0d0804' }} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-2xl md:text-3xl" style={{ color: 'var(--primary)' }}>Bingo</span>
          </Link>
          <h1 className="font-display font-bold text-xl md:text-2xl mt-4" style={{ color: 'var(--text)' }}>Welcome back!</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Bingo missed you. Sign in to continue.</p>
        </div>

        <div className="card card-glow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert-error">{error}</div>}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                       value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input type="password" className="input pl-10" placeholder="••••••••"
                       value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-1" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <><ArrowRight size={16} /> Sign in</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          New here?{' '}
          <Link href="/register" style={{ color: 'var(--primary)' }} className="font-semibold hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  )
}
