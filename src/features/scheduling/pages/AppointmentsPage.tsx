import { CalendarCheck, CalendarDays, Link2Off, List, Loader2, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { ListToolbar } from '@/components/common/ListToolbar'
import { ListPageShell } from '@/components/common/ListPageShell'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'

import {
  cancelAppointment,
  listAppointments,
  updateAppointmentStatus,
} from '../services/scheduling.service'
import type { Appointment, AppointmentStatus } from '../types/scheduling.types'
import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { CancelAppointmentDialog } from '../components/appointments/CancelAppointmentDialog'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'
import { EditAppointmentModal } from '../components/appointments/EditAppointmentModal'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import {
  createGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  syncGoogleCalendar,
} from '../services/calendar-integrations.service'
import type { GoogleCalendarStatus } from '../types/calendar-integration.types'
import { getWeekStart } from '../utils/time'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

const SEARCH_FN = (a: Appointment, q: string) =>
  `${a.patientName} ${a.patientEmail ?? ''} ${a.patientPhone ?? ''}`.toLowerCase().includes(q)

const FILTER_FNS = {
  status: (a: Appointment, v: string) => a.status === v,
  profileId: (a: Appointment, v: string) => a.profileId === v,
}

type View = 'calendar' | 'table'

export function AppointmentsPage() {
  const { showAlert } = useGlobalAlerts()

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<View>('calendar')
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
  const [editTarget, setEditTarget] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarStatus | null>(null)
  const [isCalendarActionLoading, setIsCalendarActionLoading] = useState(false)

  const filterDefs = useMemo<FilterDef[]>(() => {
    const defs: FilterDef[] = [
      { key: 'status', label: 'Status', options: STATUS_OPTIONS },
    ]
    if (profiles.length > 1) {
      defs.push({
        key: 'profileId',
        label: 'Profissional',
        options: profiles.map((p) => ({ value: p.id, label: p.displayName })),
      })
    }
    return defs
  }, [profiles])

  const {
    searchQuery, setSearchQuery,
    activeFilters, setFilter, clearAll,
    filteredCount,
    filteredData: appointments,
  } = useListFilter<Appointment>(allAppointments, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
  })

  useEffect(() => {
    Promise.all([listAppointments(), listProfiles(), getGoogleCalendarStatus()])
      .then(([appts, profs, calendarStatus]) => {
        setAllAppointments(appts)
        setProfiles(profs)
        setGoogleCalendar(calendarStatus)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar agendamentos.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar agendamentos', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const googleResult = params.get('googleCalendar')
    if (!googleResult) return

    if (googleResult === 'connected') {
      showAlert({
        title: 'Google Agenda conectado',
        description: 'Agora você pode sincronizar os agendamentos da clínica.',
        tone: 'success',
      })
      getGoogleCalendarStatus().then(setGoogleCalendar).catch(() => {})
    }
    if (googleResult === 'error') {
      showAlert({
        title: 'Erro ao conectar Google Agenda',
        description:
          params.get('message') ?? 'Não foi possível conectar o Google Agenda.',
        tone: 'error',
      })
    }

    window.history.replaceState(null, '', window.location.pathname)
  }, [showAlert])

  function handleCreated(appointment: Appointment) {
    setAllAppointments((prev) => [appointment, ...prev])
  }

  function handleUpdated(appointment: Appointment) {
    setAllAppointments((prev) =>
      prev.map((appt) => (appt.id === appointment.id ? appointment : appt)),
    )
    if (drawerAppointment?.id === appointment.id) {
      setDrawerAppointment(appointment)
    }
  }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setIsActionLoading(true)
    try {
      const updated = await updateAppointmentStatus(id, { status })
      setAllAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
      if (drawerAppointment?.id === id) setDrawerAppointment(updated)
      showAlert({ title: 'Status atualizado', tone: 'success' })
    } catch (err) {
      showAlert({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  function handleCancelRequest(appointment: Appointment) {
    setCancelTarget(appointment)
  }

  async function handleCancelConfirm(reason: string) {
    if (!cancelTarget) return
    setIsActionLoading(true)
    try {
      const updated = await cancelAppointment(cancelTarget.id, reason || undefined)
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === cancelTarget.id ? updated : a)),
      )
      if (drawerAppointment?.id === cancelTarget.id) setDrawerAppointment(updated)
      setCancelTarget(null)
      showAlert({ title: 'Agendamento cancelado', tone: 'success' })
    } catch (err) {
      showAlert({
        title: 'Erro ao cancelar agendamento',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  function handleEdit(appointment: Appointment) {
    setDrawerAppointment(null)
    setEditTarget(appointment)
  }

  async function handleConnectGoogleCalendar() {
    setIsCalendarActionLoading(true)
    try {
      const { url } = await createGoogleCalendarConnectUrl()
      window.location.assign(url)
    } catch (err) {
      showAlert({
        title: 'Erro ao conectar Google Agenda',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
      setIsCalendarActionLoading(false)
    }
  }

  async function handleSyncGoogleCalendar() {
    setIsCalendarActionLoading(true)
    try {
      const result = await syncGoogleCalendar()
      const status = await getGoogleCalendarStatus()
      setGoogleCalendar(status)
      showAlert({
        title: 'Google Agenda sincronizado',
        description: `${result.synced} agendamento${result.synced === 1 ? '' : 's'} sincronizado${result.synced === 1 ? '' : 's'}.`,
        tone: 'success',
      })
    } catch (err) {
      showAlert({
        title: 'Erro ao sincronizar Google Agenda',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsCalendarActionLoading(false)
    }
  }

  async function handleDisconnectGoogleCalendar() {
    setIsCalendarActionLoading(true)
    try {
      await disconnectGoogleCalendar()
      setGoogleCalendar({
        connected: false,
        calendarSummary: null,
        connectedAt: null,
        lastSyncedAt: null,
      })
      showAlert({ title: 'Google Agenda desconectado', tone: 'success' })
    } catch (err) {
      showAlert({
        title: 'Erro ao desconectar Google Agenda',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsCalendarActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AppPageHeader
        eyebrow="Agenda"
        title="Agendamentos"
        description="Gerencie as consultas da clínica, acompanhe status e registre novos atendimentos."
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {googleCalendar?.connected ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSyncGoogleCalendar}
                  disabled={isCalendarActionLoading}
                  title={googleCalendar.calendarSummary ?? 'Google Agenda conectado'}
                >
                  {isCalendarActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sincronizar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDisconnectGoogleCalendar}
                  disabled={isCalendarActionLoading}
                >
                  <Link2Off className="h-4 w-4" />
                  Desconectar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectGoogleCalendar}
                disabled={isCalendarActionLoading}
              >
                {isCalendarActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarCheck className="h-4 w-4" />
                )}
                Google Agenda
              </Button>
            )}
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Novo agendamento
            </Button>
          </div>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando agendamentos..."
        error={error}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <ListToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Pesquisar por paciente, e-mail ou telefone..."
                filterDefs={filterDefs}
                activeFilters={activeFilters}
                onFilterChange={setFilter}
                onClearAll={clearAll}
                filteredCount={filteredCount}
                totalCount={allAppointments.length}
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant={view === 'calendar' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setView('calendar')}
                title="Calendário semanal"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={view === 'table' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setView('table')}
                title="Lista"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {view === 'calendar' ? (
            <WeekCalendar
              appointments={appointments}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              onAppointmentClick={setDrawerAppointment}
            />
          ) : (
            <AppointmentTable
              appointments={appointments}
              isActionLoading={isActionLoading}
              onRowClick={setDrawerAppointment}
              onStatusChange={handleStatusChange}
              onCancelRequest={handleCancelRequest}
            />
          )}
        </div>
      </ListPageShell>

      <AppointmentDrawer
        appointment={drawerAppointment}
        isActionLoading={isActionLoading}
        onClose={() => setDrawerAppointment(null)}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onCancelRequest={handleCancelRequest}
      />

      <CancelAppointmentDialog
        open={!!cancelTarget}
        patientName={cancelTarget?.patientName ?? ''}
        isCanceling={isActionLoading}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />

      <EditAppointmentModal
        appointment={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleUpdated}
      />

      <CreateAppointmentModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
