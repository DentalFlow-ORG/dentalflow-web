import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  createGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  syncGoogleCalendar,
} from '../services/calendar-integrations.service'
import { listProfiles } from '../services/profiles.service'
import type { GoogleCalendarStatus } from '../types/calendar-integration.types'
import type { ProfileListItem } from '../types/profile.types'

import {
  listAppointments,
  listAvailability,
  listAvailabilityExceptions,
} from '../services/scheduling.service'
import type {
  Appointment,
  AppointmentStatus,
  Availability,
  AvailabilityException,
} from '../types/scheduling.types'
import { getBrazilWeekStart } from '../utils/time'
import { useAppointmentStatusChange } from './useAppointmentStatusChange'

export type ScheduleTab = 'agenda' | 'disponibilidade' | 'excecoes'
export type ScheduleView = 'calendar' | 'table'

export const DENTIST_ALLOWED_TRANSITIONS: AppointmentStatus[] = ['COMPLETED', 'NO_SHOW']

export function useSchedulePage() {
  const { user } = useAuth()
  const { showAlert } = useGlobalAlerts()
  const { googleCalendar: googleResult, message: googleErrorMessage } = useSearch({
    from: '/app/agenda',
  })
  const navigate = useNavigate()

  const canManageGoogleCalendar = user?.role === 'DENTIST'

  const [ownProfile, setOwnProfile] = useState<ProfileListItem | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ScheduleTab>('agenda')
  const [view, setView] = useState<ScheduleView>('calendar')
  const [weekStart, setWeekStart] = useState(() => getBrazilWeekStart(brazilTodayIso()))
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarStatus | null>(null)
  const [isCalendarActionLoading, setIsCalendarActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profiles, appts, calendarStatus] = await Promise.all([
          listProfiles(),
          listAppointments(),
          canManageGoogleCalendar ? getGoogleCalendarStatus() : Promise.resolve(null),
        ])
        const mine = profiles.find((profile) => profile.userId === user?.id) ?? null
        setOwnProfile(mine)
        setAppointments(mine ? appts.filter((appt) => appt.profileId === mine.id) : [])
        setGoogleCalendar(calendarStatus)

        if (mine) {
          const [avail, excs] = await Promise.all([
            listAvailability(mine.id),
            listAvailabilityExceptions(mine.id),
          ])
          setAvailability(avail)
          setExceptions(excs)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar agenda.'
        setError(message)
        showAlert({
          title: 'Erro ao carregar agenda',
          description: message,
          tone: 'error',
        })
      } finally {
        setIsBootstrapping(false)
      }
    }

    load()
  }, [user?.id, canManageGoogleCalendar, showAlert])

  useEffect(() => {
    if (!googleResult) return

    if (googleResult === 'connected') {
      showAlert({
        title: 'Google Agenda conectado',
        description: 'Agora você pode sincronizar os agendamentos da clínica.',
        tone: 'success',
      })
      if (canManageGoogleCalendar) {
        getGoogleCalendarStatus()
          .then(setGoogleCalendar)
          .catch(() => {})
      }
    }

    if (googleResult === 'error') {
      showAlert({
        title: 'Erro ao conectar Google Agenda',
        description: googleErrorMessage ?? 'Não foi possível conectar o Google Agenda.',
        tone: 'error',
      })
    }

    navigate({ to: '/app/agenda', replace: true })
  }, [googleResult, googleErrorMessage, canManageGoogleCalendar, showAlert, navigate])

  const { handleStatusChange } = useAppointmentStatusChange({
    setAppointments,
    drawerAppointment,
    setDrawerAppointment,
    setIsActionLoading,
  })

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
      getGoogleCalendarStatus()
        .then(setGoogleCalendar)
        .catch(() => {})
    } finally {
      setIsCalendarActionLoading(false)
    }
  }

  return {
    ownProfile,
    appointments,
    availability,
    setAvailability,
    exceptions,
    setExceptions,
    isBootstrapping,
    error,
    activeTab,
    setActiveTab,
    view,
    setView,
    weekStart,
    setWeekStart,
    drawerAppointment,
    setDrawerAppointment,
    isActionLoading,
    handleStatusChange,
    googleCalendar,
    isCalendarActionLoading,
    canManageGoogleCalendar,
    handleConnectGoogleCalendar,
    handleSyncGoogleCalendar,
    handleDisconnectGoogleCalendar,
  }
}
