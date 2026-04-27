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

export function formatTimeInputValue(value: string | null | undefined) {
  if (!value) return ''

  const timeMatch = value.match(/^(\d{2}):(\d{2})/)
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''

  const hours = String(parsedDate.getUTCHours()).padStart(2, '0')
  const minutes = String(parsedDate.getUTCMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export function formatDateBR(value: string | null | undefined) {
  const inputValue = formatDateInputValue(value)
  if (!inputValue) return ''

  const [year, month, day] = inputValue.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateLongBR(value: string | null | undefined) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('pt-BR', {
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

export function getWeekStart(date: Date) {
  const weekStart = new Date(date)
  weekStart.setHours(0, 0, 0, 0)

  const day = weekStart.getDay()
  const diff = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + diff)

  return weekStart
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
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
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
