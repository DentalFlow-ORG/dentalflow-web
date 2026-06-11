// Scheduling API stores wall-clock times as UTC timestamps, for example
// "1970-01-01T14:00:00.000Z". Keep these domain aliases here so components
// do not need to know that transport detail.

import {
  addDays,
  formatDateInputValue,
  formatDateLongBR,
  formatTimeInputValue,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getBrazilWeekStart,
  getWeekDates,
  isToday,
  safeFormatDateBR,
  safeFormatTimeBR,
  wallTimeToMinutes,
} from '@/lib/date-time-formatters'

export const BUSINESS_START_TIME = '08:00'
export const BUSINESS_END_TIME = '18:00'

export function formatWallTime(isoTime: string | Date | null | undefined): string {
  return safeFormatTimeBR(isoTime)
}

export function formatAppointmentDate(isoDate: string | Date | null | undefined): string {
  return safeFormatDateBR(isoDate)
}

export function formatAppointmentDateLong(isoDate: string | Date | null | undefined): string {
  return formatDateLongBR(isoDate) || 'Data não informada'
}

export function isoDateToString(isoDate: string | Date | null | undefined): string {
  return formatDateInputValue(isoDate)
}

export function toDateInputValue(date: Date): string {
  return formatDateInputValue(date)
}

export function isBusinessTime(value: string) {
  const timeValue = formatTimeInputValue(value)

  return Boolean(timeValue && timeValue >= BUSINESS_START_TIME && timeValue <= BUSINESS_END_TIME)
}

export {
  addDays,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getBrazilWeekStart,
  getWeekDates,
  isToday,
  wallTimeToMinutes,
}
