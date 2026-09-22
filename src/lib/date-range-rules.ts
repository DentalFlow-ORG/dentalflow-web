import { brazilDaysAgo, brazilTodayIso } from './brazil-timezone'

const MAX_REPORT_MONTHS = 12

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function todayIso(): string {
  return brazilTodayIso()
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function isFutureDate(iso: string): boolean {
  return iso > todayIso()
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function isEndBeforeStart(start: string, end: string): boolean {
  return Boolean(start && end && end < start)
}

/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
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
