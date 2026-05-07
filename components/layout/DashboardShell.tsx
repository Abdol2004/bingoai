'use client'

import { useState } from 'react'
import { Menu, PawPrint, X } from 'lucide-react'
import Sidebar from './Sidebar'
import NavigationLoader from '@/components/NavigationLoader'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <NavigationLoader />

      {/* ── Desktop sidebar (normal flow, hidden on mobile) ── */}
      <div className="hidden md:block md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className="md:hidden fixed inset-y-0 left-0 z-50"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 w-full">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center justify-between sticky top-0 z-30 px-4"
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            height: '56px',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                boxShadow: '0 3px 10px rgba(245,158,11,0.4)',
              }}
            >
              <PawPrint size={15} style={{ color: '#0d0804' }} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-xl" style={{ color: 'var(--primary)' }}>
              Bingo
            </span>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto px-4 py-5 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
