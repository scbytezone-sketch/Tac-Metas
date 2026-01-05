import { motion } from 'framer-motion'
import { useApp } from '../app/context'
import { applyTheme, persistTheme } from '../app/theme'

export default function ThemeToggle() {
  const { state, dispatch } = useApp()
  const isDark = state.theme === 'dark'

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    
    // 1. Update state
    dispatch({ type: 'SET_THEME', payload: next })
    
    // 2. Persist
    persistTheme(next)
    
    // 3. Apply immediately
    applyTheme(next)
    
    // Debug
    console.log('theme=', next, 'html has dark?', document.documentElement.classList.contains('dark'))
  }

  return (
    <div className="flex flex-col gap-1 w-full" onClick={toggle}>
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Modo escuro</span>
        <motion.button
          type="button"
          className={`relative w-11 h-7 rounded-full transition-colors duration-300 ${
            isDark ? 'bg-teal-500' : 'bg-slate-200'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
            animate={{ x: isDark ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        Modo Escuro: {document.documentElement.classList.contains('dark') ? 'ON' : 'OFF'}
      </p>
    </div>
  )
}
