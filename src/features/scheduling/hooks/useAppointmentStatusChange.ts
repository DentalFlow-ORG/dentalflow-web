import type { Dispatch, SetStateAction } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import { updateAppointmentStatus } from '../services/scheduling.service'
import type { Appointment, AppointmentStatus } from '../types/scheduling.types'

interface Options {
  setAppointments: Dispatch<SetStateAction<Appointment[]>>
  drawerAppointment: Appointment | null
  setDrawerAppointment: (appt: Appointment | null) => void
  setIsActionLoading: Dispatch<SetStateAction<boolean>>
}

export function useAppointmentStatusChange({
  setAppointments,
  drawerAppointment,
  setDrawerAppointment,
  setIsActionLoading,
}: Options) {
  const { showAlert } = useGlobalAlerts()

  // Resolves to whether the change was saved, so a confirmation can stay open on failure.
  async function handleStatusChange(id: string, status: AppointmentStatus): Promise<boolean> {
    setIsActionLoading(true)
    try {
      const updated = await updateAppointmentStatus(id, { status })
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
      if (drawerAppointment?.id === id) setDrawerAppointment(updated)
      showAlert({ title: 'Status atualizado', tone: 'success' })
      return true
    } catch (err) {
      showAlert({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
      return false
    } finally {
      setIsActionLoading(false)
    }
  }

  return { handleStatusChange }
}
