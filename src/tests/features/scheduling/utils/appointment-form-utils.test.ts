import {
  centsToReais,
  getCurrentTimeInputValue,
  getInitials,
  hasAppointmentTimePassed,
  isDateAvailable,
  reaisToCents,
} from '@/features/scheduling/utils/appointment-form-utils'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeAvailability, makeAvailabilityException } from '@/test-utils/factories/availability.factory'

// ── reaisToCents ──────────────────────────────────────────────────────────────

describe('reaisToCents', () => {
  it('parses a comma-decimal BRL string', () => expect(reaisToCents('12,50')).toBe(1250))
  it('parses a dot-decimal string', () => expect(reaisToCents('12.50')).toBe(1250))
  it('parses a whole-number string', () => expect(reaisToCents('100')).toBe(10000))
  it('parses zero', () => expect(reaisToCents('0')).toBe(0))
  it('parses the minimum non-zero value', () => expect(reaisToCents('0,01')).toBe(1))
  it('strips a currency prefix (e.g. "R$ ")', () => expect(reaisToCents('R$ 12,50')).toBe(1250))
  it('returns undefined for an empty string', () => expect(reaisToCents('')).toBeUndefined())
  it('returns undefined for a non-numeric string', () => expect(reaisToCents('abc')).toBeUndefined())
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

describe('getCurrentTimeInputValue', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns the current time as an HH:mm string', () => {
    // Local constructor: June 15, 2026 at 14:05
    vi.setSystemTime(new Date(2026, 5, 15, 14, 5, 0))
    expect(getCurrentTimeInputValue()).toBe('14:05')
  })

  it('zero-pads single-digit hours and minutes', () => {
    // Local constructor: June 15, 2026 at 04:03
    vi.setSystemTime(new Date(2026, 5, 15, 4, 3, 0))
    expect(getCurrentTimeInputValue()).toBe('04:03')
  })
})

// ── hasAppointmentTimePassed ──────────────────────────────────────────────────
//
// makeAppointment() defaults: appointmentDate '2026-05-26', startTime '1970-01-01T10:00:00.000Z'
// formatTimeInputValue uses getUTCHours → startTime always resolves to '10:00'
// formatDateInputValue(new Date()) uses local getDate/getMonth/getFullYear

describe('hasAppointmentTimePassed', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns true when the appointment date is before today', () => {
    // Today is May 27 (local) — after the appointment on May 26
    vi.setSystemTime(new Date(2026, 4, 27, 12, 0, 0))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(true)
  })

  it('returns false when the appointment date is after today', () => {
    // Today is May 25 (local) — before the appointment on May 26
    vi.setSystemTime(new Date(2026, 4, 25, 12, 0, 0))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(false)
  })

  it('returns true when the appointment is today and the start time has already passed', () => {
    // Today is May 26 at 11:00 (local) — after the 10:00 UTC start time
    vi.setSystemTime(new Date(2026, 4, 26, 11, 0, 0))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(true)
  })

  it('returns false when the appointment is today and the start time has not yet passed', () => {
    // Today is May 26 at 09:00 (local) — before the 10:00 UTC start time
    vi.setSystemTime(new Date(2026, 4, 26, 9, 0, 0))
    expect(hasAppointmentTimePassed(makeAppointment())).toBe(false)
  })
})

// ── getInitials ───────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns initials from two-word name', () => expect(getInitials('Ana Lima')).toBe('AL'))
  it('returns single initial for one-word name', () => expect(getInitials('João')).toBe('J'))
  it('returns empty string for blank input', () => expect(getInitials('  ')).toBe(''))
  it('uses only the first two words of a longer name', () => expect(getInitials('Pedro Henrique Silva')).toBe('PH'))
  it('uppercases lowercase input', () => expect(getInitials('ana lima')).toBe('AL'))
})
