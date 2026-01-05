import clsx from 'classnames'
import type { PropsWithChildren } from 'react'

interface CardProps extends PropsWithChildren {
  className?: string
  onClick?: () => void
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx('card rounded-2xl bg-white border border-slate-200 shadow-card transition-colors duration-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100', className, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
