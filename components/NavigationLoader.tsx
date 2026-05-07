'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PawPrint } from 'lucide-react'

const MESSAGES = [
  'Bingo is running...',
  'Fetching the good stuff...',
  'On it, hold tight...',
  'Sniffing out your content...',
]

export default function NavigationLoader() {
  const [visible, setVisible]   = useState(false)
  const [msg]                   = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
  const pathname                = usePathname()

  // Hide as soon as the new page pathname is active
  useEffect(() => {
    setVisible(false)
  }, [pathname])

  // Show immediately on any internal <a> click
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href') ?? ''
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return
      // Skip if same page
      if (href === window.location.pathname) return
      setVisible(true)
    }

    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-5"
      style={{ background: 'rgba(13,8,4,0.94)', backdropFilter: 'blur(6px)' }}
    >
      <div className="font-display font-extrabold text-3xl" style={{ color: 'var(--primary)' }}>
        Bingo
      </div>
      <div className="paw-track">
        {[0, 1, 2, 3, 4].map((i) => (
          <PawPrint
            key={i}
            className="paw"
            size={20}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{msg}</p>
    </div>
  )
}
