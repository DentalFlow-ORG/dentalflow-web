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
        'rounded-lg border border-border bg-card/85 p-5 shadow-sm',
        className,
      )}
    >
      <p className="text-2xl font-semibold text-card-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{label}</p>
    </div>
  )
}
