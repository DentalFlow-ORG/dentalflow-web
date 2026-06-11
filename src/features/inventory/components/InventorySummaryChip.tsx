import { cn } from '@/lib/utils'

type InventorySummaryChipProps = {
  label: string
  value: string
  tone?: 'neutral' | 'danger' | 'warning' | 'info'
  className?: string
}

const CHIP_TONE: Record<NonNullable<InventorySummaryChipProps['tone']>, string> = {
  neutral: 'border-border bg-muted/50 text-foreground',
  danger:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300',
}

export function InventorySummaryChip({
  label,
  value,
  tone = 'neutral',
  className,
}: InventorySummaryChipProps) {
  return (
    <div className={cn('rounded-lg border p-4', CHIP_TONE[tone], className)}>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
