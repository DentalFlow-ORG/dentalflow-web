import { Link2Off, Loader2, Plus, RefreshCw } from 'lucide-react'

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

function GoogleCalendarButton({
  googleCalendar,
  canManageGoogleCalendar,
  isCalendarActionLoading,
  onConnect,
  onSync,
  onDisconnect,
}: {
  googleCalendar: GoogleCalendarStatus | null
  canManageGoogleCalendar: boolean
  isCalendarActionLoading: boolean
  onConnect: () => void
  onSync: () => void
  onDisconnect: () => void
}) {
  if (canManageGoogleCalendar && googleCalendar?.connected) {
    return (
      <div className="flex items-center gap-1">
        <GoogleCalendarIcon className="h-4 w-4 shrink-0" />
        <Button
          type="button"
          variant="outline"
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
        onClick={onConnect}
        disabled={isCalendarActionLoading}
        aria-label="Conectar Google Agenda"
      >
        {isCalendarActionLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleCalendarIcon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Google Agenda</span>
      </Button>
    )
  }

  return null
}

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Calendar body */}
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="white" stroke="#DADCE0" strokeWidth="0.75" />
      {/* Blue header bar */}
      <path d="M1.5 4C1.5 3.17 2.17 2.5 3 2.5H13C13.83 2.5 14.5 3.17 14.5 4V5.5H1.5V4Z" fill="#4285F4" />
      {/* Calendar hooks */}
      <rect x="4.5" y="1" width="1.25" height="3" rx="0.625" fill="#1A73E8" />
      <rect x="10.25" y="1" width="1.25" height="3" rx="0.625" fill="#1A73E8" />
      {/* Content blocks suggesting a calendar grid */}
      <rect x="2.5" y="7.5" width="4.5" height="3" rx="0.5" fill="#EA4335" opacity="0.9" />
      <rect x="8.5" y="7.5" width="4" height="1.25" rx="0.5" fill="#34A853" opacity="0.9" />
      <rect x="8.5" y="9.5" width="4" height="1.25" rx="0.5" fill="#FBBC04" opacity="0.9" />
      <rect x="2.5" y="12" width="10" height="1.25" rx="0.5" fill="#DADCE0" />
    </svg>
  )
}
