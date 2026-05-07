'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatTime, getPlatformColor, getStatusColor } from '@/lib/utils'
import {
  PawPrint, Link2, CalendarDays, CheckCircle2, Clock,
  ArrowRight, Zap, TrendingUp,
} from 'lucide-react'

interface CalendarWeek {
  _id: string
  weekStart: string
  status: string
}

interface Post {
  _id: string
  platform: string
  topic: string
  scheduledAt: string
  status: string
}

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType
  value: number
  label: string
  color: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} strokeWidth={2} />
      </div>
      <div>
        <div className="font-display font-800 text-3xl leading-none" style={{ color: 'var(--text)' }}>
          {value}
        </div>
        <div className="text-xs mt-1 font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
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
          setRecentPosts(postsData.data?.posts?.slice(0, 5) ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const connectedCount = workspace
    ? Object.values(workspace.platforms).filter((v) => v.enabled).length
    : 0

  const stats = [
    { icon: Link2,        value: connectedCount,                                    label: 'Platforms linked',  color: '#f59e0b' },
    { icon: CalendarDays, value: recentPosts.length,                                label: 'Posts this week',   color: '#a78bfa' },
    { icon: CheckCircle2, value: recentPosts.filter(p => p.status === 'sent').length, label: 'Sent by Bingo',  color: '#86efac' },
    { icon: Clock,        value: recentPosts.filter(p => p.status === 'approved').length, label: 'Scheduled', color: '#fbbf24' },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <PawPrint size={32} className="animate-paw-bounce" style={{ color: 'var(--primary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bingo is fetching your dashboard...</p>
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-3xl" style={{ color: 'var(--text)' }}>
            Hey {firstName}! <span style={{ color: 'var(--primary)' }}>Bingo&apos;s ready.</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {workspace?.niche
              ? `Woof! Managing content for ${workspace.niche}`
              : 'Set up your workspace and unleash the good boy.'}
          </p>
        </div>
        <PawPrint size={28} className="animate-float hidden md:block" style={{ color: 'var(--primary)', opacity: 0.6 }} />
      </div>

      {/* Setup banner */}
      {!workspace?.niche && (
        <div className="card" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.06)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-700 text-lg" style={{ color: 'var(--primary)' }}>
                Bingo needs his leash
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Set your niche and connect your platforms so Bingo can get to work.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/strategy" className="btn-primary text-sm"><Zap size={14} /> Setup Strategy</Link>
              <Link href="/connect" className="btn-secondary text-sm"><Link2 size={14} /> Connect</Link>
            </div>
          </div>
        </div>
      )}

      {/* Approval banner */}
      {latestCalendar?.status === 'pending_approval' && (
        <div className="card animate-pulse-warm"
             style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays size={20} style={{ color: 'var(--warning)' }} />
              <div>
                <h2 className="font-display font-700" style={{ color: 'var(--warning)' }}>
                  Bingo fetched your calendar!
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Week of {formatDate(latestCalendar.weekStart)} is ready — approve it to release the posts.
                </p>
              </div>
            </div>
            <Link href={`/calendar`} className="btn-primary text-sm shrink-0">
              Review now <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} color={s.color} />
        ))}
      </div>

      {/* Posts list */}
      {recentPosts.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text)' }}>
                Upcoming posts
              </h2>
            </div>
            <Link href="/calendar" className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: 'var(--primary)' }}>
              Full calendar <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-0">
            {recentPosts.map((post, i) => (
              <div key={post._id}
                   className="flex items-center gap-4 py-3.5"
                   style={{ borderBottom: i < recentPosts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className={`badge ${getPlatformColor(post.platform)}`}>
                  {post.platform}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {post.topic}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(post.scheduledAt)} · {formatTime(post.scheduledAt)}
                  </p>
                </div>
                <span className={`badge ${getStatusColor(post.status)}`}>{post.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : workspace?.niche ? (
        <div className="card text-center py-16">
          <PawPrint size={44} className="mx-auto mb-4 animate-paw-bounce" style={{ color: 'var(--primary)', opacity: 0.5 }} />
          <h2 className="font-display font-700 text-xl mb-2" style={{ color: 'var(--text)' }}>
            Bingo is waiting for his first job
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Generate your first content calendar and let him fetch those posts.
          </p>
          <Link href="/calendar" className="btn-primary">
            <CalendarDays size={16} /> Generate calendar
          </Link>
        </div>
      ) : null}
    </div>
  )
}
