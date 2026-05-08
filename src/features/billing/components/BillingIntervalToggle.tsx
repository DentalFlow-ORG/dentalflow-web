import { Button } from '@/components/ui/button'
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
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm"
    >
      {showMonthly && (
        <Button
          type="button"
          role="radio"
          aria-checked={value === 'MONTHLY'}
          variant="ghost"
          size="sm"
          onClick={() => onChange('MONTHLY')}
          className={cn(
            'min-h-10 px-4 text-sm sm:px-5',
            value === 'MONTHLY'
              ? 'bg-white text-slate-950 shadow-sm hover:bg-white'
              : 'text-slate-600 hover:bg-white/70 hover:text-slate-950',
          )}
        >
          Mensal
        </Button>
      )}
      {showYearly && (
        <Button
          type="button"
          role="radio"
          aria-checked={value === 'YEARLY'}
          variant="ghost"
          size="sm"
          onClick={() => onChange('YEARLY')}
          className={cn(
            'min-h-10 px-4 text-sm sm:px-5',
            value === 'YEARLY'
              ? 'bg-white text-slate-950 shadow-sm hover:bg-white'
              : 'text-slate-600 hover:bg-white/70 hover:text-slate-950',
          )}
        >
          <span>Anual</span>
          {discountPercent != null && discountPercent > 0 && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
              -{discountPercent}%
            </span>
          )}
        </Button>
      )}
    </div>
  )
}
