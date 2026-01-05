import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, Check, ChevronDown, LogIn, UserPlus } from 'lucide-react'
import type { Role } from '../app/types'
import { listRoles } from '../data/meta'
import MotionButton from '../components/MotionButton'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'

import { cleanUsername } from '../utils/username'

export default function Setup() {
  const { signIn, signUp, loading } = useAuth()
  const navigate = useNavigate()
  
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  
  // Form State
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit() {
    setError('')
    setBusy(true)
    try {
      const cleanUser = cleanUsername(username)

      if (mode === 'REGISTER') {
        if (!name || !cleanUser || !password || !role) {
          throw new Error('Preencha todos os campos')
        }
        await signUp({ name, username: cleanUser, password, role })
      } else {
        if (!cleanUser || !password) {
          throw new Error('Preencha usuário e senha')
        }
        await signIn(cleanUser, password)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] pb-10 transition-colors duration-300">
      {/* Hero Header */}
      <motion.div 
        className="relative bg-gradient-to-br from-teal-500/90 via-emerald-500/85 to-cyan-500/80 rounded-b-[26px] overflow-hidden pt-8 pb-8 px-6 min-h-[200px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-44 h-44 bg-white/15 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-52 h-52 bg-white/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center mb-3 ring-1 ring-white/25 shadow-sm backdrop-blur-sm">
            <UserRound className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">
            {mode === 'LOGIN' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Gerencie suas metas e horas extras.
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div 
        className="px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div className="relative z-10 -mt-6 mx-auto w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-lg border border-slate-100/50 dark:border-slate-800 transition-colors duration-300">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4">
            <button
              onClick={() => setMode('LOGIN')}
              className={`text-sm font-medium py-2 rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('REGISTER')}
              className={`text-sm font-medium py-2 rounded-lg transition-all ${mode === 'REGISTER' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Criar Conta
            </button>
          </div>

          <div className="px-4 pb-4 space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'REGISTER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 block pl-1">
                      Nome Completo
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 focus:bg-white transition-all placeholder:text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 block pl-1">
                      Cargo
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 focus:bg-white transition-all appearance-none cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                        value={role} 
                        onChange={(e) => setRole(e.target.value as Role)}
                      >
                        <option value="" className="text-slate-400">Selecione seu cargo...</option>
                        {listRoles().map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.key.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 block pl-1">
                Usuário (Login)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 focus:bg-white transition-all placeholder:text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                placeholder="Ex: joaosilva"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
                type="text"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2 block pl-1">
                Senha
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 focus:bg-white transition-all placeholder:text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <MotionButton 
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-3 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                onClick={handleSubmit} 
                disabled={busy}
              >
                {busy ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    <span>{mode === 'LOGIN' ? 'Entrar' : 'Criar Conta'}</span>
                    {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </>
                )}
              </MotionButton>
            </div>
          </div>
        </div>
      </motion.div>

      <Toast open={!!error} message={error} onClose={() => setError('')} />
    </div>
  )
}
