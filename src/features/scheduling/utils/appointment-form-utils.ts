import { brazilTodayIso } from '@/lib/brazil-timezone'
import {
  brazilCurrentTimeHHmm,
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import { centsToMoneyInput, parseMoneyInputToCents } from '@/lib/money-input'

import type { Appointment, Availability, AvailabilityException } from '../types/scheduling.types'

/** Service prices come from the API in reais; the form edits them as a cents-masked input. */
export function servicePriceToMoneyInput(priceFrom: number | null | undefined): string {
  if (priceFrom == null) return ''
  return centsToMoneyInput(Math.round(priceFrom * 100))
}

/** An empty money input means "not informed", which the API stores as null. */
export function moneyInputToOptionalCents(value: string): number | null {
  return value.trim() ? parseMoneyInputToCents(value) : null
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
