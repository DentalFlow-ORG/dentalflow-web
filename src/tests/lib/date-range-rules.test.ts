import {
  defaultLast30DaysRange,
  isEndBeforeStart,
  isFutureDate,
  maxFollowUpIso,
  rangeExceedsMonths,
  todayIso,
  validateFollowUpDate,
  validateReportDateRange,
} from '@/lib/date-range-rules'
import { afterEach, beforeEach, vi } from 'vitest'

// ── todayIso ──────────────────────────────────────────────────────────────────

describe('todayIso', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the Brazil calendar date, not UTC, when they differ', () => {
    // 2026-06-01 02:00 UTC = 2026-05-31 23:00 Brazil — still yesterday in Brazil
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    expect(todayIso()).toBe('2026-05-31')
    vi.useRealTimers()
  })

  it('advances to the new Brazil day at 03:00 UTC (Brazil midnight)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T03:00:00Z'))
    expect(todayIso()).toBe('2026-06-01')
    vi.useRealTimers()
  })
})

// ── isFutureDate ──────────────────────────────────────────────────────────────

describe('isFutureDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z')) // Brazil: 2026-06-15
  })
  afterEach(() => vi.useRealTimers())

  it('returns false for today', () => {
    expect(isFutureDate('2026-06-15')).toBe(false)
  })

  it('returns true for a future date', () => {
    expect(isFutureDate('2026-06-16')).toBe(true)
  })

  it('returns false for a past date', () => {
    expect(isFutureDate('2026-06-14')).toBe(false)
  })
})

// ── isEndBeforeStart ──────────────────────────────────────────────────────────

describe('isEndBeforeStart', () => {
  it('returns true when end is before start', () => {
    expect(isEndBeforeStart('2026-06-15', '2026-06-14')).toBe(true)
  })

  it('returns false when end equals start', () => {
    expect(isEndBeforeStart('2026-06-15', '2026-06-15')).toBe(false)
  })

  it('returns false when end is after start', () => {
    expect(isEndBeforeStart('2026-06-01', '2026-06-30')).toBe(false)
  })

  it('returns false when either is empty', () => {
    expect(isEndBeforeStart('', '2026-06-30')).toBe(false)
    expect(isEndBeforeStart('2026-06-01', '')).toBe(false)
  })
})

// ── rangeExceedsMonths ────────────────────────────────────────────────────────

describe('rangeExceedsMonths', () => {
  it('returns false when range is within limit', () => {
    expect(rangeExceedsMonths('2026-01-01', '2026-06-30', 12)).toBe(false)
  })

  it('returns true when range exceeds limit', () => {
    expect(rangeExceedsMonths('2026-01-01', '2027-01-02', 12)).toBe(true)
  })

  it('returns false for empty inputs', () => {
    expect(rangeExceedsMonths('', '2026-06-30', 12)).toBe(false)
    expect(rangeExceedsMonths('2026-01-01', '', 12)).toBe(false)
  })
})

// ── defaultLast30DaysRange ────────────────────────────────────────────────────

describe('defaultLast30DaysRange', () => {
  afterEach(() => vi.useRealTimers())

  it('endDate equals today in Brazil timezone', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z')) // Brazil: 2026-06-15
    const { endDate } = defaultLast30DaysRange()
    expect(endDate).toBe('2026-06-15')
  })

  it('startDate is 30 days before today in Brazil timezone', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z')) // Brazil: 2026-06-30
    const { startDate } = defaultLast30DaysRange()
    expect(startDate).toBe('2026-05-31')
  })

  it('does not shift day when Brazil is behind UTC', () => {
    // 2026-06-01 02:00 UTC = 2026-05-31 23:00 Brazil
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    const { endDate } = defaultLast30DaysRange()
    expect(endDate).toBe('2026-05-31') // Brazil today, not UTC today
  })

  it('startDate format is YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    const { startDate } = defaultLast30DaysRange()
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ── maxFollowUpIso ────────────────────────────────────────────────────────────

describe('maxFollowUpIso', () => {
  afterEach(() => vi.useRealTimers())

  it('is 24 months from today in Brazil', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))
    expect(maxFollowUpIso()).toBe('2028-06-01')
  })

  it('returns YYYY-MM-DD format', () => {
    expect(maxFollowUpIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ── validateReportDateRange ───────────────────────────────────────────────────

describe('validateReportDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns null for a valid range', () => {
    expect(validateReportDateRange('2026-01-01', '2026-06-15')).toBeNull()
  })

  it('returns an error when end date is in the future and allowFuture is false', () => {
    expect(validateReportDateRange('2026-01-01', '2026-12-31')).not.toBeNull()
  })

  it('allows future end date when allowFuture is true', () => {
    expect(validateReportDateRange('2026-01-01', '2026-12-31', { allowFuture: true })).toBeNull()
  })

  it('returns an error when end is before start', () => {
    expect(validateReportDateRange('2026-06-10', '2026-06-01')).not.toBeNull()
  })

  it('returns null when start or end is missing', () => {
    expect(validateReportDateRange(undefined, '2026-06-15')).toBeNull()
    expect(validateReportDateRange('2026-01-01', undefined)).toBeNull()
  })
})

// ── validateFollowUpDate ──────────────────────────────────────────────────────

describe('validateFollowUpDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns null for a valid future date on create', () => {
    expect(validateFollowUpDate('2026-08-01', true)).toBeNull()
  })

  it('returns an error for a past date on create', () => {
    expect(validateFollowUpDate('2026-06-01', true)).not.toBeNull()
  })

  it('returns null for past date when isCreate is false (edit)', () => {
    expect(validateFollowUpDate('2026-06-01', false)).toBeNull()
  })

  it('returns an error when date exceeds 24 months', () => {
    expect(validateFollowUpDate('2030-01-01', false)).not.toBeNull()
  })

  it('returns null when date is undefined', () => {
    expect(validateFollowUpDate(undefined, true)).toBeNull()
  })
})
