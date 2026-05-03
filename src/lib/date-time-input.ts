export const MIN_YEAR = 1900
export const MAX_YEAR = 2100

export function isoToDisplayDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ''

  return `${match[3]}/${match[2]}/${match[1]}`
}

export function displayDateToIso(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (year < MIN_YEAR || year > MAX_YEAR) return null

  const maxDay = getDaysInMonth(year, month)
  const safeDay = Math.min(day, maxDay)

  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(safeDay).padStart(2, '0'),
  ].join('-')
}

export function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const dayDigits = digits.slice(0, 2)
  const monthDigits = digits.slice(2, 4)
  const yearDigits = digits.slice(4, 8)

  const month =
    monthDigits.length === 2 ? clamp(Number(monthDigits), 1, 12) : monthDigits
  const year =
    yearDigits.length === 4
      ? clamp(Number(yearDigits), MIN_YEAR, MAX_YEAR)
      : yearDigits
  const maxDay =
    typeof month === 'number'
      ? getDaysInMonth(typeof year === 'number' ? year : 2000, month)
      : 31
  const day =
    dayDigits.length === 2 ? clamp(Number(dayDigits), 1, maxDay) : dayDigits

  const parts = [
    formatInputPart(day, dayDigits.length),
    formatInputPart(month, monthDigits.length),
    formatInputPart(year, yearDigits.length),
  ].filter(Boolean)

  return parts.join('/')
}

export function parseIsoDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function buildTimeOptions(stepMinutes = 15) {
  return Array.from({ length: (24 * 60) / stepMinutes }, (_, index) => {
    const totalMinutes = index * stepMinutes
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const minutes = String(totalMinutes % 60).padStart(2, '0')

    return `${hours}:${minutes}`
  })
}

export function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false

  return Number(match[1]) <= 23 && Number(match[2]) <= 59
}

export function isBeforeMinTime(value: string, minValue: string) {
  return Boolean(minValue && value && value < minValue)
}

export function isAfterMaxTime(value: string, maxValue: string) {
  return Boolean(maxValue && value && value > maxValue)
}

export function maskTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  const hourDigits = digits.slice(0, 2)
  const minuteDigits = digits.slice(2, 4)
  const hour =
    hourDigits.length === 2 ? clamp(Number(hourDigits), 0, 23) : hourDigits
  const minute =
    minuteDigits.length === 2
      ? clamp(Number(minuteDigits), 0, 59)
      : minuteDigits
  const parts = [
    formatInputPart(hour, hourDigits.length),
    formatInputPart(minute, minuteDigits.length),
  ].filter(Boolean)

  return parts.join(':')
}

function formatInputPart(value: number | string, length: number) {
  if (!length) return ''
  if (typeof value === 'number') {
    return String(value).padStart(length, '0')
  }

  return value
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min

  return Math.min(Math.max(value, min), max)
}
