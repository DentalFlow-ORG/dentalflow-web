import { cn } from '@/lib/utils'

import type { OdontogramTooth as OdontogramToothData } from '../../types/clinical-record.types'
import {
  getToothConditionLabel,
  getToothVisualTokens,
} from '../../utils/odontogram-status-utils'
import { OdontogramToothSvg } from './OdontogramToothSvg'

type Props = {
  toothNumber: number
  tooth: OdontogramToothData
  selected?: boolean
  multiSelected?: boolean
  readOnly?: boolean
  lower?: boolean
  printMode?: boolean
  compact?: boolean
  onSelect?: (toothNumber: number) => void
}

export function OdontogramTooth({
  toothNumber,
  tooth,
  selected = false,
  multiSelected = false,
  readOnly = false,
  lower = false,
  printMode = false,
  compact = false,
  onSelect,
}: Props) {
  const tokens = getToothVisualTokens(tooth)
  const hasCondition = Boolean(tooth.condition)
  const isInteractive = Boolean(onSelect) && !readOnly && !printMode

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => onSelect?.(toothNumber)}
      aria-pressed={selected || multiSelected}
      aria-label={`Dente ${toothNumber}, ${getToothConditionLabel(tooth.condition)}`}
      title={`Dente ${toothNumber} - ${getToothConditionLabel(tooth.condition)}`}
      className={cn(
        'group relative flex h-[68px] w-[48px] items-center justify-center rounded-lg outline-none transition',
        tokens.text,
        isInteractive && 'cursor-pointer hover:bg-slate-50 hover:shadow-sm',
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected && 'bg-primary/5 ring-2 ring-primary ring-offset-2',
        multiSelected && 'bg-primary/5 ring-2 ring-primary/70 ring-offset-2',
        !isInteractive && 'cursor-default',
        // print: smaller fixed size matching print grid columns (32px)
        printMode && 'h-[46px] w-[32px] rounded-none',
        // compact: fluid width filling the grid cell (used in mobile quadrant layout)
        compact && 'h-[54px] w-full',
      )}
    >
      <OdontogramToothSvg
        toothNumber={toothNumber}
        fill={tokens.fill}
        stroke={selected || multiSelected ? '#1E3A8A' : tokens.stroke}
        lower={lower}
        className={cn(isInteractive && 'transition-transform group-hover:-translate-y-0.5')}
      />
      {hasCondition && (
        <span
          className={cn(
            'absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white',
            tokens.dot,
            (printMode || compact) && 'right-1 top-1 h-1.5 w-1.5',
          )}
          aria-hidden="true"
        />
      )}
      {tooth.condition === 'absent' && (
        <span
          aria-hidden="true"
          className="absolute left-2 right-2 top-1/2 h-px -rotate-12 bg-slate-400"
        />
      )}
    </button>
  )
}
