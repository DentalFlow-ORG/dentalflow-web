import { cn } from '@/lib/utils'

export type BillingPeriod = 'monthly' | 'annual'

type Props = {
  value: BillingPeriod
  onChange: (value: BillingPeriod) => void
  variant?: 'light' | 'dark'
  savingsLabel?: string
}

export function BillingPeriodToggle({
  value,
  onChange,
  variant = 'light',
  savingsLabel = '2 meses grátis',
}: Props) {
  const isDark = variant === 'dark'

  return (
    <div
      role="radiogroup"
      aria-label="Período de cobrança"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl p-1',
        isDark ? 'bg-white/[0.08]' : 'border border-slate-200 bg-slate-100',
      )}
    >
      <PeriodButton
        label="Mensal"
        isActive={value === 'monthly'}
        isDark={isDark}
        onClick={() => onChange('monthly')}
      />
      <PeriodButton
        label="Anual"
        badge={savingsLabel}
        isActive={value === 'annual'}
        isDark={isDark}
        onClick={() => onChange('annual')}
      />
    </div>
  )
}

function PeriodButton({
  label,
  badge,
  isActive,
  isDark,
  onClick,
}: {
  label: string
  badge?: string
  isActive: boolean
  isDark: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        isActive
          ? isDark
            ? 'bg-white/[0.12] text-white shadow-sm'
            : 'bg-white text-slate-900 shadow-sm'
          : isDark
            ? 'text-slate-400 hover:text-slate-300'
            : 'text-slate-500 hover:text-slate-700',
      )}
    >
      {label}
      {badge && (
        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}
