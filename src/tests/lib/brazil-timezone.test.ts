import {
  BRAZIL_TZ,
  brazilAddMonths,
  brazilCurrentIsoMonth,
  brazilCurrentMonthRange,
  brazilDaysAgo,
  brazilTodayIso,
} from '@/lib/brazil-timezone'

// Brazil is UTC-3 year-round (DST abolished in 2019).
// Midnight Brazil = 03:00 UTC. All fixtures use explicit UTC timestamps.

describe('BRAZIL_TZ', () => {
  it('is America/Sao_Paulo', () => {
    expect(BRAZIL_TZ).toBe('America/Sao_Paulo')
  })
})

describe('brazilTodayIso', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(brazilTodayIso(new Date('2026-06-15T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the Brazil calendar date for a UTC noon timestamp', () => {
    // 2026-06-15 12:00 UTC = 2026-06-15 09:00 Brazil
    expect(brazilTodayIso(new Date('2026-06-15T12:00:00Z'))).toBe('2026-06-15')
  })

  it('returns PREVIOUS day in Brazil for a timestamp between 00:00 and 02:59 UTC', () => {
    // 2026-06-01 02:59 UTC = 2026-05-31 23:59 Brazil (still yesterday in Brazil)
    expect(brazilTodayIso(new Date('2026-06-01T02:59:00Z'))).toBe('2026-05-31')
  })

  it('returns the new Brazil day at exactly 03:00 UTC (Brazil midnight)', () => {
    // 2026-06-01 03:00 UTC = 2026-06-01 00:00 Brazil
    expect(brazilTodayIso(new Date('2026-06-01T03:00:00Z'))).toBe('2026-06-01')
  })

  it('handles year boundary correctly', () => {
    // 2026-01-01 02:00 UTC = 2025-12-31 23:00 Brazil
    expect(brazilTodayIso(new Date('2026-01-01T02:00:00Z'))).toBe('2025-12-31')
    // 2026-01-01 03:00 UTC = 2026-01-01 00:00 Brazil
    expect(brazilTodayIso(new Date('2026-01-01T03:00:00Z'))).toBe('2026-01-01')
  })
})

describe('brazilCurrentIsoMonth', () => {
  it('returns YYYY-MM format', () => {
    expect(brazilCurrentIsoMonth(new Date('2026-06-15T12:00:00Z'))).toMatch(/^\d{4}-\d{2}$/)
  })

  it('returns the Brazil month for a UTC timestamp', () => {
    expect(brazilCurrentIsoMonth(new Date('2026-06-15T12:00:00Z'))).toBe('2026-06')
  })

  it('returns the previous Brazil month when UTC timestamp crosses midnight but not Brazil midnight', () => {
    // 2026-06-01 01:00 UTC = 2026-05-31 22:00 Brazil — still May in Brazil
    expect(brazilCurrentIsoMonth(new Date('2026-06-01T01:00:00Z'))).toBe('2026-05')
  })
})

describe('brazilCurrentMonthRange', () => {
  it('returns the first and last day of the Brazil month', () => {
    const { from, to } = brazilCurrentMonthRange(new Date('2026-06-15T12:00:00Z'))
    expect(from).toBe('2026-06-01')
    expect(to).toBe('2026-06-30')
  })

  it('handles February in a non-leap year', () => {
    const { from, to } = brazilCurrentMonthRange(new Date('2026-02-15T12:00:00Z'))
    expect(from).toBe('2026-02-01')
    expect(to).toBe('2026-02-28')
  })

  it('handles February in a leap year', () => {
    const { from, to } = brazilCurrentMonthRange(new Date('2024-02-15T12:00:00Z'))
    expect(from).toBe('2024-02-01')
    expect(to).toBe('2024-02-29')
  })

  it('handles a 31-day month', () => {
    const { from, to } = brazilCurrentMonthRange(new Date('2026-05-15T12:00:00Z'))
    expect(from).toBe('2026-05-01')
    expect(to).toBe('2026-05-31')
  })

  it('when UTC day is 1st but Brazil is still in the previous month, returns previous month range', () => {
    // 2026-06-01 01:00 UTC = 2026-05-31 22:00 Brazil
    const { from, to } = brazilCurrentMonthRange(new Date('2026-06-01T01:00:00Z'))
    expect(from).toBe('2026-05-01')
    expect(to).toBe('2026-05-31')
  })

  it('from is always 01, to is always the last day', () => {
    const { from, to } = brazilCurrentMonthRange(new Date('2026-03-10T12:00:00Z'))
    expect(from.endsWith('-01')).toBe(true)
    expect(to).toBe('2026-03-31')
  })
})

describe('brazilDaysAgo', () => {
  it('returns a date N days before the Brazil today', () => {
    // Today = 2026-06-30, 30 days ago = 2026-05-31
    const now = new Date('2026-06-30T12:00:00Z')
    expect(brazilDaysAgo(30, now)).toBe('2026-05-31')
  })

  it('correctly crosses a month boundary', () => {
    // Today = 2026-06-15, 20 days ago = 2026-05-26
    const now = new Date('2026-06-15T12:00:00Z')
    expect(brazilDaysAgo(20, now)).toBe('2026-05-26')
  })

  it('correctly crosses a year boundary', () => {
    // Today = 2026-01-10, 15 days ago = 2025-12-26
    const now = new Date('2026-01-10T12:00:00Z')
    expect(brazilDaysAgo(15, now)).toBe('2025-12-26')
  })

  it('returns today when days is 0', () => {
    const now = new Date('2026-06-15T12:00:00Z')
    expect(brazilDaysAgo(0, now)).toBe('2026-06-15')
  })
})

describe('brazilAddMonths', () => {
  it('adds months to a date string', () => {
    expect(brazilAddMonths('2026-01-15', 6)).toBe('2026-07-15')
  })

  it('crosses year boundary', () => {
    expect(brazilAddMonths('2026-10-01', 3)).toBe('2027-01-01')
  })

  it('handles day overflow (month with fewer days)', () => {
    // Jan 31 + 1 month = Feb 31 = Mar 3 (JS normalisation)
    expect(brazilAddMonths('2026-01-31', 1)).toBe('2026-03-03')
  })

  it('handles 24-month offset for follow-up date', () => {
    expect(brazilAddMonths('2026-06-01', 24)).toBe('2028-06-01')
  })
})
