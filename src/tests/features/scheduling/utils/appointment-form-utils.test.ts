import {
  centsToReais,
  getCurrentTimeInputValue,
  getInitials,
  hasAppointmentTimePassed,
  isDateAvailable,
  reaisToCents,
} from '@/features/scheduling/utils/appointment-form-utils'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import {
  makeAvailability,
  makeAvailabilityException,
} from '@/test-utils/factories/availability.factory'

// ── reaisToCents ──────────────────────────────────────────────────────────────

describe('reaisToCents', () => {
  it('parses a comma-decimal BRL string', () => expect(reaisToCents('12,50')).toBe(1250))
  it('parses a dot-decimal string', () => expect(reaisToCents('12.50')).toBe(1250))
  it('parses a whole-number string', () => expect(reaisToCents('100')).toBe(10000))
  it('parses zero', () => expect(reaisToCents('0')).toBe(0))
  it('parses the minimum non-zero value', () => expect(reaisToCents('0,01')).toBe(1))
  it('strips a currency prefix (e.g. "R$ ")', () => expect(reaisToCents('R$ 12,50')).toBe(1250))
  it('returns undefined for an empty string', () => expect(reaisToCents('')).toBeUndefined())
  it('returns undefined for a non-numeric string', () =>
    expect(reaisToCents('abc')).toBeUndefined())
})

// ── centsToReais ──────────────────────────────────────────────────────────────

describe('centsToReais', () => {
  it('converts 1250 to "12,50"', () => expect(centsToReais(1250)).toBe('12,50'))
  it('converts 100 to "1,00"', () => expect(centsToReais(100)).toBe('1,00'))
  it('converts 1 to "0,01"', () => expect(centsToReais(1)).toBe('0,01'))
  it('converts 0 to "0,00"', () => expect(centsToReais(0)).toBe('0,00'))
  it('returns empty string for null', () => expect(centsToReais(null)).toBe(''))
  it('returns empty string for undefined', () => expect(centsToReais(undefined)).toBe(''))
})

// ── isDateAvailable ───────────────────────────────────────────────────────────
//
// dateValue is a plain YYYY-MM-DD string.
// Day-of-week is derived via getUTCDay() on `${dateValue}T00:00:00Z`:
//   2026-05-25 → Monday (1)
//   2026-05-24 → Sunday (0)
//   2026-05-23 → Saturday (6)

describe('isDateAvailable', () => {
  it('returns true for an empty dateValue', () => {
    expect(isDateAvailable('', [], [])).toBe(true)
  })

  it('returns false when the date matches a day-off exception', () => {
    const ex = makeAvailabilityException({ exceptionDate: '2026-05-25', isDayOff: true })
    expect(isDateAvailable('2026-05-25', [], [ex])).toBe(false)
  })

  it('returns true when the date matches a non-day-off exception (special working day)', () => {
    const ex = makeAvailabilityException({ exceptionDate: '2026-05-25', isDayOff: false })
    expect(isDateAvailable('2026-05-25', [], [ex])).toBe(true)
  })

  it('returns true for a weekday (Monday) when availability is empty', () => {
    // 2026-05-25 is Monday (UTC day 1) — default Mon–Fri rule
    expect(isDateAvailable('2026-05-25', [], [])).toBe(true)
  })

  it('returns false for Sunday when availability is empty', () => {
    // 2026-05-24 is Sunday (UTC day 0)
    expect(isDateAvailable('2026-05-24', [], [])).toBe(false)
  })

  it('returns false for Saturday when availability is empty', () => {
    // 2026-05-23 is Saturday (UTC day 6)
    expect(isDateAvailable('2026-05-23', [], [])).toBe(false)
  })

  it('returns true when availability covers the day of week', () => {
    // 2026-05-25 is Monday (1)
    const av = makeAvailability({ dayOfWeek: 1, isActive: true })
    expect(isDateAvailable('2026-05-25', [av], [])).toBe(true)
  })

  it('returns false when availability exists but not for this day of week', () => {
    // 2026-05-25 is Monday (1), availability is for Wednesday (3)
    const av = makeAvailability({ dayOfWeek: 3, isActive: true })
    expect(isDateAvailable('2026-05-25', [av], [])).toBe(false)
  })

  it('returns false when the matching availability slot is inactive', () => {
    const av = makeAvailability({ dayOfWeek: 1, isActive: false })
    expect(isDateAvailable('2026-05-25', [av], [])).toBe(false)
  })

  it('exception takes priority over availability', () => {
    // Day-off exception beats an active availability slot for the same day
    const av = makeAvailability({ dayOfWeek: 1, isActive: true })
    const ex = makeAvailabilityException({ exceptionDate: '2026-05-25', isDayOff: true })
    expect(isDateAvailable('2026-05-25', [av], [ex])).toBe(false)
  })
})

