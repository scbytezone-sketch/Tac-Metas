import { useMemo, useState } from 'react'
import { FileDown, Target, Trophy, Clock, Wrench, CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import { useApp } from '../app/context'
import { calcSummary } from '../app/calc'
import { formatDateShort, getCycleFromAnchor, parseISO } from '../app/dates'
import { generatePdf } from '../app/pdf'
import MotionButton from '../components/MotionButton'

const tabs = [
  { key: 'today', label: 'De hoje' },
  { key: 'week', label: 'Última semana' },
  { key: 'month', label: 'Mês atual' },
] as const

export default function Reports() {
  const { state } = useApp()
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('month')

  const { start, end, label } = useMemo(() => {
    if (tab === 'today') {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { start, end, label: `${formatDateShort(start)} (hoje)` }
    }
    if (tab === 'week') {
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const start = new Date()
      start.setDate(end.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return { start, end, label: `${formatDateShort(start)} a ${formatDateShort(end)}` }
    }
    return getCycleFromAnchor(state.selectedPeriodAnchorISO)
  }, [tab, state.selectedPeriodAnchorISO])

  const summary = calcSummary(state, start, end)
  const activities = state.activities.filter((a) => {
    const d = parseISO(a.dateISO)
    return d >= start && d <= end
  })
  const overtime = state.overtimeLogs.filter((o) => {
    const d = parseISO(o.dateISO)
    return d >= start && d <= end
  })

  function handlePdf() {
    generatePdf({ summary, periodLabel: label, activities, overtime, user: state.user })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] pb-24 transition-colors duration-300">
      <Header title="Relatórios" />
      <div className="px-4 pt-4 pb-32 space-y-6">
        
        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`relative flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 z-10 ${
                tab === t.key 
                  ? 'text-brand-primary' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setTab(t.key)}
            >
              {tab === t.key && (
                <motion.div
                  layoutId="activeReportTab"
                  className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* Resumo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Target size={16} />
              Resumo do Período
            </h2>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${summary.statusApto ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
              {summary.statusApto ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {summary.statusApto ? 'APTO' : 'NÃO APTO'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <Card className="flex flex-col gap-1 border-none bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy size={48} />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pontos Totais</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{summary.pontuacaoTotal.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">/ {summary.metaAjustada.toFixed(1)}</span>
                </div>
                <div className="mt-2">
                   <ProgressBar value={summary.pontuacaoTotal} max={summary.metaAjustada || 1} />
                </div>
             </Card>
          </div>
        </div>

        {/* Atividades */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Wrench size={16} />
              Atividades
            </h2>
            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
              {activities.length}
            </span>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {activities.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-400">Nenhuma atividade registrada.</p>
              </div>
            )}
            {activities.map((a) => (
              <div key={a.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-start gap-3 shadow-sm hover:border-brand-primary/30 transition-colors">
                <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <Wrench size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-2">
                       #{a.osNumber}
                     </p>
                     <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                       {a.points.toFixed(2)} pts
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{a.serviceType}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {formatDateShort(parseISO(a.dateISO))}
                    </span>
                    {a.notes && <p className="text-[10px] text-slate-400 truncate italic max-w-[150px]">{a.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horas Extras */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock size={16} />
              Horas Extras
            </h2>
            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
              {overtime.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
            {overtime.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-400">Nenhum registro de hora extra.</p>
              </div>
            )}
            {overtime.map((o) => (
              <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-8 rounded-full ${o.type === 'INICIO' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{o.type}</p>
                    <p className="text-[10px] text-slate-400">{formatDateShort(parseISO(o.dateISO))} às {o.timeHHmm}</p>
                  </div>
                </div>
                {o.durationMinutes && (
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-lg">
                    {(o.durationMinutes/60).toFixed(2)}h
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <MotionButton 
            className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 py-3.5" 
            onClick={handlePdf}
          >
            <FileDown size={18} /> 
            <span className="font-semibold tracking-wide">Baixar Relatório PDF</span>
          </MotionButton>
        </div>
      </div>
    </div>
  )
}
