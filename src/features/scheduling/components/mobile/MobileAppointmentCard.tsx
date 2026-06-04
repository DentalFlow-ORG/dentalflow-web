import { cn } from '@/lib/utils'

import type { Appointment } from '../../types/scheduling.types'
import { formatWallTime } from '../../utils/time'
import { STATUS_LABELS } from '../../constants/appointment-display'
import { AppointmentStatusBadge } from '../appointments/AppointmentStatusBadge'

type MobileAppointmentCardProps = {
  appointment: Appointment
  onClick: (appointment: Appointment) => void
}

export function MobileAppointmentCard({ appointment, onClick }: MobileAppointmentCardProps) {
  const startTime = formatWallTime(appointment.startTime)
  const endTime = formatWallTime(appointment.endTime)
  const serviceName = appointment.service?.name ?? null
  const professionalName = appointment.profile?.displayName ?? null
  const secondLine = serviceName ?? professionalName
  const statusLabel = STATUS_LABELS[appointment.status]

  const ariaLabel = [
    appointment.patientName,
    `${startTime} – ${endTime}`,
    serviceName,
    serviceName && professionalName ? professionalName : null,
    statusLabel,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      aria-label={ariaLabel}
      className={cn(
        'w-full rounded-xl border border-border bg-card text-left',
        'shadow-sm transition hover:shadow-md active:scale-[0.99]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        appointment.status === 'CANCELED' && 'opacity-60',
      )}
    >
      <div className="flex items-stretch gap-0 px-4 py-3.5">
        {/* Time column */}
        <div className="flex w-14 shrink-0 flex-col items-center justify-center pr-3">
          <span className="text-sm font-bold tabular-nums text-foreground leading-tight">
            {startTime}
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {endTime}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="w-px shrink-0 self-stretch bg-border" aria-hidden="true" />

        {/* Content */}
        <div className="min-w-0 flex-1 pl-3 py-0.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {appointment.patientName}
          </p>
          {secondLine && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{secondLine}</p>
          )}
          {serviceName && professionalName && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
              {professionalName}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div className="flex shrink-0 items-center pl-3">
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>
    </button>
  )
}
