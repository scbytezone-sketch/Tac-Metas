import type { Activity } from './types'

// Reusing logic from calc.ts manually to avoid circular deps or just for clarity
// But ideally we should import if possible. Let's just implement the daily cap logic here as requested.

export function getWeeklyPoints(
  start: Date,
  end: Date,
  activities: Activity[]
) {
  const weeks: { name: string; positive: number }[] = []
  
  // Create buckets (Week 1, Week 2, ...)
  // We iterate day by day.
  const current = new Date(start)
  // Reset time to avoid issues
  current.setHours(0, 0, 0, 0)
  
  const endDate = new Date(end)
  endDate.setHours(23, 59, 59, 999)

  let weekIndex = 1
  let dayCount = 0
  let currentWeek = { name: `Sem ${weekIndex}`, positive: 0 }
  
  // Map activities/penalties by date for faster lookup
  const actsByDate = new Map<string, number>()
  activities.forEach(a => {
    const d = a.dateISO
    actsByDate.set(d, (actsByDate.get(d) || 0) + a.points)
  })

  while (current <= endDate) {
    const dateISO = current.toISOString().slice(0, 10)
    
    // Calculate daily positive (capped at 15)
    const rawPoints = actsByDate.get(dateISO) || 0
    const cappedPoints = Math.min(15, rawPoints)
    
    currentWeek.positive += cappedPoints

    dayCount++
    
    // Move to next day
    current.setDate(current.getDate() + 1)
    
    // Check if week is full (7 days) or if we hit the end
    if (dayCount === 7 || current > endDate) {
      weeks.push(currentWeek)
      weekIndex++
      currentWeek = { name: `Sem ${weekIndex}`, positive: 0 }
      dayCount = 0
    }
  }

  return weeks
}

export function getServiceDistribution(activities: Activity[]) {
  const distribution = new Map<string, number>()
  
  activities.forEach(a => {
    const type = formatServiceType(a.serviceType)
    distribution.set(type, (distribution.get(type) || 0) + 1)
  })

  return Array.from(distribution.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value)
}

function formatServiceType(type: string) {
  switch (type) {
    case 'INSTALACAO': return 'Instalação'
    case 'MANUTENCAO': return 'Manutenção'
    case 'RETIRADA': return 'Retirada'
    default: return type
  }
}

export function getDailyCumulative(
  start: Date,
  end: Date,
  activities: Activity[]
) {
  const data: { day: string; total: number }[] = []
  
  const current = new Date(start)
  current.setHours(0,0,0,0)
  
  const endDate = new Date(end)
  endDate.setHours(23,59,59,999)
  
  let runningTotal = 0

  const actsByDate = new Map<string, number>()
  activities.forEach(a => {
    const d = a.dateISO
    actsByDate.set(d, (actsByDate.get(d) || 0) + a.points)
  })

  while (current <= endDate) {
    const dateISO = current.toISOString().slice(0, 10)
    
    const rawPos = actsByDate.get(dateISO) || 0
    const cappedPos = Math.min(15, rawPos)
    
    runningTotal += cappedPos
    
    data.push({
      day: current.getDate().toString(), // Just the day number
      total: runningTotal
    })

    current.setDate(current.getDate() + 1)
  }
  
  return data
}
