import { vi } from 'vitest'
import {
  brazilCurrentTimeHHmm,
  formatDateBR,
  formatDateInputValue,
  getBrazilWeekStart,
  isToday,
} from '@/lib/date-time-formatters'

// All fixtures use explicit UTC timestamps for timezone-independent tests.
// Brazil = UTC-3, so Brazil midnight = UTC 03:00.

// ── isToday ───────────────────────────────────────────────────────────────────
//
// isToday(date) now compares against brazilTodayIso(), not browser local time.
// `date` is a local-timezone Date object constructed from calendar components
// (as the calendar grid does), so getFullYear/getMonth/getDate read correctly.

describe('isToday — Brazil timezone', () => {
  afterEach(() => vi.useRealTimers())

  it('returns true for a date matching today in Brazil', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z')) // Brazil: 2026-06-15
    const date = new Date(2026, 5, 15) // local June 15
    expect(isToday(date)).toBe(true)
  })

  it('returns false for yesterday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    const date = new Date(2026, 5, 14) // June 14
    expect(isToday(date)).toBe(false)
  })

  it('returns false for tomorrow', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    const date = new Date(2026, 5, 16) // June 16
    expect(isToday(date)).toBe(false)
  })

  it('returns false for June 1 when UTC is June 1 but Brazil is still May 31', () => {
    vi.useFakeTimers()
    // 02:00 UTC June 1 = 23:00 Brazil May 31
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    const june1 = new Date(2026, 5, 1) // local June 1
    expect(isToday(june1)).toBe(false)
  })

  it('returns true for May 31 when UTC is June 1 02:00 but Brazil is still May 31', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    const may31 = new Date(2026, 4, 31) // local May 31
    expect(isToday(may31)).toBe(true)
  })

  it('returns true for June 1 once Brazil midnight arrives at UTC 03:00', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T03:00:00Z')) // Brazil: June 1 00:00
    const june1 = new Date(2026, 5, 1)
    expect(isToday(june1)).toBe(true)
  })
})

// ── brazilCurrentTimeHHmm ─────────────────────────────────────────────────────
//
// Returns current wall-clock time in America/Sao_Paulo as HH:mm.

describe('brazilCurrentTimeHHmm', () => {
  afterEach(() => vi.useRealTimers())

  it('returns Brazil wall-clock time, not UTC time', () => {
    vi.useFakeTimers()
    // 17:05 UTC = 14:05 Brazil
    vi.setSystemTime(new Date('2026-06-15T17:05:00Z'))
    expect(brazilCurrentTimeHHmm()).toBe('14:05')
  })

  it('zero-pads hours and minutes', () => {
    vi.useFakeTimers()
    // 07:03 UTC = 04:03 Brazil
    vi.setSystemTime(new Date('2026-06-15T07:03:00Z'))
    expect(brazilCurrentTimeHHmm()).toBe('04:03')
  })

  it('handles midnight in Brazil (03:00 UTC)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T03:00:00Z'))
    expect(brazilCurrentTimeHHmm()).toBe('00:00')
  })

  it('returns Brazil time, not local time, at 02:00 UTC (Brazilian midnight is at 03:00)', () => {
    vi.useFakeTimers()
    // 02:00 UTC = 23:00 Brazil (previous day)
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    expect(brazilCurrentTimeHHmm()).toBe('23:00')
  })
})

// ── formatDateInputValue — date-only strings never shift ──────────────────────
//
// Verifies that a full ISO datetime string or a date-only string always extracts
// the correct YYYY-MM-DD prefix without going through a timezone-unsafe Date object.

describe('formatDateInputValue — no UTC-day drift', () => {
  it('extracts YYYY-MM-DD from a date-only string without creating a Date object', () => {
    expect(formatDateInputValue('2026-06-01')).toBe('2026-06-01')
  })

  it('extracts YYYY-MM-DD from a UTC midnight ISO string (typical backend paymentDate)', () => {
    // paymentDate stored as UTC midnight: 2026-06-01T00:00:00.000Z
    expect(formatDateInputValue('2026-06-01T00:00:00.000Z')).toBe('2026-06-01')
  })

  it('does not shift 2026-06-01 to 2026-05-31 regardless of system timezone', () => {
    // The regex-based extraction in formatDateInputValue matches the prefix
    // and never interprets the string as UTC — no possible day shift.
    const result = formatDateInputValue('2026-06-01')
    expect(result).toBe('2026-06-01')
    expect(result).not.toBe('2026-05-31')
  })

  it('returns empty string for a null value', () => {
    expect(formatDateInputValue(null)).toBe('')
  })
})

