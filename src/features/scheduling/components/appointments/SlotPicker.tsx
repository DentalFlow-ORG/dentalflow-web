import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { AvailabilitySlot } from '../../types/scheduling.types'

type SlotPickerProps = {
  slots: AvailabilitySlot[]
  value: string
  onChange: (time: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function SlotPicker({ slots, value, onChange, isLoading, disabled }: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-5 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Carregando horários...</span>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-400">
        Nenhum horário disponível para esta data.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 min-[380px]:grid-cols-4 sm:grid-cols-5">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available || disabled}
          onClick={() => onChange(slot.time)}
          title={slot.reason ?? undefined}
          className={cn(
            'rounded-md border px-2 py-1.5 text-sm font-medium transition-colors',
            slot.available && !disabled
              ? value === slot.time
                ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                : 'border-slate-200 bg-white text-slate-900 hover:border-primary/35 hover:bg-primary/5 hover:text-primary'
              : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 line-through',
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  )
}
