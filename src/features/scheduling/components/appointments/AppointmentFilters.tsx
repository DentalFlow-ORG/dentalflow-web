import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { AppointmentStatus } from '../../types/scheduling.types'
import { STATUS_CONFIG } from './AppointmentStatusBadge'

export type AppointmentFiltersState = {
  status: AppointmentStatus | null
  profileId: string | null
}

type ProfileOption = {
  id: string
  displayName: string
}

type AppointmentFiltersProps = {
  filters: AppointmentFiltersState
  profiles: ProfileOption[]
  onChange: (filters: AppointmentFiltersState) => void
}

const STATUS_TABS: Array<{ value: AppointmentStatus | null; label: string }> = [
  { value: null, label: 'Todos' },
  { value: 'PENDING', label: STATUS_CONFIG.PENDING.label },
  { value: 'CONFIRMED', label: STATUS_CONFIG.CONFIRMED.label },
  { value: 'COMPLETED', label: STATUS_CONFIG.COMPLETED.label },
  { value: 'CANCELED', label: STATUS_CONFIG.CANCELED.label },
  { value: 'NO_SHOW', label: STATUS_CONFIG.NO_SHOW.label },
]

export function AppointmentFilters({
  filters,
  profiles,
  onChange,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            type="button"
            onClick={() => onChange({ ...filters, status: tab.value })}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              filters.status === tab.value
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dentist filter */}
      {profiles.length > 1 && (
        <Select
          value={filters.profileId ?? 'all'}
          onValueChange={(value) =>
            onChange({ ...filters, profileId: value === 'all' ? null : value })
          }
        >
          <SelectTrigger size="sm" className="w-full sm:w-56">
            <SelectValue placeholder="Todos os profissionais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
          {profiles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.displayName}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