// ── formatDateBR — stable Brazilian date display ──────────────────────────────
//
// Verifies that date-only strings produce the correct DD/MM/AAAA display without
// going through a Date object (no timezone shift risk).

describe('formatDateBR — stable Brazilian display format', () => {
  it('formats 2026-06-01 as 01/06/2026 (never 31/05/2026)', () => {
    expect(formatDateBR('2026-06-01')).toBe('01/06/2026')
  })

  it('formats 2026-05-31 as 31/05/2026', () => {
    expect(formatDateBR('2026-05-31')).toBe('31/05/2026')
  })

  it('chained with formatDateInputValue gives stable display from an ISO datetime', () => {
    // This is the pattern used in AppointmentPaymentSection for paymentDate display
    const iso = '2026-06-01T00:00:00.000Z'
    expect(formatDateBR(formatDateInputValue(iso))).toBe('01/06/2026')
  })
})

// ── getBrazilWeekStart — string-input week helper ─────────────────────────────
//
// June 2026 calendar reference:
//   Mon  1 | Tue  2 | Wed  3 | Thu  4 | Fri  5 | Sat  6 | Sun  7
//   Mon  8 | Tue  9 | Wed 10 | Thu 11 | Fri 12 | Sat 13 | Sun 14
//   ...
//   Mon 29 | Tue 30
//
// July 1, 2026 = Wednesday → week start is June 29 (crosses month boundary).
// May  31, 2026 = Sunday  → week start is May 25.
//
// All assertions use local .getFullYear()/.getMonth()/.getDate() because the
// function returns a LOCAL-midnight Date, not a UTC-midnight Date.

describe('getBrazilWeekStart', () => {
  it('returns the same Monday for a Monday input (2026-06-01)', () => {
    const result = getBrazilWeekStart('2026-06-01')
    expect(result.getDay()).toBe(1)        // Monday
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5)      // June (0-indexed)
    expect(result.getDate()).toBe(1)
  })

  it('returns the preceding Monday for a Wednesday (2026-06-03 → 2026-06-01)', () => {
    const result = getBrazilWeekStart('2026-06-03')
    expect(result.getDay()).toBe(1)
    expect(result.getMonth()).toBe(5)  // June
    expect(result.getDate()).toBe(1)
  })

  it('returns the preceding Monday for a Sunday (2026-06-07 → 2026-06-01)', () => {
    const result = getBrazilWeekStart('2026-06-07')
    expect(result.getDay()).toBe(1)
    expect(result.getMonth()).toBe(5)  // June
    expect(result.getDate()).toBe(1)
  })

  it('Sunday at month boundary: 2026-05-31 → Monday 2026-05-25', () => {
    const result = getBrazilWeekStart('2026-05-31')
    expect(result.getDay()).toBe(1)
    expect(result.getMonth()).toBe(4)   // May (0-indexed)
    expect(result.getDate()).toBe(25)
  })

  it('crosses month boundary: Wednesday 2026-07-01 → Monday 2026-06-29', () => {
    const result = getBrazilWeekStart('2026-07-01')
    expect(result.getDay()).toBe(1)
    expect(result.getMonth()).toBe(5)   // June (0-indexed)
    expect(result.getDate()).toBe(29)
  })

  it('does NOT shift 2026-06-01 to May 25 (the UTC-parsing-drift bug it prevents)', () => {
    // If the input string were parsed via new Date('2026-06-01') in a UTC-3
    // environment, the Date would land on May 31 at 21:00 local time.
    // getDay() would then return Sunday (0) and the week start would be
    // pushed back 6 days to May 25 — wrong for a Brazil user who meant June 1.
    // getBrazilWeekStart uses new Date(y, m-1, d) (local constructor) to prevent this.
    const result = getBrazilWeekStart('2026-06-01')
    expect(result.getMonth()).toBe(5)   // June, NOT May
    expect(result.getDate()).toBe(1)    // 1st, NOT 25th
  })

  it('throws for an invalid date string', () => {
    expect(() => getBrazilWeekStart('not-a-date')).toThrow()
    expect(() => getBrazilWeekStart('2026-6-1')).toThrow()   // wrong zero-padding
    expect(() => getBrazilWeekStart('')).toThrow()
  })
})
