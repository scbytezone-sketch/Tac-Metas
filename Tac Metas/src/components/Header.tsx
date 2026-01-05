import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../app/context'
import { useAuth } from '../contexts/AuthContext'
import { getMetaByRole } from '../data/meta'
import ThemeToggle from './ThemeToggle'

export default function Header({ title }: { title?: string }) {
  const { state } = useApp()
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const name = state.user?.name ?? 'Técnico'
  const meta = getMetaByRole(state.user?.role)

  function handleLogout() {
    signOut()
    setMenuOpen(false)
  }

  return (
    <>
      <div className="sticky top-0 z-20 backdrop-blur bg-white/90 shadow-sm border-b border-slate-200 px-4 pt-4 pb-3 transition-colors duration-300 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand-primary/30 transition-colors dark:bg-slate-800 dark:border-slate-700" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tac Telecom</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Meta base: {meta} pts</p>
            </div>
          </div>
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
        </div>
        {title && <p className="mt-3 font-semibold text-lg text-slate-800 dark:text-slate-100 transition-colors">{title}</p>}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] dark:bg-black/60"
            />
            
            {/* Menu Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed top-4 right-4 z-50 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-4 origin-top-right border border-slate-200 dark:bg-slate-900 dark:ring-slate-700 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Menu</span>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-800/50">
                  <ThemeToggle />
                  <p className="text-[10px] text-slate-400 mt-2 text-center dark:text-slate-500">
                    Preferência salva neste dispositivo
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium dark:bg-red-900/10 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
