import { cn } from '@/lib/utils'

import {
  ODONTOGRAM_CONDITION_LEGEND_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
} from '../../utils/odontogram-status-utils'

type Props = {
  printMode?: boolean
}

export function OdontogramLegend({ printMode = false }: Props) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', printMode && 'gap-1')}>
      {ODONTOGRAM_CONDITION_OPTIONS.map((option) => {
        const classes = ODONTOGRAM_CONDITION_LEGEND_CLASSES[option.value]

        return (
          <span
            key={option.value}
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
              classes ?? 'border-border bg-card text-muted-foreground',
              printMode && 'px-2 py-0.5 text-[10px]',
            )}
          >
            {option.label}
          </span>
        )
      })}
    </div>
  )
}
