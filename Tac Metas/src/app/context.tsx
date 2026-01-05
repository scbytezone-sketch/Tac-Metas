import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { AppAction, AppState, Activity, OvertimeLog } from './types'
import { loadState, useDebouncedSave } from './storage'
import { ensureOvertimeDuration } from './calc'
import { getInitialTheme, applyTheme } from './theme'
import { fetchLogsForPeriod } from '../services/fetchLogs'
import { getPeriodRangeISO } from '../utils/period'
import { logsService } from '../services/logs'

const STORAGE_KEY = 'tac-metas-state'

const todayISO = new Date().toISOString().slice(0, 10)

const initialState: AppState = {
  user: undefined,
  activities: [],
  overtimeLogs: [],
  selectedPeriodAnchorISO: todayISO,
  theme: getInitialTheme(),
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] }
    case 'ADD_OVERTIME': {
      const withDuration = ensureOvertimeDuration(action.payload, state.overtimeLogs)
      return { ...state, overtimeLogs: [withDuration, ...state.overtimeLogs] }
    }
    case 'DELETE_OVERTIME':
      return {
        ...state,
        overtimeLogs: state.overtimeLogs.filter((l) => l.id !== action.payload),
      }
    case 'SET_PERIOD':
      return { ...state, selectedPeriodAnchorISO: action.payload }
    case 'SET_THEME':
      // Reducer only updates state, side effects handled in component/toggle
      return { ...state, theme: action.payload }
    case 'SET_LOGS_FROM_SERVER':
      return {
        ...state,
        activities: action.payload.activities,
        overtimeLogs: action.payload.overtimeLogs
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
}>({ state: initialState, dispatch: () => undefined })

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial Load: Get theme from storage or system preference
  const persisted = useMemo(() => {
    // We STILL load from local storage to get THEME preference and potentially user data if cached,
    // BUT we will overwrite activities/logs from server.
    const loaded = loadState<AppState>(STORAGE_KEY, initialState)
    loaded.theme = getInitialTheme()
    return loaded
  }, [])
  
  const [state, dispatch] = useReducer(reducer, persisted)

  // 2. Ensure theme is applied when state changes (sync source of truth)
  useEffect(() => {
    applyTheme(state.theme)
  }, [state.theme])

  // 3. PERSISTENCE: We only save THEME and maybe USER to localStorage now.
  // We do NOT want to overwrite "activities" in localStorage because we want to kill that dependency.
  // However, `useDebouncedSave` saves the whole state.
  // To avoid breaking existing logic, we can keep saving it, but we MUST ensure we fetch from server on mount.
  // Actually, better to migrate: if we have local logs, push them to queue, then clear local.
  useDebouncedSave(state, STORAGE_KEY, 300)

  useEffect(() => {
    document.body.classList.add('transition-colors', 'duration-300')
  }, [])

  // 4. FETCH LOGS FROM SUPABASE
  useEffect(() => {
    if (!state.user) return

    // Use the new Period Util that returns strict ISO UTC strings
    const { startISO, endISO } = getPeriodRangeISO(state.selectedPeriodAnchorISO)
    
    async function load() {
      try {
        const logs = await fetchLogsForPeriod(startISO, endISO)
        
        // Transform DB logs to App Types
        const activities: Activity[] = []
        const overtimeLogs: OvertimeLog[] = []

        logs.forEach((log: any) => {
          if (log.type === 'ACTIVITY') {
            activities.push({
              ...log.payload,
            })
          } else if (log.type === 'OVERTIME' || log.type === 'INICIO' || log.type === 'FIM') {
            overtimeLogs.push(log.payload)
          }
        })

        dispatch({ 
          type: 'SET_LOGS_FROM_SERVER', 
          payload: { activities, overtimeLogs } 
        })
      } catch (err) {
        console.error('Failed to fetch logs', err)
      }
    }

    load()
  }, [state.user, state.selectedPeriodAnchorISO])

  // 5. MIGRATION (One-time)
  useEffect(() => {
    const migrated = localStorage.getItem('tac-metas-migrated-v2')
    if (migrated === 'true' || !state.user) return

    // Check if we have legacy local data that needs syncing
    // We can read from `persisted` or `state` (initial render state)
    // If we have items in state.activities/overtimeLogs that are NOT in Supabase yet...
    // But this is hard to know.
    // Simplest approach: If we haven't migrated, take ALL local items and enqueue them.
    // The anti-duplication logic in `logsService` (UNIQUE constraint) will prevent duplicates on server.
    
    async function migrate() {
      console.log('Starting migration v2...')
      
      const allActivities = state.activities
      const allOvertime = state.overtimeLogs

      // We need to map them to PendingLog and enqueue
      // We don't have cargo_id easily here unless we fetch profile.
      // But logsService.createLogOnlineOrQueue fetches it if missing.
      
      for (const act of allActivities) {
        await logsService.createLogOnlineOrQueue({
          type: 'ACTIVITY',
          points_awarded: act.points,
          payload: act,
          // cargo_id: will be fetched
        })
      }

      for (const ot of allOvertime) {
         await logsService.createLogOnlineOrQueue({
          type: 'OVERTIME',
          points_awarded: 0,
          payload: ot
        })
      }

      localStorage.setItem('tac-metas-migrated-v2', 'true')
      console.log('Migration v2 complete')
      
      // Trigger sync immediately
      logsService.syncPendingLogs()
    }

    // Only migrate if we have something
    if (state.activities.length > 0 || state.overtimeLogs.length > 0) {
      migrate()
    } else {
       // If empty, just mark as migrated so we don't try again
       localStorage.setItem('tac-metas-migrated-v2', 'true')
    }

  }, [state.user]) // Run once when user is available

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function isBrowser() {
  return typeof window !== 'undefined'
}
