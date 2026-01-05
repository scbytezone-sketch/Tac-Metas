interface ProgressBarProps {
  value: number
  max: number
}

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
