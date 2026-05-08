import { cn } from '@/lib/utils'

import type { BillingInterval } from '../types/billing.types'

type Props = {
  value: BillingInterval
  onChange: (value: BillingInterval) => void
  showMonthly: boolean
  showYearly: boolean
  discountPercent?: number | null
}

export function BillingIntervalToggle({
  value,
  onChange,
  showMonthly,
  showYearly,
  discountPercent,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Período de cobrança"
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5 shadow-sm"
    >
      {showMonthly && (
        <button
          type="button"
          role="radio"
          aria-checked={value === 'MONTHLY'}
          onClick={() => onChange('MONTHLY')}
          className={cn(
            'h-11 rounded-lg px-7 text-sm font-semibold transition-colors',
            value === 'MONTHLY'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          Mensal
        </button>
      )}
      {showYearly && (
        <button
          type="button"
          role="radio"
          aria-checked={value === 'YEARLY'}
          onClick={() => onChange('YEARLY')}
          className={cn(
            'flex h-11 items-center gap-2 rounded-lg px-7 text-sm font-semibold transition-colors',
            value === 'YEARLY'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          Anual
          {discountPercent != null && discountPercent > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              -{discountPercent}%
            </span>
          )}
        </button>
      )}
    </div>
  )
}
