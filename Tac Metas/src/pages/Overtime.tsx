import { useEffect, useMemo, useState } from 'react'
import { Clock, Trash2, Calendar, FileText, CheckCircle2, AlertCircle, History, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Card from '../components/Card'
import Toast from '../components/Toast'
import { useApp, createId } from '../app/context'
import { todayISO, getCycleFromAnchor, isWithin, formatDateShort, parseISO, shiftAnchor } from '../app/dates'
import MotionButton from '../components/MotionButton'

const container = {
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

import { logsService } from '../services/logs'

export default function Overtime() {
  const { state, dispatch } = useApp()
  const [dateISO, setDateISO] = useState(todayISO())
  const [type, setType] = useState<'INICIO' | 'FIM'>('INICIO')
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState('')
  const [time, setTime] = useState(new Date())

  // Update clock every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const nowHHmm = time.toTimeString().slice(0, 5)

  // Find ANY open start, prioritizing today
  const openStart = useMemo(
    () => {
      const startToday = state.overtimeLogs.find((l) => l.dateISO === dateISO && l.type === 'INICIO' && !l.pairId)
      if (startToday) return startToday
      // Fallback: Find ANY open start in the past
      return state.overtimeLogs.find((l) => l.type === 'INICIO' && !l.pairId)
    },
    [state.overtimeLogs, dateISO],
  )

  async function handleSave() {
    if (type === 'FIM' && !openStart) {
      setToast('Nenhum início aberto para fechar')
      return
    }

    // Calculate duration manually for payload (reducer does it too, but we need it for Supabase payload)
    let durationMinutes = 0
    let pairId = undefined
    if (type === 'FIM' && openStart) {
      const startDate = new Date(`${openStart.dateISO}T${openStart.timeHHmm}:00`)
      const endDate = new Date(`${dateISO}T${nowHHmm}:00`)
      let diff = endDate.getTime() - startDate.getTime()
      if (diff < 0) diff += 24 * 60 * 60 * 1000 // crossover midnight
      durationMinutes = Math.round(diff / 60000)
      pairId = openStart.id
    }

    const log = {
      id: createId('ot'),
      dateISO,
      type,
      timeHHmm: nowHHmm,
      notes,
      durationMinutes: type === 'FIM' ? durationMinutes : undefined,
      pairId
    }

    // Persist to Supabase (with offline support)
    const result = await logsService.createLogOnlineOrQueue({
      type: 'OVERTIME',
      points_awarded: 0,
      payload: log
    })
    
    // 3. Update ID to match client_uuid if queued or sent (ensures consistency)
    const finalLog = { ...log, id: result.client_uuid }

    dispatch({ type: 'ADD_OVERTIME', payload: finalLog })

    setToast('Registro salvo')
    setNotes('')
    // Reset to start if we just finished one? Or stay on FIM? 
    // Usually user might want to register next start later.
    if (type === 'FIM') setType('INICIO')
  }

  function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      dispatch({ type: 'DELETE_OVERTIME', payload: id })
      setToast('Registro excluído')
    }
  }

  // Get period logs
  const { start, end, label } = getCycleFromAnchor(state.selectedPeriodAnchorISO)
  const logsInPeriod = state.overtimeLogs
    .filter((l) => isWithin(l.dateISO, start, end))
    .sort((a, b) => {
      if (a.dateISO !== b.dateISO) return b.dateISO.localeCompare(a.dateISO)
      return b.timeHHmm.localeCompare(a.timeHHmm)
    })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] pb-24 transition-colors duration-300">
      <Header title="Horas Extras" />
      <div className="px-4 pt-4 pb-28 space-y-4">
        
        {/* Live Clock Card */}
        <Card className="bg-brand-primary text-white flex flex-col items-center justify-center py-6 border-none">
          <p className="text-4xl font-bold tracking-wider">{nowHHmm}</p>
          <p className="text-xs opacity-80 mt-1">{formatDateShort(new Date())}</p>
        </Card>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <Calendar size={16} className="text-brand-primary" />
              Data
            </label>
            <input 
              type="date" 
              className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all" 
              value={dateISO} 
              onChange={(e) => setDateISO(e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
               <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                 <AlertCircle size={16} className="text-brand-primary" />
                 Tipo
               </label>
               <div className="relative">
                 <select 
                   className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 w-full rounded-xl border border-slate-200 bg-white px-4 h-[35px] text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all appearance-none" 
                   value={type} 
                   onChange={(e) => setType(e.target.value as 'INICIO' | 'FIM')}
                 >
                   <option value="INICIO">Início</option>
                   <option value="FIM">Fim</option>
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                 </div>
               </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                <Clock size={16} className="text-brand-primary" />
                Hora (Atual)
              </label>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-[35px] flex items-center gap-3 dark:bg-slate-950 dark:border-slate-800">
                <Clock className="w-5 h-5 text-brand-primary" />
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
                  {nowHHmm}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <FileText size={16} className="text-brand-primary" />
              Observação (opcional)
            </label>
            <textarea 
              className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400 resize-none" 
              rows={2} 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Ex: Instalação urgente..."
            />
          </div>
          
          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center px-4">
            Registrar ponto a cada 2 horas extras completas.
            <br/>
            As primeiras 20h do mês não contam para meta.
          </p>
          
          <MotionButton 
            className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20" 
            onClick={handleSave}
          >
            <CheckCircle2 size={20} />
            Registrar Ponto
          </MotionButton>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <History size={18} className="text-brand-primary" />
              <span>Registros do Período</span>
            </p>
            
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
              <button 
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                onClick={() => dispatch({ type: 'SET_PERIOD', payload: shiftAnchor(state.selectedPeriodAnchorISO, -1) })}
              >
                <ArrowLeft size={14} />
              </button>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 px-2 min-w-[80px] text-center truncate">
                {label}
              </span>
              <button 
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                onClick={() => dispatch({ type: 'SET_PERIOD', payload: shiftAnchor(state.selectedPeriodAnchorISO, 1) })}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
          
          <Card className="p-0 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {logsInPeriod.length === 0 && (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Sem registros de hora extra neste período.
                </div>
              )}
              {logsInPeriod.map((log) => (
                <motion.div 
                  layout
                  key={log.id} 
                  variants={item}
                  initial="hidden"
                  animate="show"
                  className="p-3 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        log.type === 'INICIO' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {formatDateShort(parseISO(log.dateISO))}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        às {log.timeHHmm}
                      </span>
                    </div>
                    {log.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{log.notes}"</p>}
                    
                    {/* Show duration on FIM logs */}
                    {log.type === 'FIM' && log.durationMinutes ? (
                      <p className="text-xs font-semibold text-brand-primary mt-1">
                        Duração: {(log.durationMinutes / 60).toFixed(2)}h
                      </p>
                    ) : null}
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
