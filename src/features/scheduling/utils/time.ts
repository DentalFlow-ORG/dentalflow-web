// Scheduling API stores wall-clock times as UTC timestamps, for example
// "1970-01-01T14:00:00.000Z". Keep these domain aliases here so components
// do not need to know that transport detail.

import {
  addDays,
  formatDateBR,
  formatDateInputValue,
  formatDateLongBR,
  formatTimeInputValue,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getWeekDates,
  getWeekStart,
  isToday,
  wallTimeToMinutes,
} from '@/lib/date-time-formatters'

export function formatWallTime(isoTime: string): string {
  return formatTimeInputValue(isoTime)
}

export function formatAppointmentDate(isoDate: string): string {
  return formatDateBR(isoDate)
}

export function formatAppointmentDateLong(isoDate: string): string {
  return formatDateLongBR(isoDate)
}

export function isoDateToString(isoDate: string): string {
  return formatDateInputValue(isoDate)
}

export function toDateInputValue(date: Date): string {
  return formatDateInputValue(date)
}

export {
  addDays,
  formatWeekDayHeader,
  formatWeekRangeLabel,
  getWeekDates,
  getWeekStart,
  isToday,
  wallTimeToMinutes,
}
