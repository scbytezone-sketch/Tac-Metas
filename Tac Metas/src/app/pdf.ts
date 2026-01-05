import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Summary } from './calc'
import type { Activity, OvertimeLog, UserProfile } from './types'
import { formatDateShort } from './dates'

interface PdfOptions {
  summary: Summary
  periodLabel: string
  activities: Activity[]
  overtime: OvertimeLog[]
  user?: UserProfile
}

export function generatePdf({ summary, periodLabel, activities, overtime, user }: PdfOptions) {
  const doc = new jsPDF()
  const margin = 14

  doc.setFontSize(14)
  doc.text('Tac Telecom - Painel de Metas', margin, 18)
  doc.setFontSize(10)
  doc.text(`Período: ${periodLabel}`, margin, 26)
  doc.text(`Técnico: ${user?.name ?? '---'} / Cargo: ${user?.role ?? ''}`, margin, 32)

  const s = summary
  doc.text(
    `Resumo -> Positivos: ${s.pontosPositivos.toFixed(1)} | Total: ${s.pontuacaoTotal.toFixed(1)} | Meta Ajustada: ${s.metaAjustada.toFixed(1)} | Status: ${
      s.statusApto ? 'Apto' : 'Não apto'
    }`,
    margin,
    42,
  )

  autoTable(doc, {
    startY: 50,
    head: [['Últimas atividades', 'Data', 'OS', 'Pontos']],
    body: activities.slice(0, 10).map((a) => [a.serviceType, formatDateShort(new Date(a.dateISO)), a.osNumber, a.points]),
    styles: { fontSize: 9 },
  })

  const afterAct = (doc as any).lastAutoTable.finalY + 8
  autoTable(doc, {
    startY: afterAct,
    head: [['Horas Extras', 'Data', 'Hora', 'Min']],
    body: overtime.slice(0, 10).map((o) => [o.type, formatDateShort(new Date(o.dateISO)), o.timeHHmm, o.durationMinutes ?? '-']),
    styles: { fontSize: 9 },
  })

  doc.save('tac-telecom-metas.pdf')
}
