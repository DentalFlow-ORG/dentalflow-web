import type { Appointment, AppointmentStatus } from '../types/scheduling.types'
import { formatWallTime, isoDateToString } from './time'

// Mirrors the server-side state machine in appointments.service.ts.
// Any change here must be reflected there and vice-versa.
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELED'],
  COMPLETED: [],
  NO_SHOW:   [],
  CANCELED:  [],
}

export function isTerminalStatus(status: AppointmentStatus): boolean {
  return APPOINTMENT_TRANSITIONS[status].length === 0
}

function buildAppointmentDateTime(appointment: Appointment): Date {
  const dateStr = isoDateToString(appointment.appointmentDate) // YYYY-MM-DD
  const timeStr = formatWallTime(appointment.startTime)        // HH:mm
  return new Date(`${dateStr}T${timeStr}:00`)
}

/**
 * Returns true if transitioning this appointment to `target` is currently
 * valid, considering both the state machine and the appointment's date/time.
 */
export function canTransitionTo(
  appointment: Appointment,
  target: AppointmentStatus,
  now = new Date(),
): boolean {
  if (!APPOINTMENT_TRANSITIONS[appointment.status].includes(target)) return false

  // COMPLETED and NO_SHOW require the appointment slot to have already started.
  if (target === 'COMPLETED' || target === 'NO_SHOW') {
    return buildAppointmentDateTime(appointment) <= now
  }

  return true
}

/**
 * Returns the list of status targets that can be acted on right now,
 * optionally filtered by a role-based allowlist.
 *
 * Used by both the appointment list and the detail drawer so action
 * visibility is always computed from the same rules.
 */
export function getAvailableTransitions(
  appointment: Appointment,
  options?: {
    /** Destination statuses the current user's role permits. Omit for no role restriction. */
    roleAllowedTargets?: AppointmentStatus[]
    /** Override for testing or server-side rendering. Defaults to new Date(). */
    now?: Date
  },
): AppointmentStatus[] {
  const { roleAllowedTargets, now = new Date() } = options ?? {}

  return APPOINTMENT_TRANSITIONS[appointment.status].filter((target) => {
    if (roleAllowedTargets && !roleAllowedTargets.includes(target)) return false
    return canTransitionTo(appointment, target, now)
  })
}
