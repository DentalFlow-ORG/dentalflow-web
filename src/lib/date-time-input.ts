const MIN_YEAR = 1900
const MAX_YEAR = 2100

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

  const month = monthDigits.length === 2 ? clamp(Number(monthDigits), 1, 12) : monthDigits
  const year = yearDigits.length === 4 ? clamp(Number(yearDigits), MIN_YEAR, MAX_YEAR) : yearDigits
  const maxDay =
    typeof month === 'number' ? getDaysInMonth(typeof year === 'number' ? year : 2000, month) : 31
  const day = dayDigits.length === 2 ? clamp(Number(dayDigits), 1, maxDay) : dayDigits

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
