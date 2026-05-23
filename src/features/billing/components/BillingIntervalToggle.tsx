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
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-muted p-1 shadow-sm"
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
              ? 'bg-card text-foreground shadow-sm hover:bg-card'
              : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
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
              ? 'bg-card text-foreground shadow-sm hover:bg-card'
              : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
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
