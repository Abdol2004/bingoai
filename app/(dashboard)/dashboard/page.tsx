'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatTime, getPlatformColor, getStatusColor } from '@/lib/utils'
import { PawPrint, Link2, CalendarDays, CheckCircle2, Clock, ArrowRight, Zap, TrendingUp } from 'lucide-react'

interface CalendarWeek { _id: string; weekStart: string; status: string }
interface Post { _id: string; platform: string; topic: string; scheduledAt: string; status: string }

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
  return (
    <div className="card flex items-center gap-3 md:gap-4 p-4 md:p-6">
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      <div>
        <div className="font-display font-extrabold text-2xl md:text-3xl leading-none" style={{ color: 'var(--text)' }}>{value}</div>
        <div className="text-xs mt-1 font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, workspace } = useAuth()
  const [latestCalendar, setLatestCalendar] = useState<CalendarWeek | null>(null)
  const [recentPosts, setRecentPosts]       = useState<Post[]>([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const calRes  = await fetch('/api/calendar')
        const calData = await calRes.json()
        if (calData.data?.length > 0) {
          setLatestCalendar(calData.data[0])
          const postsRes  = await fetch(`/api/calendar/${calData.data[0]._id}`)
          const postsData = await postsRes.json()
          setRecentPosts(postsData.data?.posts?.slice(0, 6) ?? [])
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const connectedCount = workspace
    ? Object.values(workspace.platforms).filter(v => (v as { enabled?: boolean }).enabled).length
    : 0

  const stats = [
    { icon: Link2,        value: connectedCount,                                         label: 'Platforms linked', color: '#f59e0b' },
    { icon: CalendarDays, value: recentPosts.length,                                     label: 'Posts this week',  color: '#a78bfa' },
    { icon: CheckCircle2, value: recentPosts.filter(p => p.status === 'sent').length,    label: 'Sent by Bingo',    color: '#86efac' },
    { icon: Clock,        value: recentPosts.filter(p => p.status === 'approved').length, label: 'Scheduled',       color: '#fbbf24' },
  ]

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <PawPrint size={32} className="animate-paw-bounce" style={{ color: 'var(--primary)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bingo is fetching your dashboard...</p>
    </div>
  )

  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="space-y-5 md:space-y-8 page-enter">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl md:text-3xl" style={{ color: 'var(--text)' }}>
          Hey {firstName}! <span style={{ color: 'var(--primary)' }}>Bingo&apos;s ready.</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {workspace?.niche ? `Managing content for ${workspace.niche}` : 'Set up your workspace to get started.'}
        </p>
      </div>

      {/* Setup banner */}
      {!workspace?.niche && (
        <div className="card" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.06)' }}>
          <h2 className="font-display font-bold text-base md:text-lg mb-1" style={{ color: 'var(--primary)' }}>Bingo needs his leash</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Set your niche and connect your platforms so Bingo can get to work.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/strategy" className="btn-primary text-sm justify-center"><Zap size={14} /> Setup Strategy</Link>
            <Link href="/connect"  className="btn-secondary text-sm justify-center"><Link2 size={14} /> Connect</Link>
          </div>
        </div>
      )}

      {/* Approval banner */}
      {latestCalendar?.status === 'pending_approval' && (
        <div className="card" style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-start gap-3">
              <CalendarDays size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
              <div>
                <h2 className="font-display font-bold" style={{ color: 'var(--warning)' }}>Bingo fetched your calendar!</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Week of {formatDate(latestCalendar.weekStart)} is ready to approve.
                </p>
              </div>
            </div>
            <Link href="/calendar" className="btn-primary text-sm shrink-0 justify-center">
              Review now <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Posts */}
      {recentPosts.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={17} style={{ color: 'var(--primary)' }} />
              <h2 className="font-display font-bold text-base md:text-lg" style={{ color: 'var(--text)' }}>Upcoming posts</h2>
            </div>
            <Link href="/calendar" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              Calendar <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {recentPosts.map((post, i) => (
              <div key={post._id} className="flex items-center gap-3 py-3"
                   style={{ borderBottom: i < recentPosts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className={`badge shrink-0 ${getPlatformColor(post.platform)}`}>{post.platform}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{post.topic}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(post.scheduledAt)} · {formatTime(post.scheduledAt)}
                  </p>
                </div>
                <span className={`badge shrink-0 hidden sm:inline-flex ${getStatusColor(post.status)}`}>{post.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : workspace?.niche ? (
        <div className="card text-center py-12 md:py-16">
          <PawPrint size={40} className="mx-auto mb-4 animate-paw-bounce" style={{ color: 'var(--primary)', opacity: 0.5 }} />
          <h2 className="font-display font-bold text-lg md:text-xl mb-2" style={{ color: 'var(--text)' }}>Bingo is waiting</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Generate your first calendar to get started.</p>
          <Link href="/calendar" className="btn-primary inline-flex"><CalendarDays size={15} /> Generate calendar</Link>
        </div>
      ) : null}
    </div>
  )
}
