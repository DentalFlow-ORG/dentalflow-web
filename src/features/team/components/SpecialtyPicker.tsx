import { cn } from '@/lib/utils'

import type { Specialty } from '../types/team.types'

type SpecialtyPickerProps = {
  specialties: Specialty[]
  selected: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function SpecialtyPicker({
  specialties,
  selected,
  onChange,
  disabled = false,
}: SpecialtyPickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  if (specialties.length === 0) {
    return (
      <p className="text-sm text-slate-400">Nenhuma especialidade disponível.</p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {specialties.map((specialty) => {
        const isSelected = selected.includes(specialty.id)
        return (
          <button
            key={specialty.id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(specialty.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
              isSelected
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary',
            )}
          >
            {specialty.name}
          </button>
        )
      })}
    </div>
  )
}
