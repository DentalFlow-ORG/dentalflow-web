import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { formatWallTime } from '../../utils/time'
import type { Availability, CreateAvailabilityDto } from '../../types/scheduling.types'
import { DayOfWeekLabel } from '../shared/DayOfWeekLabel'
import { AvailabilitySlotForm } from './AvailabilitySlotForm'

type AvailabilitySlotRowProps = {
  slot: Availability
  isEditing: boolean
  isLoading: boolean
  onEditStart: () => void
  onEditCancel: () => void
  onUpdate: (dto: CreateAvailabilityDto) => void
  onDelete: () => void
}

export function AvailabilitySlotRow({
  slot,
  isEditing,
  isLoading,
  onEditStart,
  onEditCancel,
  onUpdate,
  onDelete,
}: AvailabilitySlotRowProps) {
  if (isEditing) {
    return (
      <AvailabilitySlotForm
        initial={{
          dayOfWeek: slot.dayOfWeek,
          startTime: formatWallTime(slot.startTime),
          endTime: formatWallTime(slot.endTime),
        }}
        isLoading={isLoading}
        onSubmit={onUpdate}
        onCancel={onEditCancel}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          <DayOfWeekLabel day={slot.dayOfWeek} />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatWallTime(slot.startTime)} – {formatWallTime(slot.endTime)}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
          slot.isActive
            ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
            : 'border-border bg-muted text-muted-foreground',
        )}
      >
        {slot.isActive ? 'Ativo' : 'Inativo'}
      </span>
      <div className="flex shrink-0 items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEditStart}
          disabled={isLoading}
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isLoading}
          aria-label="Remover"
          className="text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
