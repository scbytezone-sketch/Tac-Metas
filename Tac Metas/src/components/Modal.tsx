import type { PropsWithChildren } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title?: string
  onClose: () => void
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 pointer-events-auto dark:bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:w-[400px] p-4 max-h-[90vh] overflow-y-auto pointer-events-auto z-10 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
              <button className="text-slate-500 text-sm p-2 dark:text-slate-400" onClick={onClose}>
                Fechar
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
