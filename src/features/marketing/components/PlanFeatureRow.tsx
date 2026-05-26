import { Check, Clock3, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PlanFeatureAvailability } from '../config/features'

type Props = {
  label: string
  type: PlanFeatureAvailability
  variant?: 'light' | 'dark'
}

export function PlanFeatureRow({ label, type, variant = 'light' }: Props) {
  const isDark = variant === 'dark'

  if (type === 'included') {
    return (
      <li className="flex items-start gap-2.5">
        <Check
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            isDark ? 'text-emerald-400' : 'text-emerald-500',
          )}
          aria-hidden="true"
        />
        <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
          {label}
        </span>
      </li>
    )
  }

  if (type === 'soon') {
    return (
      <li className="flex items-start gap-2.5">
        <Clock3
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            isDark ? 'text-amber-300' : 'text-amber-400',
          )}
          aria-hidden="true"
        />
        <span className={cn('flex-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {label}
        </span>
        <span
          className={cn(
            'ml-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
            isDark ? 'bg-amber-400/10 text-amber-300' : 'bg-amber-50 text-amber-600',
          )}
        >
          Em breve
        </span>
      </li>
    )
  }

  return (
    <li aria-label={`${label}: não incluído`} className="flex items-start gap-2.5">
      <X
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          isDark ? 'text-slate-600' : 'text-slate-300',
        )}
        aria-hidden="true"
      />
      <span className={cn('text-sm line-through', isDark ? 'text-slate-500' : 'text-slate-400')}>
        {label}
      </span>
    </li>
  )
}
