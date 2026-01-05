import type { Activity, AppState, OvertimeLog } from './types'
import { getMetaByRole } from '../data/meta'
import { isWithin } from './dates'

export interface Summary {
  pontosPositivos: number
  pontuacaoTotal: number
  metaBase: number
  extraAjuste: number
  metaAjustada: number
  statusApto: boolean
  horasExtrasMin: number
}

export function groupByDayCap(activities: Activity[]) {
  const byDay = new Map<string, number>()
  activities.forEach((a) => {
    const prev = byDay.get(a.dateISO) ?? 0
    byDay.set(a.dateISO, prev + a.points)
  })
  let total = 0
  byDay.forEach((sum) => {
    total += Math.min(15, sum)
  })
  return total
}

function sumOvertimeMinutes(logs: OvertimeLog[]) {
  return logs.reduce((acc, l) => acc + (l.durationMinutes ?? 0), 0)
}

export function calcSummary(state: AppState, start: Date, end: Date): Summary {
  const activities = state.activities.filter((a) => isWithin(a.dateISO, start, end))
  const overtime = state.overtimeLogs.filter((o) => isWithin(o.dateISO, start, end))

  const pontosPositivos = groupByDayCap(activities)
  const horasExtrasMin = sumOvertimeMinutes(overtime)
  const horasExtrasHoras = horasExtrasMin / 60
  const extraAjuste = Math.max(0, Math.floor((horasExtrasHoras - 20) / 2)) * 1.0

  const metaBase = getMetaByRole(state.user?.role)
  const metaAjustada = metaBase + extraAjuste
  const pontuacaoTotal = pontosPositivos
  const statusApto = pontuacaoTotal >= metaAjustada

  return {
    pontosPositivos,
    pontuacaoTotal,
    metaBase,
    extraAjuste,
    metaAjustada,
    statusApto,
    horasExtrasMin,
  }
}

export function ensureOvertimeDuration(newLog: OvertimeLog, existing: OvertimeLog[]): OvertimeLog {
  if (newLog.type !== 'FIM') return newLog
  const startMatch = existing.find(
    (l) => l.type === 'INICIO' && l.dateISO === newLog.dateISO && !l.pairId,
  )
  // If not found same day, try to find ANY open start (last one)
  const fallbackStart = !startMatch
    ? existing.find((l) => l.type === 'INICIO' && !l.pairId)
    : startMatch

  if (!fallbackStart) return newLog

  const startDate = new Date(`${fallbackStart.dateISO}T${fallbackStart.timeHHmm}:00`)
  const endDate = new Date(`${newLog.dateISO}T${newLog.timeHHmm}:00`)
  
  let diff = endDate.getTime() - startDate.getTime()
  if (diff < 0) {
    // Midnight crossover
    diff += 24 * 60 * 60 * 1000
  }
  
  const minutes = Math.round(diff / 60000)
  const durationMinutes = minutes

  fallbackStart.pairId = newLog.id
  fallbackStart.durationMinutes = durationMinutes

  return { ...newLog, pairId: fallbackStart.id, durationMinutes }
}

export function getOvertimeMinutesInPeriod(start: Date, end: Date, logs: OvertimeLog[]) {
  const periodLogs = logs.filter((o) => isWithin(o.dateISO, start, end))
  return sumOvertimeMinutes(periodLogs)
}
