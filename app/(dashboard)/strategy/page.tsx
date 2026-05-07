'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PawPrint, Loader2, RefreshCw, Palette, Target, Megaphone } from 'lucide-react'

const TONES = ['professional', 'casual', 'humorous', 'inspirational', 'educational'] as const
const SIZES = [
  { value: '1024x1024',  label: '1:1 Square — Twitter, Instagram' },
  { value: '1792x1024',  label: '16:9 Landscape — Twitter header' },
  { value: '1024x1792',  label: '9:16 Portrait — Stories' },
]

function cleanText(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .trim()
}

export default function StrategyPage() {
  const { workspace, refresh } = useAuth()

  // Base settings
  const [niche, setNiche]           = useState('')
  const [tone, setTone]             = useState<string>('professional')
  const [goals, setGoals]           = useState<string[]>([])
  const [goalInput, setGoalInput]   = useState('')
  const [frequency, setFrequency]   = useState(7)

  // Campaign
  const [campaignFocus, setCampaignFocus] = useState('')
  const [campaignBrief, setCampaignBrief] = useState('')

  // Brand
  const [primaryColor, setPrimaryColor]     = useState('')
  const [secondaryColor, setSecondaryColor] = useState('')
  const [logoDescription, setLogoDescription] = useState('')
  const [imageSize, setImageSize]           = useState('1024x1024')

  const [saving, setSaving]         = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage]       = useState('')
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!workspace) return
    setNiche(workspace.niche ?? '')
    setTone(workspace.tone ?? 'professional')
    setGoals(workspace.goals ?? [])
    setFrequency(workspace.postingFrequency ?? 7)
    setCampaignFocus((workspace as {campaignFocus?: string}).campaignFocus ?? '')
    setCampaignBrief((workspace as {campaignBrief?: string}).campaignBrief ?? '')
    const b = (workspace as {brandSettings?: {primaryColor?: string; secondaryColor?: string; logoDescription?: string; preferredImageSize?: string}}).brandSettings ?? {}
    setPrimaryColor(b.primaryColor ?? '')
    setSecondaryColor(b.secondaryColor ?? '')
    setLogoDescription(b.logoDescription ?? '')
    setImageSize(b.preferredImageSize ?? '1024x1024')
  }, [workspace])

  function addGoal() {
    const t = goalInput.trim()
    if (t && !goals.includes(t)) { setGoals([...goals, t]); setGoalInput('') }
  }

  async function save() {
    setSaving(true); setMessage(''); setError('')
    try {
      const res = await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche, tone, goals, postingFrequency: frequency,
          campaignFocus, campaignBrief,
          brandSettings: { primaryColor, secondaryColor, logoDescription, preferredImageSize: imageSize },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      await refresh()
      setMessage('Settings saved.')
    } catch { setError('Failed to save') }
    finally { setSaving(false) }
  }

  async function generate() {
    setGenerating(true); setMessage(''); setError('')
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche, tone, goals, postingFrequency: frequency,
          campaignFocus, campaignBrief,
          brandSettings: { primaryColor, secondaryColor, logoDescription, preferredImageSize: imageSize },
        }),
      })
      const res  = await fetch('/api/strategy/generate', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      await refresh()
      setMessage('Strategy generated.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally { setGenerating(false) }
  }

  const strategyText = (workspace as {strategy?: string})?.strategy
    ? cleanText((workspace as {strategy?: string}).strategy!)
    : null

  return (
    <div className="space-y-6 max-w-2xl page-enter">
      <div>
        <h1 className="font-display font-800 text-3xl" style={{ color: 'var(--text)' }}>Strategy</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Tell Bingo exactly what you are building and who you are building it for.
        </p>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error   && <div className="alert-error">{error}</div>}

      {/* ── Base settings ── */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} style={{ color: 'var(--primary)' }} />
          <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>Base settings</h2>
        </div>

        <div>
          <label className="label">Niche</label>
          <input className="input" placeholder="e.g. Web3 onboarding tools for developers"
                 value={niche} onChange={e => setNiche(e.target.value)} />
        </div>

        <div>
          <label className="label">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize"
                      style={{
                        background:  tone === t ? 'rgba(245,158,11,0.12)' : 'var(--bg)',
                        borderColor: tone === t ? 'rgba(245,158,11,0.45)' : 'var(--border)',
                        color:       tone === t ? 'var(--primary)' : 'var(--text-muted)',
                      }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Goals</label>
          <div className="flex gap-2 mb-2">
            <input className="input flex-1" placeholder="e.g. Build FOMO, drive sign-ups..."
                   value={goalInput} onChange={e => setGoalInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGoal())} />
            <button onClick={addGoal} className="btn-secondary px-4">Add</button>
          </div>
          {goals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {goals.map(g => (
                <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {g}
                  <button onClick={() => setGoals(goals.filter(x => x !== g))}
                          className="hover:text-red-400 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Posts per week: {frequency}</label>
          <input type="range" min={1} max={21} value={frequency}
                 onChange={e => setFrequency(Number(e.target.value))}
                 className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            <span>1</span><span>7</span><span>14</span><span>21</span>
          </div>
        </div>
      </div>

      {/* ── Campaign focus ── */}
      <div className="card space-y-5">
        <div className="flex items-start gap-2 mb-1">
          <Megaphone size={16} style={{ color: 'var(--primary)', marginTop: 4 }} />
          <div>
            <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>
              Campaign focus
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                optional
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Set a direction if you are pushing a launch, event, or specific message this period.
            </p>
          </div>
        </div>

        <div>
          <label className="label">Campaign headline</label>
          <input className="input"
                 placeholder="e.g. Building awareness for our upcoming product launch"
                 value={campaignFocus}
                 onChange={e => setCampaignFocus(e.target.value)} />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
            Optional. One line that every post this period should tie back to.
          </p>
        </div>

        <div>
          <label className="label">Campaign brief</label>
          <textarea className="input min-h-[120px] resize-none"
                    placeholder="Optional. Describe what you are pushing, the angles you want to hit, and the reaction you want from your audience. The more detail you give, the more on-brand every post will be."
                    value={campaignBrief}
                    onChange={e => setCampaignBrief(e.target.value)} />
        </div>
      </div>

      {/* ── Brand settings ── */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>Brand settings</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Bingo adds these to every image prompt so your visuals stay on-brand.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Primary color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={primaryColor || '#f59e0b'}
                     onChange={e => setPrimaryColor(e.target.value)}
                     className="w-10 h-10 rounded-lg border cursor-pointer"
                     style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
              <input className="input flex-1" placeholder="#FF5733 or orange"
                     value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Secondary color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={secondaryColor || '#1a1208'}
                     onChange={e => setSecondaryColor(e.target.value)}
                     className="w-10 h-10 rounded-lg border cursor-pointer"
                     style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
              <input className="input flex-1" placeholder="#2C3E50 or dark navy"
                     value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Logo description</label>
          <input className="input"
                 placeholder="e.g. Onboard3 logo — orange wordmark on transparent background"
                 value={logoDescription}
                 onChange={e => setLogoDescription(e.target.value)} />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
            Describe your logo so it gets referenced in image prompts. You upload the actual file when generating.
          </p>
        </div>

        <div>
          <label className="label">Default image size</label>
          <div className="space-y-2">
            {SIZES.map(s => (
              <label key={s.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="imageSize" value={s.value}
                       checked={imageSize === s.value}
                       onChange={() => setImageSize(s.value)}
                       className="accent-amber-500" />
                <span className="text-sm" style={{ color: imageSize === s.value ? 'var(--text)' : 'var(--text-muted)' }}>
                  <span className="font-semibold">{s.value}</span>
                  <span className="ml-2 text-xs">{s.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={save} className="btn-secondary" disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save settings'}
        </button>
        <button onClick={generate} className="btn-primary" disabled={generating || !niche}>
          {generating
            ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
            : <><PawPrint size={14} /> Generate strategy</>}
        </button>
      </div>

      {/* Strategy display */}
      {strategyText && (
        <div className="card space-y-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>
              Current strategy
            </h2>
            <div className="flex items-center gap-3">
              {(workspace as {strategyGeneratedAt?: string}).strategyGeneratedAt && (
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {new Date((workspace as {strategyGeneratedAt?: string}).strategyGeneratedAt!).toLocaleDateString()}
                </span>
              )}
              <button onClick={generate} disabled={generating}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                <RefreshCw size={12} />
                Regenerate
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {strategyText.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm leading-7"
                 style={{ color: 'var(--text)', fontFamily: 'Nunito, sans-serif' }}>
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
