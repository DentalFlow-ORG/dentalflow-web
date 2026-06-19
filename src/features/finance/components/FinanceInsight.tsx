import { cn } from '@/lib/utils'

import { formatCurrency } from '../utils/finance-format'

export function FinanceInsight({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card/85 px-3 py-3 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 text-base font-semibold',
          value > 0
            ? 'text-emerald-700 dark:text-emerald-400'
            : value < 0
              ? 'text-red-700 dark:text-red-400'
              : 'text-foreground',
        )}
      >
        {formatCurrency(value)}
      </div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}
