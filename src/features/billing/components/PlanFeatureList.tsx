import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type Props = {
  features: string[]
  className?: string
}

export function PlanFeatureList({ features, className }: Props) {
  return (
    <ul className={cn('space-y-2', className)}>
      {features.map((feature) => (
        <li key={feature} className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <Check className="mt-1 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
