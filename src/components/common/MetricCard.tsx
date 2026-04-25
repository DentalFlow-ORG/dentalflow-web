import { cn } from '@/lib/utils'

type MetricCardProps = {
  value: string
  label: string
  className?: string
}

export function MetricCard({ value, label, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white/85 p-5 shadow-sm',
        className,
      )}
    >
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{label}</p>
    </div>
  )
}
