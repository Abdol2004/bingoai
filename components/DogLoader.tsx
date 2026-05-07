'use client'

import { PawPrint } from 'lucide-react'

interface DogLoaderProps {
  size?: 'xs' | 'sm' | 'md'
  label?: string
}

const SIZES = { xs: 10, sm: 13, md: 18 }

export default function DogLoader({ size = 'sm', label }: DogLoaderProps) {
  const s = SIZES[size]
  return (
    <span className="dog-run inline-flex items-center gap-1.5">
      {[0, 1, 2, 3].map(i => (
        <PawPrint
          key={i}
          size={s}
          className="paw-step"
          style={{ animationDelay: `${i * 0.18}s`, color: 'currentColor' }}
          strokeWidth={2}
        />
      ))}
      {label && <span className="ml-1 opacity-80">{label}</span>}
    </span>
  )
}
