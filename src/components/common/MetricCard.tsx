import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'primary'

type MetricCardProps = {
  value: string
  label: string
  tone?: Tone
  className?: string
}

const TONE_CARD: Record<Tone, string> = {
  neutral: '',
  success: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-950/20',
  danger: 'border-red-200 bg-red-50/70 dark:border-red-800/40 dark:bg-red-950/20',
  warning: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20',
  info: 'border-blue-200 bg-blue-50/70 dark:border-blue-800/40 dark:bg-blue-950/20',
  primary: 'border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10',
}

const TONE_VALUE: Record<Tone, string> = {
  neutral: 'text-card-foreground',
  success: 'text-emerald-700 dark:text-emerald-300',
  danger: 'text-red-700 dark:text-red-300',
  warning: 'text-amber-700 dark:text-amber-300',
  info: 'text-blue-700 dark:text-blue-300',
  primary: 'text-primary',
}

export function MetricCard({ value, label, tone = 'neutral', className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card/85 p-5 shadow-sm',
        TONE_CARD[tone],
        className,
      )}
    >
      <p className={cn('text-2xl font-semibold', TONE_VALUE[tone])}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{label}</p>
    </div>
  )
}
