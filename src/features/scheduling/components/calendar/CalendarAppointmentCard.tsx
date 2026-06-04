import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import type { Appointment } from '../../types/scheduling.types'
import { formatWallTime } from '../../utils/time'
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/appointment-display'

type CalendarAppointmentCardProps = {
  appointment: Appointment
  style: CSSProperties
  onClick: (appointment: Appointment) => void
}

/**
 * Appointment card rendered inside the weekly calendar grid.
 * Layout positioning (top/height/left/width) is provided by the parent WeekCalendar
 * via the `style` prop; this component only controls visual content and appearance.
 *
 * Renders in three tiers based on durationMinutes:
 *   - compact  (< 30 min): single-line patient name + time
 *   - normal   (30–59 min): name + time, then service/professional
 *   - rich     (≥ 60 min): normal + professional name when distinct from service
 *
 * Payment status is omitted from the card: the status-color background already
 * communicates appointment state, and payment details are one click away in the drawer.
 */
export function CalendarAppointmentCard({
  appointment,
  style,
  onClick,
}: CalendarAppointmentCardProps) {
  const duration = appointment.durationMinutes ?? 30
  const isCompact = duration < 30
  const isRich = duration >= 60

  const startTime = formatWallTime(appointment.startTime)
  const endTime = formatWallTime(appointment.endTime)
  const serviceName = appointment.service?.name ?? null
  const professionalName = appointment.profile?.displayName ?? null

  // For normal/rich cards the secondary line shows service; for rich cards we
  // additionally show the professional name when it is distinct from the service.
  const secondaryLine = serviceName ?? professionalName

  // Build a descriptive accessible label regardless of visual tier
  const accessibleLabel = [
    appointment.patientName,
    `${startTime} – ${endTime}`,
    serviceName,
    // Include professional separately when both are present
    serviceName && professionalName ? professionalName : null,
    STATUS_LABELS[appointment.status],
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      style={style}
      aria-label={accessibleLabel}
      className={cn(
        'absolute overflow-hidden rounded-md border text-left transition',
        'shadow-sm hover:shadow-md hover:z-10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:z-20',
        isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1.5',
        STATUS_COLORS[appointment.status],
      )}
    >
      {isCompact ? (
        /* Compact: single row — name + time */
        <div className="flex items-center justify-between gap-1 leading-none">
          <span className="truncate text-[11px] font-semibold">
            {appointment.patientName}
          </span>
          <span className="shrink-0 text-[10px] font-medium opacity-60">{startTime}</span>
        </div>
      ) : (
        <>
          {/* Row 1: patient name (dominant) + time (secondary) */}
          <div className="flex items-baseline justify-between gap-1">
            <span className="truncate text-xs font-bold leading-tight">
              {appointment.patientName}
            </span>
            <span className="shrink-0 text-[10px] font-semibold opacity-70">{startTime}</span>
          </div>

          {/* Row 2: service / professional fallback */}
          {secondaryLine && (
            <p className="mt-0.5 truncate text-[11px] font-medium opacity-75">
              {secondaryLine}
            </p>
          )}

          {/* Row 3 (rich only): professional name when different from service */}
          {isRich && serviceName && professionalName && (
            <p className="mt-0.5 truncate text-[11px] opacity-60">{professionalName}</p>
          )}
        </>
      )}
    </button>
  )
}
