import { useEffect } from 'react'
import AppRouter from './router'
import { AppProvider, useApp } from './context'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { logsService } from '../services/logs'

function AppContent() {
  const { user } = useAuth()
  const { state, dispatch } = useApp()

  // Sync Supabase Auth user to App State (so existing logic works)
  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER', payload: user })
    }
  }, [user, dispatch])

  // Migration Logic
  useEffect(() => {
    async function runMigration() {
      if (!user) return
      const migrated = localStorage.getItem('tac-metas-migrated')
      if (migrated === 'true') return

      console.log('Starting migration...')
      
      // Migrate Activities
      for (const act of state.activities) {
        // Avoid re-uploading if it looks like it came from server (check ID format?)
        // But for now, just upload all local ones.
        // We use createLog which handles the upload.
        await logsService.createLog('ACTIVITY', act.points, act)
      }

      // Migrate Overtime
      for (const ot of state.overtimeLogs) {
         // For overtime, points are 0 in the log entry itself
         await logsService.createLog('OVERTIME', 0, ot)
      }

      localStorage.setItem('tac-metas-migrated', 'true')
      console.log('Migration complete')
    }

    // Only run if we have local data and user is logged in
    if (user && (state.activities.length > 0 || state.overtimeLogs.length > 0)) {
      runMigration()
    }
  }, [user, state.activities, state.overtimeLogs])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F14] dark:text-slate-100 transition-colors duration-300">
      <AppRouter />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}
