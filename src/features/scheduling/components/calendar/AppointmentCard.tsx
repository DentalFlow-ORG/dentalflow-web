import { cn } from '@/lib/utils'

import { formatWallTime } from '../../utils/time'
import type { Appointment } from '../../types/scheduling.types'
import { STATUS_CONFIG } from '../appointments/AppointmentStatusBadge'

type AppointmentCardProps = {
  appointment: Appointment
  onClick: (appointment: Appointment) => void
}

const STATUS_ACCENT: Record<string, string> = {
  PENDING: 'border-l-amber-400 bg-amber-50',
  CONFIRMED: 'border-l-emerald-400 bg-emerald-50',
  COMPLETED: 'border-l-slate-300 bg-slate-50',
  CANCELED: 'border-l-red-300 bg-red-50 opacity-60',
  NO_SHOW: 'border-l-orange-300 bg-orange-50 opacity-60',
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const accent = STATUS_ACCENT[appointment.status] ?? 'border-l-slate-300 bg-slate-50'

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      className={cn(
        'w-full rounded border-l-4 px-2.5 py-2 text-left transition-opacity hover:opacity-80',
        accent,
      )}
    >
      <p className="text-xs font-semibold text-slate-800 truncate">
        {appointment.patientName}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {formatWallTime(appointment.startTime)}
        {appointment.service && ` · ${appointment.service.name}`}
      </p>
      <span className="mt-1 inline-block text-[10px] font-semibold text-slate-500">
        {STATUS_CONFIG[appointment.status].label}
      </span>
    </button>
  )
}
