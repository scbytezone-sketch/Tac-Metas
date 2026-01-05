import { Home, PlusCircle, FileText, Timer } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'classnames'
import { motion } from 'framer-motion'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/nova-atividade', label: 'Nova Atividade', icon: PlusCircle },
  { to: '/overtime', label: 'Horas Extras', icon: Timer },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-30 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transition-all duration-300 dark:bg-slate-900/90 dark:border-slate-800/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="max-w-xl mx-auto flex justify-around items-center p-2">
        {links.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'relative flex flex-col items-center justify-center gap-1 min-w-[64px] h-[60px] px-2 rounded-xl transition-all duration-300',
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navActivePill"
                      className="absolute inset-0 bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/30"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <motion.div
                      animate={{ y: isActive ? -1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </motion.div>
                    <span className="text-[10px] font-semibold tracking-wide leading-none">{item.label}</span>
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
