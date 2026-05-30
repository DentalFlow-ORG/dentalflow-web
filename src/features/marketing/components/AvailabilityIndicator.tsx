import { Check, Clock3, X } from 'lucide-react'

import type { PlanFeatureAvailability } from '../config/features'

type Props = {
  availability: PlanFeatureAvailability
  /**
   * pill — icon + text label inside a coloured pill (default, used in FeaturesPage)
   * icon — bare icon with aria-label only (compact, used in PlansPage comparison table)
   */
  variant?: 'pill' | 'icon'
}

export function AvailabilityIndicator({ availability, variant = 'pill' }: Props) {
  if (variant === 'icon') {
    if (availability === 'included') {
      return <Check className="h-4 w-4 text-emerald-500" aria-label="Incluído" />
    }
    if (availability === 'soon') {
      return <Clock3 className="h-4 w-4 text-amber-400" aria-label="Em breve" />
    }
    return <X className="h-4 w-4 text-slate-300" aria-label="Não incluído" />
  }

  if (availability === 'included') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <Check className="h-3 w-3" aria-hidden="true" />
        Incluído
      </span>
    )
  }

  if (availability === 'soon') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <Clock3 className="h-3 w-3" aria-hidden="true" />
        Em breve
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400 ring-1 ring-slate-200">
      <X className="h-3 w-3" aria-hidden="true" />
      Não incl.
    </span>
  )
}
