import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPlatformColor(platform: string) {
  const map: Record<string, string> = {
    telegram: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    discord:  'bg-violet-500/20 text-violet-300 border-violet-500/30',
    x:        'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  }
  return map[platform] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    draft:      'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    approved:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    generating: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    sent:       'bg-sky-500/20 text-sky-300 border-sky-500/30',
    failed:     'bg-rose-500/20 text-rose-300 border-rose-500/30',
  }
  return map[status] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
}
