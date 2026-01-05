import { ArrowLeft, ArrowRight, FileDown, Plus, Timer, TrendingUp, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Card from '../components/Card'
import { useApp } from '../app/context'
import { calcSummary } from '../app/calc'
import { getCycleFromAnchor, shiftAnchor, isWithin } from '../app/dates'
import { useNavigate } from 'react-router-dom'
import { generatePdf } from '../app/pdf'
import DashboardCharts from '../components/DashboardCharts'
import MotionButton from '../components/MotionButton'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { start, end, label } = getCycleFromAnchor(state.selectedPeriodAnchorISO)
  const summary = calcSummary(state, start, end)

  const periodActivities = state.activities.filter((a) => isWithin(a.dateISO, start, end))

  function handlePdf() {
    generatePdf({
      summary,
      periodLabel: label,
      activities: periodActivities,
      overtime: state.overtimeLogs.filter((o) => isWithin(o.dateISO, start, end)),
      user: state.user,
    })
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-[#0B0F14] transition-colors duration-300">
      <Header title="Dashboard" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 pt-3 space-y-6 pb-32"
      >
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-2 px-1">
             <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
               <Calendar size={16} />
               <span className="text-xs font-medium uppercase tracking-wider">Período Selecionado</span>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm">
            <MotionButton
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              onClick={() => dispatch({ type: 'SET_PERIOD', payload: shiftAnchor(state.selectedPeriodAnchorISO, -1) })}
            >
              <ArrowLeft size={20} />
            </MotionButton>
            
            <div className="text-center">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{label}</p>
            </div>

            <MotionButton
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              onClick={() => dispatch({ type: 'SET_PERIOD', payload: shiftAnchor(state.selectedPeriodAnchorISO, 1) })}
            >
              <ArrowRight size={20} />
            </MotionButton>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid gap-4">
          {/* Hero Metrics Card */}
          <div className="relative overflow-hidden rounded-3xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
             <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
             
             <div className="relative p-6">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-brand-light font-medium text-sm mb-1">Pontuação Total</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-bold tracking-tight">{summary.pontuacaoTotal.toFixed(1)}</span>
                     <span className="text-lg opacity-80">pts</span>
                   </div>
                 </div>
                 <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${summary.statusApto ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-50'}`}>
                    {summary.statusApto ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {summary.statusApto ? 'APTO' : 'NÃO APTO'}
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex justify-between text-sm opacity-90">
                   <span>Meta Ajustada</span>
                   <span className="font-semibold">{summary.metaAjustada.toFixed(1)} pts</span>
                 </div>
                 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((summary.pontuacaoTotal / (summary.metaAjustada || 1)) * 100, 100)}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-white rounded-full"
                   />
                 </div>
                 <div className="flex justify-between text-xs opacity-60 pt-1">
                   <span>Base: {summary.metaBase}</span>
                   <span>Extra: +{summary.extraAjuste.toFixed(1)}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="flex flex-col gap-2 border-none bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
               <div className="absolute right-0 top-0 p-2 opacity-5">
                 <TrendingUp size={40} />
               </div>
               <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Positivos</span>
               <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.pontosPositivos.toFixed(1)}</span>
            </Card>
            
            <Card className="flex flex-col gap-2 border-none bg-white dark:bg-slate-900 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => navigate('/overtime')}>
               <div className="absolute right-0 top-0 p-2 opacity-5">
                 <Timer size={40} />
               </div>
               <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Horas Extras</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-brand-primary">{(summary.horasExtrasMin / 60).toFixed(1)}</span>
                 <span className="text-xs text-slate-400">h</span>
               </div>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="flex items-center gap-2 px-1 mb-3 text-slate-500 dark:text-slate-400">
            <TrendingUp size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Desempenho</span>
          </div>
          <DashboardCharts
            activities={periodActivities}
            start={start}
            end={end}
            metaAjustada={summary.metaAjustada}
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <MotionButton 
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-brand-primary/30 active:scale-[0.98] transition-all group"
            onClick={handlePdf}
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
              <FileDown size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Gerar PDF</span>
          </MotionButton>

          <MotionButton 
            className="flex flex-col items-center justify-center gap-2 p-4 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 active:scale-[0.98] transition-all"
            onClick={() => navigate('/nova-atividade')}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-xs font-semibold">Nova Atividade</span>
          </MotionButton>
        </motion.div>
      </motion.div>
    </div>
  )
}
