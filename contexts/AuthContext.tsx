'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  name: string
  email: string
  telegramChatId?: string
  workspaceId?: string
}

interface Workspace {
  _id: string
  name: string
  niche: string
  tone: string
  goals: string[]
  postingFrequency: number
  strategy?: string
  platforms: {
    telegram: { enabled: boolean; channelId?: string }
    discord: { enabled: boolean; channelId?: string; guildId?: string }
    x: { enabled: boolean }
  }
}

interface AuthContextValue {
  user: User | null
  workspace: Workspace | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  workspace: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        setUser(null)
        setWorkspace(null)
        return
      }
      const { data } = await res.json()
      setUser(data.user)
      setWorkspace(data.workspace)
    } catch {
      setUser(null)
      setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setWorkspace(null)
    router.push('/login')
  }, [router])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, workspace, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
