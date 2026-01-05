import { useEffect } from 'react'
import clsx from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ToastProps {
  message?: string
  type?: 'success' | 'error'
  open: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', open, onClose, duration = 1800 }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  return (
    <AnimatePresence>
      {open && message && (
        <div className="fixed bottom-20 inset-x-0 flex justify-center z-50 px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={clsx(
              'px-4 py-3 rounded-2xl shadow-lg border pointer-events-auto flex items-center gap-3',
              'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
            )}
          >
            {type === 'success' ? (
              <CheckCircle size={20} className="text-brand-primary" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {message}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
