import { brazilAddMonths, brazilDaysAgo, brazilTodayIso } from './brazil-timezone'

const MAX_REPORT_MONTHS = 12
const MAX_FOLLOW_UP_MONTHS = 24

export function todayIso(): string {
  return brazilTodayIso()
}

export function isFutureDate(iso: string): boolean {
  return iso > todayIso()
}

export function isEndBeforeStart(start: string, end: string): boolean {
  return Boolean(start && end && end < start)
}

export function rangeExceedsMonths(start: string, end: string, maxMonths: number): boolean {
  if (!start || !end) return false
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const limitDate = new Date(sy, sm - 1 + maxMonths, sd)
  const endDate = new Date(ey, em - 1, ed)
  return endDate > limitDate
}

export function defaultLast30DaysRange(): { startDate: string; endDate: string } {
  const endDate = brazilTodayIso()
  const startDate = brazilDaysAgo(30)
  return { startDate, endDate }
}

export function maxFollowUpIso(): string {
  return brazilAddMonths(brazilTodayIso(), MAX_FOLLOW_UP_MONTHS)
}

export type DateRangeValidationOptions = {
  allowFuture?: boolean
  maxMonths?: number
}

export function validateReportDateRange(
  start: string | undefined,
  end: string | undefined,
  opts: DateRangeValidationOptions = {},
): string | null {
  const { allowFuture = false, maxMonths = MAX_REPORT_MONTHS } = opts

  if (end && !allowFuture && isFutureDate(end)) {
    return 'A data final não pode ser futura para este relatório.'
  }

  if (!start || !end) return null

  if (isEndBeforeStart(start, end)) {
    return 'A data final não pode ser anterior à data inicial.'
  }

  if (rangeExceedsMonths(start, end, maxMonths)) {
    return 'Selecione um período de até 12 meses por vez.'
  }

  return null
}

export function validateFollowUpDate(date: string | undefined, isCreate: boolean): string | null {
  if (!date) return null

  if (isCreate && date < todayIso()) {
    return 'O follow-up não pode ser anterior à data atual.'
  }

  if (date > maxFollowUpIso()) {
    return 'A data de follow-up deve estar dentro dos próximos 24 meses.'
  }

  return null
}
