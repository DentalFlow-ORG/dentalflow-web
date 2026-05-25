import { CheckCircle2, Clock, X } from 'lucide-react'

import type { PlanCardFeature } from '@/features/marketing/config/features'
import { cn } from '@/lib/utils'

type Props = {
  features: PlanCardFeature[]
  className?: string
}

export function PlanFeatureList({ features, className }: Props) {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {features.map((feature) => (
        <li key={feature.label} className="flex items-start gap-2.5">
          {feature.availability === 'included' ? (
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : feature.availability === 'soon' ? (
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50"
              aria-hidden="true"
            />
          ) : (
            <X
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30"
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              'text-sm leading-5',
              feature.availability === 'included' ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {feature.label}
            {feature.availability === 'soon' && (
              <span className="ml-1.5 text-xs text-muted-foreground/60">(em breve)</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
