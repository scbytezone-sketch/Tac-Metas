export type Role =
  | 'TECNICO_INSTALACAO'
  | 'TECNICO_MANUTENCAO'
  | 'AJUDANTE_INSTALACAO'
  | 'AJUDANTE_MANUTENCAO'

export type ServiceType =
  | 'INSTALACAO'
  | 'MANUTENCAO'
  | 'RETIRADA'

export type Complexity = 'SIMPLES' | 'COMPLEXA'

export interface UserProfile {
  id: string
  name: string
  role: Role
}

export interface Activity {
  id: string
  dateISO: string
  osNumber: string
  serviceType: ServiceType
  complexity: Complexity
  points: number
  notes?: string
}

export type OvertimeType = 'INICIO' | 'FIM'

export interface OvertimeLog {
  id: string
  dateISO: string
  type: OvertimeType
  timeHHmm: string
  notes?: string
  pairId?: string
  durationMinutes?: number
}

export interface AppState {
  user?: UserProfile
  activities: Activity[]
  overtimeLogs: OvertimeLog[]
  selectedPeriodAnchorISO: string
  theme: 'light' | 'dark'
}

export type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'ADD_OVERTIME'; payload: OvertimeLog }
  | { type: 'DELETE_OVERTIME'; payload: string }
  | { type: 'SET_PERIOD'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOGS_FROM_SERVER'; payload: { activities: Activity[]; overtimeLogs: OvertimeLog[] } }
