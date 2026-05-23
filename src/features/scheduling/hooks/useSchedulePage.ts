import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { listProfiles } from '../services/profiles.service'
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
import { getWeekStart } from '../utils/time'
import { useAppointmentStatusChange } from './useAppointmentStatusChange'

export type ScheduleTab = 'agenda' | 'disponibilidade' | 'excecoes'
export type ScheduleView = 'calendar' | 'table'

export const DENTIST_ALLOWED_TRANSITIONS: AppointmentStatus[] = [
  'COMPLETED',
  'NO_SHOW',
]

export function useSchedulePage() {
  const { user } = useAuth()
  const { showAlert } = useGlobalAlerts()

  const [ownProfile, setOwnProfile] = useState<ProfileListItem | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ScheduleTab>('agenda')
  const [view, setView] = useState<ScheduleView>('calendar')
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profiles, appts] = await Promise.all([
          listProfiles(),
          listAppointments(),
        ])
        const mine = profiles.find((profile) => profile.userId === user?.id) ?? null
        setOwnProfile(mine)
        setAppointments(mine ? appts.filter((appt) => appt.profileId === mine.id) : [])

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
  }, [user?.id, showAlert])

  const { handleStatusChange } = useAppointmentStatusChange({
    setAppointments,
    drawerAppointment,
    setDrawerAppointment,
    setIsActionLoading,
  })

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
  }
}
