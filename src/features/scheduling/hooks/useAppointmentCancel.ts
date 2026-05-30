import type { Dispatch, SetStateAction } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import { cancelAppointment } from '../services/scheduling.service'
import type { Appointment } from '../types/scheduling.types'

interface Options {
  setAppointments: Dispatch<SetStateAction<Appointment[]>>
  drawerAppointment: Appointment | null
  setDrawerAppointment: (appt: Appointment | null) => void
  setIsActionLoading: Dispatch<SetStateAction<boolean>>
  cancelTarget: Appointment | null
  setCancelTarget: (appt: Appointment | null) => void
}

export function useAppointmentCancel({
  setAppointments,
  drawerAppointment,
  setDrawerAppointment,
  setIsActionLoading,
  cancelTarget,
  setCancelTarget,
}: Options) {
  const { showAlert } = useGlobalAlerts()

  function handleCancelRequest(appointment: Appointment) {
    setCancelTarget(appointment)
  }

  async function handleCancelConfirm(reason: string) {
    if (!cancelTarget) return

    setIsActionLoading(true)
    try {
      const updated = await cancelAppointment(cancelTarget.id, reason || undefined)
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === cancelTarget.id ? updated : appt)),
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

  return { handleCancelRequest, handleCancelConfirm }
}
