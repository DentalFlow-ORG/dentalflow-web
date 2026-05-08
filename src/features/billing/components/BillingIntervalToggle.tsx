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
    <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-1.5 shadow-sm">
      {showMonthly && (
        <button
          type="button"
          onClick={() => onChange('MONTHLY')}
          className={cn(
            'h-12 rounded-lg px-7 text-sm font-bold transition-colors',
            value === 'MONTHLY'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-orange-800 hover:text-slate-950',
          )}
        >
          Mensal
        </button>
      )}
      {showYearly && (
        <button
          type="button"
          onClick={() => onChange('YEARLY')}
          className={cn(
            'flex h-12 items-center gap-2 rounded-lg px-7 text-sm font-bold transition-colors',
            value === 'YEARLY'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-orange-800 hover:text-slate-950',
          )}
        >
          Anual
          {discountPercent != null && discountPercent > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-black text-green-700">
              -{discountPercent}%
            </span>
          )}
        </button>
      )}
    </div>
  )
}
