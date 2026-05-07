'use client'

import { useState, useEffect, useCallback } from 'react'

interface Competitor {
  _id: string
  name: string
  platform: string
  handle: string
  url: string
  lastAnalyzed?: string
  insights?: {
    postingFrequency: string
    topTopics: string[]
    contentStyle: string
    avgEngagement: string
    sponsoredPostsDetected: number
    sponsoredIndicators: string[]
    recommendations: string[]
    summary: string
  }
}

const PLATFORMS = ['Twitter/X', 'Instagram', 'Telegram', 'Discord', 'LinkedIn', 'TikTok', 'YouTube']

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    platform: 'Twitter/X',
    handle: '',
    url: '',
  })

  const load = useCallback(async () => {
    const res = await fetch('/api/competitors')
    const json = await res.json()
    setCompetitors(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    setError('')
    const res = await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Failed to add')
      return
    }
    setCompetitors((prev) => [json.data, ...prev])
    setForm({ name: '', platform: 'Twitter/X', handle: '', url: '' })
    setShowForm(false)
  }

  async function remove(id: string) {
    if (!confirm('Remove this competitor?')) return
    await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
    setCompetitors((prev) => prev.filter((c) => c._id !== id))
  }

  async function analyze(id: string) {
    setAnalyzing(id)
    setError('')
    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId: id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setCompetitors((prev) => prev.map((c) => (c._id === id ? json.data : c)))
      setExpanded(id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setAnalyzing(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Analyze competitor pages, identify content patterns, and filter out sponsorships.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Add competitor
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold">Add competitor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                placeholder="Competitor name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Platform</label>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Handle</label>
              <input
                className="input"
                placeholder="@username"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Profile URL</label>
              <input
                className="input"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} className="btn-primary">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {competitors.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="font-semibold mb-2">No competitors added yet</h2>
          <p className="text-gray-400 text-sm">
            Add competitors to analyze their content strategy and find opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {competitors.map((c) => (
            <div key={c._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    @{c.handle} · {c.platform}
                  </p>
                  {c.lastAnalyzed && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last analyzed {new Date(c.lastAnalyzed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => analyze(c._id)}
                    disabled={analyzing === c._id}
                    className="btn-secondary text-sm"
                  >
                    {analyzing === c._id ? 'Analyzing...' : 'Analyze'}
                  </button>
                  <button onClick={() => remove(c._id)} className="btn-danger text-sm">
                    Remove
                  </button>
                </div>
              </div>

              {c.insights && (
                <>
                  <button
                    onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                    className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    {expanded === c._id ? 'Hide analysis ↑' : 'View analysis ↓'}
                  </button>

                  {expanded === c._id && (
                    <div className="mt-4 space-y-4 border-t border-gray-800 pt-4">
                      <p className="text-sm text-gray-300">{c.insights.summary}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Posting frequency</p>
                          <p className="text-sm">{c.insights.postingFrequency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Avg engagement</p>
                          <p className="text-sm capitalize">{c.insights.avgEngagement}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Top topics</p>
                        <div className="flex flex-wrap gap-2">
                          {c.insights.topTopics.map((t) => (
                            <span
                              key={t}
                              className="badge bg-gray-800 text-gray-300 border-gray-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Content style</p>
                        <p className="text-sm text-gray-300">{c.insights.contentStyle}</p>
                      </div>

                      {c.insights.sponsoredPostsDetected > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                          <p className="text-sm text-orange-400 font-medium mb-2">
                            {c.insights.sponsoredPostsDetected} sponsored post(s) detected
                          </p>
                          <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                            {c.insights.sponsoredIndicators.map((s, i) => (
                              <li key={i} className="truncate">{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Recommendations</p>
                        <ul className="space-y-1">
                          {c.insights.recommendations.map((r, i) => (
                            <li key={i} className="text-sm text-gray-300 flex gap-2">
                              <span className="text-indigo-400">→</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
