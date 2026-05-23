import { cn } from '@/lib/utils'

import {
  ODONTOGRAM_CONDITION_OPTIONS,
  ODONTOGRAM_TOOTH_TOKENS,
} from '../../utils/odontogram-status-utils'

type Props = {
  printMode?: boolean
}

export function OdontogramLegend({ printMode = false }: Props) {
  return (
    <div className={cn('flex flex-wrap gap-2', printMode && 'gap-1.5')}>
      {ODONTOGRAM_CONDITION_OPTIONS.map((option) => {
        const tokens = ODONTOGRAM_TOOTH_TOKENS[option.value]

        return (
          <div
            key={option.value}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground',
              printMode && 'px-2 py-0.5 text-[10px]',
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tokens.stroke }}
              aria-hidden="true"
            />
            {option.label}
          </div>
        )
      })}
    </div>
  )
}
