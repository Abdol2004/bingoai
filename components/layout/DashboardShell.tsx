'use client'

import { useState } from 'react'
import { Menu, PawPrint } from 'lucide-react'
import Sidebar from './Sidebar'
import NavigationLoader from '@/components/NavigationLoader'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <NavigationLoader />

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 3px 10px rgba(245,158,11,0.35)' }}
            >
              <PawPrint size={15} style={{ color: '#0d0804' }} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-xl" style={{ color: 'var(--primary)' }}>
              Bingo
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
