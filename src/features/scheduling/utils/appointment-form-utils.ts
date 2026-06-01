import {
  brazilCurrentTimeHHmm,
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import { brazilTodayIso } from '@/lib/brazil-timezone'

import type { Appointment, Availability, AvailabilityException } from '../types/scheduling.types'

export function reaisToCents(value: string): number | undefined {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '')
  const parsed = parseFloat(normalized)
  if (isNaN(parsed) || parsed < 0) return undefined
  return Math.round(parsed * 100)
}

export function centsToReais(cents: number | null | undefined): string {
  if (cents == null) return ''
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function getCurrentTimeInputValue(): string {
  return brazilCurrentTimeHHmm()
}

export function isDateAvailable(
  dateValue: string,
  availability: Availability[],
  exceptions: AvailabilityException[],
): boolean {
  if (!dateValue) return true
  const exception = exceptions.find((e) => formatDateInputValue(e.exceptionDate) === dateValue)
  if (exception?.isDayOff) return false
  if (exception) return true
  const dow = new Date(`${dateValue}T00:00:00Z`).getUTCDay()
  if (availability.length === 0) return dow >= 1 && dow <= 5
  return availability.some((a) => a.dayOfWeek === dow && a.isActive)
}

export function hasAppointmentTimePassed(appointment: Appointment): boolean {
  const appointmentDate = formatDateInputValue(appointment.appointmentDate)
  // Use Brazil calendar date so "today" doesn't advance to the UTC next day
  // during 00:00–03:00 UTC when Brazil is still on the previous day.
  const today = brazilTodayIso()
  if (appointmentDate < today) return true
  if (appointmentDate > today) return false
  return formatTimeInputValue(appointment.startTime) < getCurrentTimeInputValue()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
