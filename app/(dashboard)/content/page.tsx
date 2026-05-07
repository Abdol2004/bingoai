'use client'

import { useState } from 'react'
import { PawPrint, Copy, Check, Lightbulb, ImageIcon } from 'lucide-react'
import DogLoader from '@/components/DogLoader'

type Pillar = 'educational' | 'engagement' | 'ragebait' | 'value'

const PILLARS: { id: Pillar; label: string; desc: string }[] = [
  { id: 'educational',  label: 'Educational',        desc: 'Teach something valuable' },
  { id: 'engagement',   label: 'Engagement Farming', desc: 'Built for replies and RTs' },
  { id: 'ragebait',     label: 'Ragebait',            desc: 'Hot take, strong reaction' },
  { id: 'value',        label: 'Value / Insight',     desc: 'Pure thought leadership' },
]

export default function ContentPage() {
  const [topic, setTopic]         = useState('')
  const [pillar, setPillar]       = useState<Pillar>('value')
  const [voiceType, setVoiceType] = useState<'personal' | 'brand'>('personal')
  const [wordLimit, setWordLimit] = useState(120)
  const [loading, setLoading]     = useState(false)
  const [error, setError]   = useState('')
  const [result, setResult] = useState<{
    post: string
    imageGuidance: { type: 'prompt' | 'idea'; content: string }
  } | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res  = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, pillar, voiceType, wordLimit }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setResult(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl page-enter">
      <div>
        <h1 className="font-display font-800 text-3xl" style={{ color: 'var(--text)' }}>
          Fetch Content
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Generate X posts with DeepSeek. Strong hooks, human voice, no fluff.
        </p>
      </div>

      <div className="card space-y-6">
        {/* Topic */}
        <div>
          <label className="label">Topic or idea</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="e.g. why most web3 job hunters fail before they even apply"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

        {/* Voice type */}
        <div>
          <label className="label">Account type</label>
          <div className="flex gap-2">
            {([
              { id: 'personal' as const, label: 'Personal', sub: 'I / me' },
              { id: 'brand'    as const, label: 'Brand',    sub: 'We / our' },
            ]).map(v => (
              <button key={v.id} onClick={() => setVoiceType(v.id)}
                      className="flex-1 text-left px-4 py-2.5 rounded-xl border transition-all"
                      style={{
                        background:  voiceType === v.id ? 'rgba(245,158,11,0.15)' : 'var(--bg)',
                        borderColor: voiceType === v.id ? 'rgba(245,158,11,0.55)' : 'var(--border)',
                        color:       voiceType === v.id ? 'var(--primary)'         : 'var(--text-muted)',
                      }}>
                <div className="font-semibold text-sm">{v.label}</div>
                <div className="text-xs opacity-60">{v.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pillar selector */}
        <div>
          <label className="label">Content pillar</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PILLARS.map(p => (
              <button
                key={p.id}
                onClick={() => setPillar(p.id)}
                className="text-left px-4 py-3 rounded-xl border transition-all"
                style={{
                  background:     pillar === p.id ? 'rgba(245,158,11,0.12)' : 'var(--bg)',
                  borderColor:    pillar === p.id ? 'rgba(245,158,11,0.5)' : 'var(--border)',
                  color:          pillar === p.id ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Word limit */}
        <div>
          <label className="label">Word limit: <span style={{ color: 'var(--primary)' }}>{wordLimit} words</span></label>
          <input
            type="range" min={60} max={300} step={10}
            value={wordLimit}
            onChange={e => setWordLimit(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            <span>60</span><span>120</span><span>180</span><span>240</span><span>300</span>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="btn-primary w-full justify-center py-3"
        >
          {loading ? <DogLoader label="Bingo is writing..." /> : <><PawPrint size={15} /> Generate post</>}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Post */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>
                Your X Post
              </h2>
              <button
                onClick={() => copy(result.post)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text)', fontFamily: 'Nunito, sans-serif', lineHeight: '1.8' }}
            >
              {result.post}
            </p>
          </div>

          {/* Image guidance */}
          <div className="card" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              {result.imageGuidance.type === 'prompt'
                ? <ImageIcon size={16} style={{ color: 'var(--primary)' }} />
                : <Lightbulb  size={16} style={{ color: 'var(--primary)' }} />}
              <h3 className="font-display font-700" style={{ color: 'var(--primary)' }}>
                {result.imageGuidance.type === 'prompt' ? 'DALL-E 3 Image Prompt' : 'Image Idea'}
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {result.imageGuidance.content}
            </p>
            {result.imageGuidance.type === 'prompt' && (
              <button
                onClick={() => copy(result.imageGuidance.content)}
                className="btn-secondary text-xs py-1.5 px-3 mt-3"
              >
                <Copy size={12} /> Copy prompt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
