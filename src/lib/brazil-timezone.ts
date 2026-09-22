export const BRAZIL_TZ = 'America/Sao_Paulo'

function brazilDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BRAZIL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((p) => p.type === 'year')!.value),
    month: Number(parts.find((p) => p.type === 'month')!.value),
    day: Number(parts.find((p) => p.type === 'day')!.value),
  }
}

/** Returns the current calendar date in Brazil as 'YYYY-MM-DD'. */
export function brazilTodayIso(now = new Date()): string {
  const { year, month, day } = brazilDateParts(now)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Returns the current year-month in Brazil as 'YYYY-MM'. */
export function brazilCurrentIsoMonth(now = new Date()): string {
  const { year, month } = brazilDateParts(now)
  return `${year}-${String(month).padStart(2, '0')}`
}

/** Returns the first and last day of the current Brazil month as 'YYYY-MM-DD' strings. */
export function brazilCurrentMonthRange(now = new Date()): { from: string; to: string } {
  const { year, month } = brazilDateParts(now)
  const y = String(year)
  const m = String(month).padStart(2, '0')
  // new Date(year, month, 0) gives the last day of the previous month (i.e., last day of `month`)
  const daysInMonth = new Date(year, month, 0).getDate()
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(daysInMonth).padStart(2, '0')}`,
  }
}

/**
 * Returns the Brazil calendar date that is `days` before today as 'YYYY-MM-DD'.
 * Uses UTC noon to stay well within any single Brazil day across the -03:00 offset.
 */
export function brazilDaysAgo(days: number, now = new Date()): string {
  const today = brazilTodayIso(now)
  const [ty, tm, td] = today.split('-').map(Number)
  return brazilTodayIso(new Date(Date.UTC(ty, tm - 1, td - days, 12, 0, 0)))
}

/**
 * Adds `months` calendar months to an ISO date string and returns the resulting
 * Brazil calendar date as 'YYYY-MM-DD'. Overflowing days (e.g. Jan 31 + 1 month)
 * normalise to the next month — same behaviour as the native Date APIs.
 */
/** @testContract Kept for focused behavior/contract tests; see production-hardening.md. */
export function brazilAddMonths(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return brazilTodayIso(new Date(Date.UTC(y, m - 1 + months, d, 12, 0, 0)))
}
