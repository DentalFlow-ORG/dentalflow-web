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
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div
        className={cn(
          'mt-1 text-base font-semibold',
          value >= 0 ? 'text-slate-950' : 'text-red-700',
        )}
      >
        {formatCurrency(value)}
      </div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </div>
  )
}
