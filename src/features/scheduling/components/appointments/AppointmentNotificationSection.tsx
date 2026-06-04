import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppointmentNotificationActions } from '@/features/notifications/components/AppointmentNotificationActions'

import type { Appointment } from '../../types/scheduling.types'
import { formatWallTime } from '../../utils/time'

type Props = {
  appointment: Appointment
}

/**
 * WhatsApp notification section with role gate.
 * Visible to OWNER and ASSISTANT only, and only when the patient has a phone number.
 */
export function AppointmentNotificationSection({ appointment }: Props) {
  const { user } = useAuth()
  const canSend = user?.role === 'OWNER' || user?.role === 'ASSISTANT'

  if (!canSend || !appointment.patientPhone) return null

  return (
    <AppointmentNotificationActions
      appointmentId={appointment.id}
      appointmentStatus={appointment.status}
      patientName={appointment.patientName}
      patientPhone={appointment.patientPhone}
      clinicName="Clínica"
      appointmentDate={appointment.appointmentDate}
      appointmentTime={formatWallTime(appointment.startTime)}
    />
  )
}
