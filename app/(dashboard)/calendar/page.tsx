'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'
import {
  PawPrint, Plus, Check, Trash2, Pencil, X as XIcon,
  Loader2, CalendarDays, Copy, Zap,
} from 'lucide-react'
import { format, addDays } from 'date-fns'

type Pillar = 'educational' | 'engagement' | 'ragebait' | 'value'

const PILLAR_COLORS: Record<Pillar, string> = {
  educational: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  engagement:  'bg-violet-500/20 text-violet-300 border-violet-500/30',
  ragebait:    'bg-rose-500/20 text-rose-300 border-rose-500/30',
  value:       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

const ALL_PILLARS: { id: Pillar; label: string }[] = [
  { id: 'educational', label: 'Educational' },
  { id: 'engagement',  label: 'Engagement' },
  { id: 'ragebait',    label: 'Ragebait' },
  { id: 'value',       label: 'Value' },
]

interface Post {
  _id: string
  platform: string
  topic: string
  contentBrief: string
  contentPillar?: Pillar
  imagePrompt?: string
  caption?: string
  scheduledAt: string
  status: string
}

interface CalendarWeek {
  _id: string
  weekStart: string
  weekEnd: string
  status: string
  overallStrategy: string
}

export default function CalendarPage() {
  const [calendars, setCalendars]         = useState<CalendarWeek[]>([])
  const [selected, setSelected]           = useState<string | null>(null)
  const [posts, setPosts]                 = useState<Post[]>([])
  const [loading, setLoading]             = useState(true)
  const [generating, setGenerating]       = useState(false)
  const [approving, setApproving]         = useState(false)
  const [error, setError]                 = useState('')
  const [showGenModal, setShowGenModal]   = useState(false)
  const [editPost, setEditPost]           = useState<Post | null>(null)

  // Caption state per post
  const [captionLoading, setCaptionLoading] = useState<string | null>(null)
  const [captions, setCaptions]             = useState<Record<string, string>>({})
  const [copied, setCopied]                 = useState<string | null>(null)

  // Generate modal state
  const today    = format(new Date(), 'yyyy-MM-dd')
  const nextWeek = format(addDays(new Date(), 6), 'yyyy-MM-dd')
  const [startDate, setStartDate]   = useState(today)
  const [endDate, setEndDate]       = useState(nextWeek)
  const [postsPerDay, setPostsPerDay] = useState(1)
  const [postTimes, setPostTimes]   = useState(['10:00', '18:00', '21:00'])
  const [selectedPillars, setSelectedPillars] = useState<Pillar[]>(['educational','engagement','value','ragebait'])
  const [voiceType, setVoiceType]             = useState<'personal' | 'brand' | null>(null)

  const loadCalendars = useCallback(async () => {
    const res  = await fetch('/api/calendar')
    const json = await res.json()
    const list: CalendarWeek[] = json.data ?? []
    setCalendars(list)
    if (list.length > 0 && !selected) {
      const stored = sessionStorage.getItem('selectedCalendarId')
      sessionStorage.removeItem('selectedCalendarId')
      const found = stored && list.find(c => c._id === stored)
      setSelected(found ? stored : list[0]._id)
    }
    setLoading(false)
  }, [selected])

  const loadPosts = useCallback(async (id: string) => {
    const res  = await fetch(`/api/calendar/${id}`)
    const json = await res.json()
    const fetched: Post[] = json.data?.posts ?? []
    setPosts(fetched)
    // Restore any already-generated captions
    const map: Record<string, string> = {}
    fetched.forEach(p => { if (p.caption) map[p._id] = p.caption })
    setCaptions(prev => ({ ...prev, ...map }))
  }, [])

  useEffect(() => { loadCalendars() }, [loadCalendars])
  useEffect(() => { if (selected) loadPosts(selected) }, [selected, loadPosts])

  const selectedCal = calendars.find(c => c._id === selected)

  function updateTime(index: number, value: string) {
    setPostTimes(prev => prev.map((t, i) => i === index ? value : t))
  }

  function togglePillar(p: Pillar) {
    setSelectedPillars(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function generateCalendar() {
    if (!voiceType) { setError('Please select account type first'); return }
    if (selectedPillars.length === 0) { setError('Select at least one content pillar'); return }
    setGenerating(true); setError(''); setShowGenModal(false)
    try {
      const res  = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate, endDate,
          postTimes: postTimes.slice(0, postsPerDay),
          postsPerDay,
          pillars: selectedPillars,
          voiceType,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      await loadCalendars()
      setSelected(json.data.calendar._id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  async function approveCalendar() {
    if (!selected) return
    setApproving(true); setError('')
    try {
      const res  = await fetch(`/api/calendar/${selected}/approve`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      await loadCalendars()
      await loadPosts(selected)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve')
    } finally { setApproving(false) }
  }

  async function deleteCalendar(id: string) {
    if (!confirm('Delete this calendar and all its posts?')) return
    await fetch(`/api/calendar/${id}`, { method: 'DELETE' })
    setCalendars(prev => prev.filter(c => c._id !== id))
    if (selected === id) setSelected(calendars.filter(c => c._id !== id)[0]?._id ?? null)
  }

  async function generateCaption(postId: string) {
    setCaptionLoading(postId)
    try {
      const res  = await fetch(`/api/posts/${postId}/caption`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCaptions(prev => ({ ...prev, [postId]: json.data.caption }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate caption')
    } finally { setCaptionLoading(null) }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function savePostEdit() {
    if (!editPost) return
    await fetch(`/api/posts/${editPost._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: editPost.topic,
        contentBrief: editPost.contentBrief,
        imagePrompt: editPost.imagePrompt,
        scheduledAt: editPost.scheduledAt,
      }),
    })
    setEditPost(null)
    if (selected) loadPosts(selected)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <PawPrint size={30} className="animate-paw-bounce" style={{ color: 'var(--primary)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fetching your calendars...</p>
    </div>
  )

  return (
    <div className="space-y-5 md:space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-3xl" style={{ color: 'var(--text)' }}>Content Calendar</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Plan, preview captions, and approve your X posts.</p>
        </div>
        <button onClick={() => { setVoiceType(null); setShowGenModal(true) }} className="btn-primary" disabled={generating}>
          {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Plus size={14} /> New calendar</>}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Generate modal ── */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg rounded-2xl p-4 md:p-6 space-y-5 overflow-y-auto max-h-[92vh]"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text)' }}>Generate calendar</h2>
              <button onClick={() => setShowGenModal(false)} style={{ color: 'var(--text-muted)' }}><XIcon size={18} /></button>
            </div>

            {/* Account type — must pick first */}
            <div>
              <label className="label">Account type</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'personal', label: 'Personal', sub: 'I / me / my' },
                  { id: 'brand',    label: 'Brand / Company', sub: 'We / our / us' },
                ] as const).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceType(v.id)}
                    className="text-left px-4 py-3 rounded-xl border transition-all"
                    style={{
                      background:  voiceType === v.id ? 'rgba(245,158,11,0.15)' : 'var(--bg)',
                      borderColor: voiceType === v.id ? 'rgba(245,158,11,0.6)'  : 'var(--border)',
                      color:       voiceType === v.id ? 'var(--primary)'         : 'var(--text-muted)',
                    }}
                  >
                    <div className="font-semibold text-sm">{v.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{v.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start date</label>
                <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label">End date</label>
                <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* Posts per day */}
            <div>
              <label className="label">Posts per day</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setPostsPerDay(n)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                          style={{
                            background:  postsPerDay === n ? 'rgba(245,158,11,0.15)' : 'var(--bg)',
                            borderColor: postsPerDay === n ? 'rgba(245,158,11,0.5)'  : 'var(--border)',
                            color:       postsPerDay === n ? 'var(--primary)'         : 'var(--text-muted)',
                          }}>
                    {n} post{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-slot times */}
            <div>
              <label className="label">Posting times</label>
              <div className="space-y-2">
                {Array.from({ length: postsPerDay }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-semibold w-16 shrink-0"
                          style={{ color: 'var(--text-muted)' }}>
                      Post {i + 1}
                    </span>
                    <input type="time" className="input flex-1"
                           value={postTimes[i] ?? '10:00'}
                           onChange={e => updateTime(i, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pillars */}
            <div>
              <label className="label">Content pillars</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_PILLARS.map(p => (
                  <button key={p.id} onClick={() => togglePillar(p.id)}
                          className={`badge cursor-pointer transition-all ${selectedPillars.includes(p.id) ? PILLAR_COLORS[p.id] : 'bg-transparent border-gray-700 text-gray-500'}`}>
                    {selectedPillars.includes(p.id) && <Check size={10} className="mr-1" />}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={generateCalendar} className="btn-primary flex-1 justify-center">
                <PawPrint size={14} /> Generate
              </button>
              <button onClick={() => setShowGenModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {calendars.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarDays size={44} className="mx-auto mb-4" style={{ color: 'var(--primary)', opacity: 0.4 }} />
          <h2 className="font-display font-700 text-xl mb-2" style={{ color: 'var(--text)' }}>No calendar yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Set your strategy first, then generate.</p>
          <button onClick={() => { setVoiceType(null); setShowGenModal(true) }} className="btn-primary">
            <Plus size={14} /> Generate first calendar
          </button>
        </div>
      ) : (
        <>
          {/* Calendar tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {calendars.map(cal => (
              <button key={cal._id} onClick={() => setSelected(cal._id)}
                      className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                      style={{
                        background:  selected === cal._id ? 'rgba(245,158,11,0.12)' : 'var(--bg-card)',
                        borderColor: selected === cal._id ? 'rgba(245,158,11,0.4)'  : 'var(--border)',
                        color:       selected === cal._id ? 'var(--primary)'         : 'var(--text-muted)',
                      }}>
                {formatDate(cal.weekStart)}
                <span className={`ml-2 badge text-xs ${
                  cal.status === 'approved'         ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  cal.status === 'pending_approval' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                }`}>{cal.status.replace('_', ' ')}</span>
              </button>
            ))}
          </div>

          {selectedCal && (
            <>
              {/* Actions bar */}
              <div className="card flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Period focus</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{selectedCal.overallStrategy}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedCal.status === 'pending_approval' && (
                    <button onClick={approveCalendar} disabled={approving} className="btn-primary text-sm">
                      {approving
                        ? <><Loader2 size={13} className="animate-spin" /> Approving...</>
                        : <><Check size={13} /> Approve week</>}
                    </button>
                  )}
                  <button onClick={() => deleteCalendar(selectedCal._id)} className="btn-danger text-sm">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post._id} className="card space-y-0 p-0 overflow-hidden">
                    {/* Post header row */}
                    <div className="flex items-center gap-3 px-5 py-4">
                      {post.contentPillar && (
                        <span className={`badge shrink-0 ${PILLAR_COLORS[post.contentPillar]}`}>
                          {post.contentPillar}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{post.topic}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(post.scheduledAt)} · {formatTime(post.scheduledAt)}
                        </p>
                      </div>
                      <span className={`badge shrink-0 ${getStatusColor(post.status)}`}>{post.status}</span>
                      <button onClick={() => setEditPost({ ...post })}
                              className="shrink-0 p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text-dim)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                        <Pencil size={13} />
                      </button>
                    </div>

                    {/* Caption section */}
                    <div style={{ borderTop: '1px solid var(--border)' }} className="px-5 py-3">
                      {captions[post._id] ? (
                        <div className="space-y-2">
                          <p className="text-sm leading-7 whitespace-pre-wrap"
                             style={{ color: 'var(--text)', fontFamily: 'Nunito, sans-serif' }}>
                            {captions[post._id]}
                          </p>
                          <button
                            onClick={() => copyText(captions[post._id], post._id)}
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            {copied === post._id
                              ? <><Check size={12} /> Copied</>
                              : <><Copy size={12} /> Copy caption</>}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateCaption(post._id)}
                          disabled={captionLoading === post._id}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          {captionLoading === post._id
                            ? <><Loader2 size={12} className="animate-spin" /> Writing...</>
                            : <><Zap size={12} /> Generate caption</>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Edit post modal */}
      {editPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg rounded-2xl p-4 md:p-6 space-y-4"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>Edit post</h3>
              <button onClick={() => setEditPost(null)} style={{ color: 'var(--text-muted)' }}><XIcon size={18} /></button>
            </div>
            <div>
              <label className="label">Topic</label>
              <input className="input" value={editPost.topic}
                     onChange={e => setEditPost({ ...editPost, topic: e.target.value })} />
            </div>
            <div>
              <label className="label">Content brief</label>
              <textarea className="input min-h-[80px] resize-none" value={editPost.contentBrief}
                        onChange={e => setEditPost({ ...editPost, contentBrief: e.target.value })} />
            </div>
            <div>
              <label className="label">Image prompt</label>
              <textarea className="input min-h-[70px] resize-none" value={editPost.imagePrompt ?? ''}
                        onChange={e => setEditPost({ ...editPost, imagePrompt: e.target.value })} />
            </div>
            <div>
              <label className="label">Scheduled time</label>
              <input type="datetime-local" className="input"
                     value={new Date(editPost.scheduledAt).toISOString().slice(0, 16)}
                     onChange={e => setEditPost({ ...editPost, scheduledAt: new Date(e.target.value).toISOString() })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={savePostEdit} className="btn-primary"><Check size={14} /> Save</button>
              <button onClick={() => setEditPost(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
