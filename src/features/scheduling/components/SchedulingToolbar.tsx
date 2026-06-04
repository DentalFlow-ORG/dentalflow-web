import { CalendarCheck, Link2Off, Loader2, Plus, RefreshCw } from 'lucide-react'

import { ListToolbar, type FilterDef } from '@/components/common/ListToolbar'
import { Button } from '@/components/ui/button'

import type { GoogleCalendarStatus } from '../types/calendar-integration.types'
import type { AppointmentsView } from '../hooks/useAppointmentsPage'
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
  // Google Calendar (optional — only present for roles that support it)
  googleCalendar?: GoogleCalendarStatus | null
  canManageGoogleCalendar?: boolean
  isDentistGoogleCalendarLocked?: boolean
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
  isDentistGoogleCalendarLocked,
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
            isDentistGoogleCalendarLocked={isDentistGoogleCalendarLocked ?? false}
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

function GoogleCalendarButton({
  googleCalendar,
  canManageGoogleCalendar,
  isDentistGoogleCalendarLocked,
  isCalendarActionLoading,
  onConnect,
  onSync,
  onDisconnect,
}: {
  googleCalendar: GoogleCalendarStatus | null
  canManageGoogleCalendar: boolean
  isDentistGoogleCalendarLocked: boolean
  isCalendarActionLoading: boolean
  onConnect: () => void
  onSync: () => void
  onDisconnect: () => void
}) {
  if (canManageGoogleCalendar && googleCalendar?.connected) {
    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={isCalendarActionLoading}
          title={googleCalendar.calendarSummary ?? 'Google Agenda conectado'}
          aria-label="Sincronizar com Google Agenda"
        >
          {isCalendarActionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Sincronizar</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDisconnect}
          disabled={isCalendarActionLoading}
          aria-label="Desconectar Google Agenda"
        >
          <Link2Off className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Desconectar</span>
        </Button>
      </div>
    )
  }

  if (canManageGoogleCalendar) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onConnect}
        disabled={isCalendarActionLoading}
        aria-label="Conectar Google Agenda"
      >
        {isCalendarActionLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Google Agenda</span>
      </Button>
    )
  }

  if (isDentistGoogleCalendarLocked) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        aria-label="Google Agenda disponível nos planos Professional e Premium"
        title="Disponível nos planos Professional e Premium"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Google Agenda</span>
      </Button>
    )
  }

  return null
}
