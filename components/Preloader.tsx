'use client'

import { useEffect, useState } from 'react'
import { PawPrint } from 'lucide-react'

const MESSAGES = [
  'Bingo is fetching your content...',
  'Sniffing out the best strategy...',
  'Shaking off the competition...',
  'Tail is wagging, almost ready...',
]

export default function Preloader() {
  const [hidden, setHidden] = useState(false)
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`preloader ${hidden ? 'hidden' : ''}`}>
      <div className="preloader-logo">Bingo</div>

      <div className="paw-track">
        {[0, 1, 2, 3, 4].map((i) => (
          <PawPrint key={i} className="paw" size={22} style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>

      <p className="preloader-text">{msg}</p>
    </div>
  )
}
