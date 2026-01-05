import { motion } from 'framer-motion'
import type { MotionProps } from 'framer-motion'
import clsx from 'classnames'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & MotionProps & {
  asChild?: boolean
}

export default function MotionButton({ className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.12 }}
      className={clsx('relative overflow-hidden', className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
