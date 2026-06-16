import { BRAZIL_TZ, brazilTodayIso } from './brazil-timezone'

export type DateInputValue = Date | string | null | undefined

export function formatDateInputValue(value: DateInputValue) {
  if (!value) return ''

  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoDateMatch) return isoDateMatch[1]

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''

  const year = parsedDate.getUTCFullYear()
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatTimeInputValue(value: DateInputValue) {
  if (!value) return ''

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    const hours = String(value.getUTCHours()).padStart(2, '0')
    const minutes = String(value.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const timeMatch = value.match(/^(\d{2}):(\d{2})/)
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''

  const hours = String(parsedDate.getUTCHours()).padStart(2, '0')
  const minutes = String(parsedDate.getUTCMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export function formatDateBR(value: string | null | undefined) {
  if (!value) return ''
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function safeFormatDateBR(value: DateInputValue, fallback = 'Data não informada') {
  const inputValue = formatDateInputValue(value)
  return inputValue ? formatDateBR(inputValue) : fallback
}

export function safeFormatTimeBR(value: DateInputValue, fallback = 'Hora não informada') {
  const inputValue = formatTimeInputValue(value)
  return inputValue || fallback
}

export function formatDateLongBR(value: DateInputValue) {
  if (!value) return ''

  const inputValue = formatDateInputValue(value)
  if (!inputValue) return ''

  return new Date(`${inputValue}T00:00:00.000Z`).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function wallTimeToMinutes(value: string) {
  const timeValue = formatTimeInputValue(value)
  if (!timeValue) return 0

  const [hours, minutes] = timeValue.split(':').map(Number)
  return hours * 60 + minutes
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date)
  weekStart.setHours(0, 0, 0, 0)

  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)

  return weekStart
}

/**
 * Returns the Monday (start of ISO week) for the given Brazil calendar date.
 *
 * Accepts a YYYY-MM-DD string — the format produced by brazilTodayIso() and
 * DatePickerInput — to avoid UTC-midnight parsing drift.
 *
 * Why a string instead of a Date:
 *   new Date('2026-06-01') is parsed as UTC midnight. In a UTC-3 environment
 *   that equals 2026-05-31T21:00 local, so getDay() sees Sunday and the week
 *   start shifts back 6 days to May 25 — wrong for a Brazil user who entered
 *   June 1.  Using new Date(y, m-1, d) (local constructor) avoids this drift.
 */
export function getBrazilWeekStart(isoDate: string): Date {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    throw new Error(`getBrazilWeekStart: expected YYYY-MM-DD, got "${isoDate}"`)
  }
  const [, y, m, d] = match.map(Number)
  return getWeekStart(new Date(y, m - 1, d))
}

export function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    return addDays(weekStart, index)
  })
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export function isToday(date: Date) {
  // Compare against Brazil calendar date so the "today" highlight in the
  // calendar is correct even when the browser/server runs in UTC.
  const todayStr = brazilTodayIso()
  const [ty, tm, td] = todayStr.split('-').map(Number)
  return date.getFullYear() === ty && date.getMonth() === tm - 1 && date.getDate() === td
}

/**
 * Returns the current wall-clock time in Brazil (America/Sao_Paulo) as 'HH:mm'.
 * Uses Intl.DateTimeFormat so the result is correct regardless of the browser's
 * own timezone setting.
 */
export function brazilCurrentTimeHHmm(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BRAZIL_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const hours = parts.find((p) => p.type === 'hour')!.value
  const minutes = parts.find((p) => p.type === 'minute')!.value
  // hour12:false can produce '24' for midnight in some engines — normalise it
  const h = String(Number(hours) % 24).padStart(2, '0')
  return `${h}:${minutes.padStart(2, '0')}`
}

export function formatWeekDayHeader(date: Date): { weekday: string; day: string } {
  return {
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    day: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', ''),
  }
}

export function formatWeekRangeLabel(start: Date, end: Date) {
  const startLabel = start
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    .replace('.', '')
  const endLabel = end
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')

  return `${startLabel} - ${endLabel}`
}
