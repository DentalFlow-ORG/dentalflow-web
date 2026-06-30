import { Plus } from 'lucide-react'

import { type FilterDef, ListToolbar } from '@/components/common/ListToolbar'
import { Button } from '@/components/ui/button'

import type { AppointmentsView } from '../hooks/useAppointmentsPage'
import type { GoogleCalendarStatus } from '../types/calendar-integration.types'
import { GoogleCalendarButton } from './shared/GoogleCalendarButton'
import { ViewToggle } from './shared/ViewToggle'

type SchedulingToolbarProps = {
  // Search
  searchQuery: string
  onSearchChange: (q: string) => void
  // Filters
  activeFilters: Record<string, string>
  filterDefs: FilterDef[]
  onFilterChange: (key: string, value: string | null) => void
  onClearAll: () => void
  filteredCount: number
  totalCount: number
  // View
  view: AppointmentsView
  onViewChange: (view: AppointmentsView) => void
  // New appointment
  onNewAppointment: () => void
  // Google Calendar (optional — only OWNER sees these controls)
  googleCalendar?: GoogleCalendarStatus | null
  canManageGoogleCalendar?: boolean
  isCalendarActionLoading?: boolean
  onConnectGoogleCalendar?: () => void
  onSyncGoogleCalendar?: () => void
  onDisconnectGoogleCalendar?: () => void
}

export function SchedulingToolbar({
  searchQuery,
  onSearchChange,
  activeFilters,
  filterDefs,
  onFilterChange,
  onClearAll,
  filteredCount,
  totalCount,
  view,
  onViewChange,
  onNewAppointment,
  googleCalendar,
  canManageGoogleCalendar,
  isCalendarActionLoading,
  onConnectGoogleCalendar,
  onSyncGoogleCalendar,
  onDisconnectGoogleCalendar,
}: SchedulingToolbarProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm shadow-black/5">
      <div className="flex flex-wrap items-start gap-3">
        {/* Search + filters — takes all available space */}
        <div className="min-w-0 flex-1">
          <ListToolbar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder="Pesquisar por paciente, e-mail ou telefone..."
            filterDefs={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        </div>

        {/* Actions — view toggle + Google Calendar + new appointment */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">
          <ViewToggle view={view} onChange={onViewChange} />

          <GoogleCalendarButton
            googleCalendar={googleCalendar ?? null}
            canManageGoogleCalendar={canManageGoogleCalendar ?? false}
            isCalendarActionLoading={isCalendarActionLoading ?? false}
            onConnect={onConnectGoogleCalendar ?? (() => {})}
            onSync={onSyncGoogleCalendar ?? (() => {})}
            onDisconnect={onDisconnectGoogleCalendar ?? (() => {})}
          />

          <Button type="button" onClick={onNewAppointment}>
            <Plus aria-hidden="true" />
            Novo agendamento
          </Button>
        </div>
      </div>
    </div>
  )
}
