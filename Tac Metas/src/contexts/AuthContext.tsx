import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { logsService } from '../services/logs'
import { supabase } from '../lib/supabaseClient'
import type { UserProfile, Role } from '../app/types'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (u: string, p: string) => Promise<void>
  signUp: (data: { name: string; username: string; password: string; role: Role }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    init()
    
    // Listen for auth changes (external signouts, token expiry, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        // Ensure clean state even if triggered externally
        localStorage.removeItem('pending_logs_v1')
        navigate('/auth', { replace: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  async function init() {
    try {
      const me = await authService.getMe()
      setUser(me)
      if (me) {
        // Attempt to sync pending logs when we confirm user is logged in
        logsService.syncPendingLogs().catch(console.error)
      }
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-sync when coming online
  useEffect(() => {
    function handleOnline() {
      console.log('Online detected, syncing logs...')
      logsService.syncPendingLogs().catch(console.error)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  async function signIn(u: string, p: string) {
    const me = await authService.signIn({ username: u, password: p })
    setUser(me)
    if (me) logsService.syncPendingLogs().catch(console.error)
  }

  async function signUp(data: { name: string; username: string; password: string; role: Role }) {
    const { user: authUser, role } = await authService.signUp(data)
    if (authUser) {
      setUser({ id: authUser.id, name: data.name, role })
    }
  }

  async function signOut() {
    try {
      await authService.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
    
    // Clear local storage as requested
    localStorage.removeItem('pending_logs_v1')
    localStorage.removeItem('tac-metas-migrated')
    localStorage.removeItem('tac-metas-migrated-v2')
    // We do NOT clear 'tac-metas-state' completely because it holds THEME preferences
    
    setUser(null)
    navigate('/auth', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
