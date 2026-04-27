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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          <DayOfWeekLabel day={slot.dayOfWeek} />
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatWallTime(slot.startTime)} – {formatWallTime(slot.endTime)}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
          slot.isActive
            ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
            : 'border-slate-200 bg-slate-100 text-slate-500',
        )}
      >
        {slot.isActive ? 'Ativo' : 'Inativo'}
      </span>
      <div className="flex shrink-0 items-center gap-1">
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
          className="text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
