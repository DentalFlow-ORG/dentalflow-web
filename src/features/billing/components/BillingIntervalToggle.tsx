import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { BillingInterval } from '../types/billing.types'

type Props = {
  value: BillingInterval
  onChange: (value: BillingInterval) => void
  showMonthly: boolean
  showYearly: boolean
  discountPercent?: number | null
  hasMonthlyPromo?: boolean
}

export function BillingIntervalToggle({
  value,
  onChange,
  showMonthly,
  showYearly,
  discountPercent,
  hasMonthlyPromo = false,
}: Props) {
  return (
    <div className="flex flex-col items-start gap-2 sm:items-center">
      <div
        role="radiogroup"
        aria-label="Período de cobrança"
        className="inline-flex max-w-full items-center gap-1 rounded-xl border border-border bg-muted p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
      >
        {showMonthly && (
          <Button
            type="button"
            role="radio"
            aria-checked={value === 'MONTHLY'}
            variant="ghost"
            onClick={() => onChange('MONTHLY')}
            className={cn(
              'h-10 gap-1.5 px-5 text-sm font-medium',
              value === 'MONTHLY'
                ? 'bg-card text-foreground shadow-sm hover:bg-card dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700'
                : 'text-muted-foreground hover:bg-card/70 hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100',
            )}
          >
            <span>Mensal</span>
            {hasMonthlyPromo && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[0.6rem] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                1º mês
              </span>
            )}
          </Button>
        )}
        {showYearly && (
          <Button
            type="button"
            role="radio"
            aria-checked={value === 'YEARLY'}
            variant="ghost"
            onClick={() => onChange('YEARLY')}
            className={cn(
              'h-10 gap-1.5 px-5 text-sm font-medium',
              value === 'YEARLY'
                ? 'bg-card text-foreground shadow-sm hover:bg-card dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700'
                : 'text-muted-foreground hover:bg-card/70 hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100',
            )}
          >
            <span>Anual</span>
            {discountPercent != null && discountPercent > 0 && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.6rem] font-bold',
                  value === 'YEARLY'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                )}
              >
                -{discountPercent}%
              </span>
            )}
          </Button>
        )}
      </div>
      {showYearly && value === 'YEARLY' && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Melhor custo-benefício — 2 meses grátis
        </p>
      )}
      {showMonthly && value === 'MONTHLY' && hasMonthlyPromo && (
        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
          Preço especial de lançamento no 1º mês
        </p>
      )}
    </div>
  )
}
