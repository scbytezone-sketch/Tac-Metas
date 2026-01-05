import clsx from 'classnames'
import { motion } from 'framer-motion'

interface ChipOption {
  label: string
  value: string
}

interface ChipsProps {
  options: ChipOption[]
  value: string
  onChange: (val: string) => void
}

export default function Chips({ options, value, onChange }: ChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            className="relative px-3 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none"
            onClick={() => onChange(opt.value)}
          >
            {isSelected && (
              <motion.div
                layoutId="chipActive"
                className="absolute inset-0 bg-brand-soft border border-brand-primary/30 rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={clsx(
                'relative z-10 transition-colors',
                isSelected ? 'text-brand-primary' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {opt.label}
            </span>
            {!isSelected && (
              <div className="absolute inset-0 border border-slate-200 dark:border-slate-700 rounded-full bg-slate-100 dark:bg-slate-800/60" />
            )}
          </button>
        )
      })}
    </div>
  )
}
