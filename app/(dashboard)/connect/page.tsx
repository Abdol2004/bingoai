'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PawPrint, Send, Check, Loader2, ExternalLink } from 'lucide-react'

export default function ConnectPage() {
  const { user, refresh } = useAuth()

  const [telegramChatId, setTelegramChatId] = useState('')
  const [saving, setSaving]                 = useState(false)
  const [registering, setRegistering]       = useState(false)
  const [message, setMessage]               = useState('')
  const [error, setError]                   = useState('')

  const BOT_USERNAME = 'bingooaibot'

  useEffect(() => {
    if (user) setTelegramChatId(user.telegramChatId ?? '')
  }, [user])

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramChatId,
          platforms: { x: { enabled: true }, telegram: { enabled: false }, discord: { enabled: false } },
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await refresh()
      setMessage('Saved! Bingo knows where to send your posts.')
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function registerWebhook() {
    setRegistering(true)
    setMessage('')
    setError('')
    try {
      const res  = await fetch('/api/telegram/setup', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setMessage('Telegram webhook registered successfully.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to register webhook')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="space-y-8 max-w-xl page-enter">
      <div>
        <h1 className="font-display font-800 text-3xl" style={{ color: 'var(--text)' }}>Pack Setup</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Connect your Telegram so Bingo can send you ready-to-post X drafts.
        </p>
      </div>

      {message && <div className="alert-success flex items-center gap-2"><Check size={15} /> {message}</div>}
      {error   && <div className="alert-error">{error}</div>}

      {/* How it works */}
      <div className="card space-y-3" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
        <h2 className="font-display font-700" style={{ color: 'var(--primary)' }}>How posting works</h2>
        <ol className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {[
            'Bingo generates your X post at the scheduled time',
            'It sends you the caption + image prompt on Telegram',
            'You copy it and post manually on X',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-display font-700 shrink-0" style={{ color: 'var(--primary)' }}>
                {i + 1}.
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* Telegram setup */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(14,165,233,0.15)' }}>
            <Send size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>Telegram</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Receives your X post drafts + calendar notifications
            </p>
          </div>
          {user?.telegramChatId && (
            <span className="ml-auto badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <Check size={10} className="mr-1" /> Connected
            </span>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-xl p-4 space-y-2 text-sm"
             style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Get your Chat ID:</p>
          <ol className="space-y-1.5 list-decimal list-inside" style={{ color: 'var(--text-muted)' }}>
            <li>
              Open Telegram and message{' '}
              <a href={`https://t.me/${BOT_USERNAME}`} target="_blank" rel="noreferrer"
                 className="font-semibold inline-flex items-center gap-1"
                 style={{ color: 'var(--primary)' }}>
                @{BOT_USERNAME} <ExternalLink size={11} />
              </a>
            </li>
            <li>Send <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--border)' }}>/start</code></li>
            <li>Bingo replies with your Chat ID — copy it below</li>
          </ol>
        </div>

        <div>
          <label className="label">Your Telegram Chat ID</label>
          <input
            className="input"
            placeholder="e.g. 123456789"
            value={telegramChatId}
            onChange={e => setTelegramChatId(e.target.value)}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
            This is your personal ID, not a channel. Bingo sends post drafts here.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : <><PawPrint size={14} /> Save Chat ID</>}
          </button>
          <button onClick={registerWebhook} disabled={registering} className="btn-secondary text-sm">
            {registering ? 'Registering...' : 'Register webhook (production)'}
          </button>
        </div>
      </div>

      {/* X note */}
      <div className="card flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-800 text-sm"
             style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text)' }}>
          X
        </div>
        <div>
          <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>X / Twitter</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            X posting is always enabled. Drafts are delivered to your Telegram for manual posting.
            The X API costs $100/month so we keep it manual — you get the draft, you post it in one tap.
          </p>
        </div>
      </div>
    </div>
  )
}
