import { useState } from 'react'
import { Calendar, Hash, Wrench, Zap, FileText, Calculator, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import Chips from '../components/Chips'
import Toast from '../components/Toast'
import { useApp, createId } from '../app/context'
import type { Complexity, ServiceType } from '../app/types'
import { computePoints, POINTS_RULES } from '../data/rules'
import { todayISO } from '../app/dates'

import { logsService } from '../services/logs'

export default function NewActivity() {
  const { dispatch } = useApp()
  const [dateISO, setDateISO] = useState(todayISO())
  const [osNumber, setOsNumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('INSTALACAO')
  const [complexity, setComplexity] = useState<Complexity>('SIMPLES')
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState('')

  const points = computePoints(serviceType, complexity)

  async function handleSave() {
    if (!osNumber) return
    const activity = {
      id: createId('act'),
      dateISO,
      osNumber,
      serviceType,
      complexity,
      points,
      notes,
    }
    
    // 2. Persist to Supabase (with offline support)
    const result = await logsService.createLogOnlineOrQueue({
      type: 'ACTIVITY',
      points_awarded: points,
      payload: activity
    })
    
    // 3. Update ID to match client_uuid if queued or sent (ensures consistency)
    const finalActivity = { ...activity, id: result.client_uuid }

    // 1. Optimistic Update (Local)
    // We update local state with the corrected ID
    dispatch({ type: 'ADD_ACTIVITY', payload: finalActivity })

    setToast('Atividade salva')
    setOsNumber('')
    setNotes('')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] pb-24 transition-colors duration-300">
      <Header title="Nova Atividade" />
      <div className="px-4 pt-4 pb-28 space-y-5">
        
        {/* Data */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <Calendar size={16} className="text-brand-primary" />
            Data
          </label>
          <input 
            type="date" 
            value={dateISO} 
            onChange={(e) => setDateISO(e.target.value)} 
            className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all" 
          />
        </div>

        {/* OS */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <Hash size={16} className="text-brand-primary" />
            Nº da O.S.
          </label>
          <input 
            value={osNumber} 
            onChange={(e) => setOsNumber(e.target.value)} 
            placeholder="12345" 
            className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400" 
          />
        </div>

        {/* Tipo de Serviço */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <Wrench size={16} className="text-brand-primary" />
            Tipo de Serviço
          </label>
          <div className="relative">
            <select 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value as ServiceType)} 
              className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all appearance-none"
            >
              {Object.entries(POINTS_RULES).map(([key, rule]) => (
                <option key={key} value={key}>
                  {rule.label}
                </option>
              ))}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Complexidade */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <Zap size={16} className="text-brand-primary" />
            Complexidade
          </label>
          <Chips
            value={complexity}
            onChange={(v) => setComplexity(v as Complexity)}
            options={[
              { label: 'Simples', value: 'SIMPLES' },
              { label: 'Complexa', value: 'COMPLEXA' },
            ]}
          />
        </div>

        {/* Observações */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <FileText size={16} className="text-brand-primary" />
            Observações
          </label>
          <textarea 
            rows={3} 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Alguma observação sobre o serviço?" 
            className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400 resize-none" 
          />
        </div>

        {/* Resultado Pontos */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-primary/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calculator size={48} className="text-brand-primary" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Pontos estimados</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-brand-primary">{points.toFixed(2)}</p>
            <span className="text-sm font-medium text-slate-400">pts</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            className="btn-primary flex items-center justify-center gap-2 text-base shadow-lg shadow-brand-primary/20" 
            onClick={handleSave} 
            disabled={!osNumber}
          >
            <CheckCircle2 size={20} />
            Salvar Atividade
          </button>
        </div>
      </div>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
