export function parseISO(dateISO: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getCycleFromAnchor(anchorISO: string) {
  const anchor = parseISO(anchorISO)
  const day = anchor.getDate()
  const year = anchor.getFullYear()
  const month = anchor.getMonth()

  const start = day >= 26 ? new Date(year, month, 26) : new Date(year, month - 1, 26)
  const end = day >= 26 ? new Date(year, month + 1, 25, 23, 59, 59) : new Date(year, month, 25, 23, 59, 59)

  const label = `${formatDateShort(start)} a ${formatDateShort(end)}`
  return { start, end, label }
}

export function shiftAnchor(anchorISO: string, direction: -1 | 1) {
  const { start } = getCycleFromAnchor(anchorISO)
  const shifted = new Date(start)
  shifted.setDate(shifted.getDate() + (direction === -1 ? -1 : 35))
  
  const year = shifted.getFullYear()
  const month = String(shifted.getMonth() + 1).padStart(2, '0')
  const day = String(shifted.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateShort(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function isWithin(dateISO: string, start: Date, end: Date) {
  const d = parseISO(dateISO)
  // Normalizar start/end para comparar apenas datas se necessário, 
  // mas aqui start/end já têm horas definidas para início/fim do dia nos usos comuns?
  // Na verdade, isWithin é usado com start (00:00 ou 26th) e end (23:59 ou 25th).
  // d (parseISO) é 00:00:00.
  // Se start for dia 26 00:00 e d for dia 26 00:00 -> ok.
  return d >= start && d <= end
}

export function todayISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTimeLabel(dateISO: string, timeHHmm?: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = (timeHHmm ?? '00:00').split(':').map(Number)
  const date = new Date(y, m - 1, d, hh, mm)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
