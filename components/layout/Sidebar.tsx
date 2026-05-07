'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  PawPrint, LayoutDashboard, CalendarDays, Lightbulb,
  PenLine, Search, Link2, LogOut,
} from 'lucide-react'

const nav = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Home Base' },
  { href: '/calendar',    icon: CalendarDays,     label: 'Calendar' },
  { href: '/strategy',    icon: Lightbulb,        label: 'Strategy' },
  { href: '/content',     icon: PenLine,          label: 'Fetch Content' },
  { href: '/competitors', icon: Search,           label: 'Sniff Out' },
  { href: '/connect',     icon: Link2,            label: 'Pack Setup' },
]

export default function Sidebar() {
  const pathname        = usePathname()
  const { user, workspace, logout } = useAuth()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
           style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-3 logo-wag group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                        boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
            <PawPrint size={17} className="wag-icon" style={{ color: '#0d0804' }} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-800 text-lg leading-none" style={{ color: 'var(--primary)' }}>
              Bingo
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-dim)' }}>
              {workspace?.name ?? ''}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                              transition-all duration-150 group
                              ${active ? 'nav-active' : ''}`}
                  style={active
                    ? {}
                    : { color: 'var(--text-muted)' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}>
              <Icon size={17} strokeWidth={2}
                    className={`shrink-0 transition-transform duration-150 ${active ? '' : 'group-hover:scale-110'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1"
             style={{ background: 'rgba(245,158,11,0.06)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-700 text-sm"
               style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(245,158,11,0.3)' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
              {user?.name}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                           font-semibold transition-all"
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--danger)'
                  e.currentTarget.style.background = 'var(--danger-bg)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-dim)'
                  e.currentTarget.style.background = 'transparent'
                }}>
          <LogOut size={15} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
