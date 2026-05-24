import { useEffect, useMemo, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'
import { listProfiles } from '../services/profiles.service'
import type { ProfileListItem } from '../types/profile.types'
import { useListFilter } from '@/hooks/useListFilter'

import {
  cancelAppointment,
  listAppointments,
  listAvailability,
} from '../services/scheduling.service'
import type { Appointment, Availability } from '../types/scheduling.types'
import {
  createGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  syncGoogleCalendar,
} from '../services/calendar-integrations.service'
import type { GoogleCalendarStatus } from '../types/calendar-integration.types'
import { getWeekStart } from '../utils/time'
import { useAppointmentStatusChange } from './useAppointmentStatusChange'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

const SEARCH_FN = (appointment: Appointment, query: string) =>
  `${appointment.patientName} ${appointment.patientEmail ?? ''} ${
    appointment.patientPhone ?? ''
  }`
    .toLowerCase()
    .includes(query)

const FILTER_FNS = {
  status: (appointment: Appointment, value: string) => appointment.status === value,
  profileId: (appointment: Appointment, value: string) =>
    appointment.profileId === value,
}

export type AppointmentsView = 'calendar' | 'table'

export function useAppointmentsPage() {
  const { showAlert } = useGlobalAlerts()
  const { user } = useAuth()
  const billingStatus = getCachedBillingStatus()
  const isProfessionalOrPremium =
    billingStatus?.planKey === 'professional' || billingStatus?.planKey === 'premium'
  const canManageGoogleCalendar =
    user?.role === 'OWNER' || (user?.role === 'DENTIST' && isProfessionalOrPremium)
  const isDentistGoogleCalendarLocked =
    user?.role === 'DENTIST' && !isProfessionalOrPremium

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<AppointmentsView>('calendar')
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
  const [editTarget, setEditTarget] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [calendarAvailability, setCalendarAvailability] = useState<Availability[]>([])
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
        options: profiles.map((profile) => ({
          value: profile.id,
          label: profile.displayName,
        })),
      })
    }

    return defs
  }, [profiles])

  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    filteredCount,
    filteredData: appointments,
  } = useListFilter<Appointment>(allAppointments, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
  })

  useEffect(() => {
    Promise.all([
      listAppointments(),
      listProfiles(),
      canManageGoogleCalendar ? getGoogleCalendarStatus() : Promise.resolve(null),
    ])
      .then(([appts, profs, calendarStatus]) => {
        setAllAppointments(appts)
        setProfiles(profs)
        setGoogleCalendar(calendarStatus)
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Erro ao carregar agendamentos.'
        setError(message)
        showAlert({
          title: 'Erro ao carregar agendamentos',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => setIsLoading(false))
  }, [canManageGoogleCalendar, showAlert])

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
      if (canManageGoogleCalendar) {
        getGoogleCalendarStatus().then(setGoogleCalendar).catch(() => {})
      }
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
  }, [canManageGoogleCalendar, showAlert])

  const selectedProfileId = activeFilters.profileId as string | undefined

  useEffect(() => {
    if (!selectedProfileId) {
      setCalendarAvailability([])
      return
    }

    listAvailability(selectedProfileId)
      .then(setCalendarAvailability)
      .catch(() => setCalendarAvailability([]))
  }, [selectedProfileId])

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

  const { handleStatusChange } = useAppointmentStatusChange({
    setAppointments: setAllAppointments,
    drawerAppointment,
    setDrawerAppointment,
    setIsActionLoading,
  })

  function handleCancelRequest(appointment: Appointment) {
    setCancelTarget(appointment)
  }

  async function handleCancelConfirm(reason: string) {
    if (!cancelTarget) return

    setIsActionLoading(true)
    try {
      const updated = await cancelAppointment(cancelTarget.id, reason || undefined)
      setAllAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === cancelTarget.id ? updated : appointment,
        ),
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
        description: `${result.synced} agendamento${
          result.synced === 1 ? '' : 's'
        } sincronizado${result.synced === 1 ? '' : 's'}.`,
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
      // The backend may have finished disconnecting despite the timeout.
      // Re-fetching the real status keeps the UI in sync with server state.
      getGoogleCalendarStatus()
        .then(setGoogleCalendar)
        .catch(() => {})
    } finally {
      setIsCalendarActionLoading(false)
    }
  }

  return {
    allAppointments,
    appointments,
    isLoading,
    error,
    view,
    setView,
    drawerAppointment,
    setDrawerAppointment,
    editTarget,
    setEditTarget,
    cancelTarget,
    setCancelTarget,
    isActionLoading,
    isCreating,
    setIsCreating,
    weekStart,
    setWeekStart,
    calendarAvailability,
    googleCalendar,
    isCalendarActionLoading,
    canManageGoogleCalendar,
    isDentistGoogleCalendarLocked,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilter,
    clearAll,
    filteredCount,
    filterDefs,
    handleCreated,
    handleUpdated,
    handleStatusChange,
    handleCancelRequest,
    handleCancelConfirm,
    handleEdit,
    handleConnectGoogleCalendar,
    handleSyncGoogleCalendar,
    handleDisconnectGoogleCalendar,
  }
}