// ── getCurrentTimeInputValue ──────────────────────────────────────────────────
//
// Now uses Intl.DateTimeFormat with America/Sao_Paulo, so fixtures must use
// explicit UTC timestamps. Brazil = UTC-3, so Brazil HH:mm = UTC (HH+3):mm.

describe('getCurrentTimeInputValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the Brazil wall-clock time as HH:mm', () => {
    // 17:05 UTC = 14:05 Brazil
    vi.setSystemTime(new Date('2026-06-15T17:05:00Z'))
    expect(getCurrentTimeInputValue()).toBe('14:05')
  })

  it('zero-pads single-digit hours and minutes', () => {
    // 07:03 UTC = 04:03 Brazil
    vi.setSystemTime(new Date('2026-06-15T07:03:00Z'))
    expect(getCurrentTimeInputValue()).toBe('04:03')
  })

  it('handles midnight Brazil (03:00 UTC)', () => {
    vi.setSystemTime(new Date('2026-06-15T03:00:00Z'))
    expect(getCurrentTimeInputValue()).toBe('00:00')
  })
})

// ── hasAppointmentTimePassed ──────────────────────────────────────────────────
//
// makeAppointment() defaults: appointmentDate '2026-05-26', startTime '1970-01-01T10:00:00.000Z'
// formatTimeInputValue uses getUTCHours → startTime always resolves to '10:00' (Brazil wall-clock)
// hasAppointmentTimePassed now uses brazilTodayIso() and brazilCurrentTimeHHmm()
// All system-time fixtures use explicit UTC timestamps for timezone stability.

describe('hasAppointmentTimePassed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when the appointment date is before today', () => {
    // 12:00 UTC = 09:00 Brazil May 27 — appointment was on May 26
    vi.setSystemTime(new Date('2026-05-27T12:00:00Z'))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(true)
  })

  it('returns false when the appointment date is after today', () => {
    // 12:00 UTC = 09:00 Brazil May 25 — appointment is on May 26
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(false)
  })

  it('returns true when the appointment is today and the Brazil time is after the start time', () => {
    // 14:00 UTC = 11:00 Brazil May 26 — appointment start is at wall-clock 10:00
    vi.setSystemTime(new Date('2026-05-26T14:00:00Z'))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(true)
  })

  it('returns false when the appointment is today and the Brazil time is before the start time', () => {
    // 12:00 UTC = 09:00 Brazil May 26 — appointment start is at wall-clock 10:00
    vi.setSystemTime(new Date('2026-05-26T12:00:00Z'))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(false)
  })

  it('does not shift date at 02:00 UTC (Brazil is still previous day)', () => {
    // 02:00 UTC June 1 = 23:00 Brazil May 31 — appointment is May 26 (past)
    vi.setSystemTime(new Date('2026-06-01T02:00:00Z'))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(true)
  })
})

// ── getInitials ───────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns initials from two-word name', () => expect(getInitials('Ana Lima')).toBe('AL'))
  it('returns single initial for one-word name', () => expect(getInitials('João')).toBe('J'))
  it('returns empty string for blank input', () => expect(getInitials('  ')).toBe(''))
  it('uses only the first two words of a longer name', () =>
    expect(getInitials('Pedro Henrique Silva')).toBe('PH'))
  it('uppercases lowercase input', () => expect(getInitials('ana lima')).toBe('AL'))
})
