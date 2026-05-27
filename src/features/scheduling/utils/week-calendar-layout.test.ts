import type { Appointment, Availability, AvailabilityException } from '../types/scheduling.types'
import {
  DEFAULT_END_MINUTES,
  DEFAULT_START_MINUTES,
  SLOT_MINUTES,
  buildTimeSlots,
  computeDayLayout,
  getDayStatus,
  getDayWorkingRanges,
  isSlotInsideWorkingRanges,
  minutesToTime,
} from './week-calendar-layout'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeAppt(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    clinicId: 'c1',
    profileId: 'p1',
    patientUserId: null,
    leadId: null,
    serviceId: null,
    patientName: 'Test',
    patientEmail: null,
    patientPhone: null,
    appointmentDate: '2026-05-27',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    status: 'PENDING',
    notes: null,
    patientNotes: null,
    canceledBy: null,
    canceledAt: null,
    cancellationReason: null,
    confirmedAt: null,
    completedAt: null,
    estimatedAmountCents: null,
    paidAmountCents: null,
    paymentStatus: 'PAYMENT_PENDING',
    paymentMethod: null,
    paymentDate: null,
    paymentNotes: null,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
    profile: null,
    service: null,
    patient: null,
    ...overrides,
  }
}

function makeAvailability(overrides: Partial<Availability> = {}): Availability {
  return {
    id: 'av1',
    profileId: 'p1',
    clinicId: 'c1',
    dayOfWeek: 3, // Wednesday
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeException(overrides: Partial<AvailabilityException> = {}): AvailabilityException {
  return {
    id: 'ex1',
    profileId: 'p1',
    clinicId: 'c1',
    exceptionDate: '2026-05-27',
    isDayOff: true,
    startTime: null,
    endTime: null,
    reason: null,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

// Wednesday 2026-05-27 (local) → toDateInputValue → '2026-05-27'
const WED = new Date(2026, 4, 27)

// ── minutesToTime ─────────────────────────────────────────────────────────────

describe('minutesToTime', () => {
  it('converts 0 to 00:00', () => expect(minutesToTime(0)).toBe('00:00'))
  it('converts 480 to 08:00', () => expect(minutesToTime(480)).toBe('08:00'))
  it('converts 570 to 09:30', () => expect(minutesToTime(570)).toBe('09:30'))
  it('converts 1080 to 18:00', () => expect(minutesToTime(1080)).toBe('18:00'))
  it('converts 1439 to 23:59', () => expect(minutesToTime(1439)).toBe('23:59'))
})

// ── isSlotInsideWorkingRanges ─────────────────────────────────────────────────

describe('isSlotInsideWorkingRanges', () => {
  const ranges = [{ start: 480, end: 1020 }]

  it('returns true for a slot at range start', () => expect(isSlotInsideWorkingRanges(480, ranges)).toBe(true))
  it('returns true for a slot at range end', () => expect(isSlotInsideWorkingRanges(1020, ranges)).toBe(true))
  it('returns true for a slot inside the range', () => expect(isSlotInsideWorkingRanges(720, ranges)).toBe(true))
  it('returns false for a slot before the range', () => expect(isSlotInsideWorkingRanges(450, ranges)).toBe(false))
  it('returns false for a slot after the range', () => expect(isSlotInsideWorkingRanges(1050, ranges)).toBe(false))
  it('returns false when ranges is empty', () => expect(isSlotInsideWorkingRanges(720, [])).toBe(false))
})

// ── computeDayLayout ──────────────────────────────────────────────────────────

describe('computeDayLayout', () => {
  it('returns empty array for no appointments', () => {
    expect(computeDayLayout([])).toEqual([])
  })

  it('single appointment gets colIndex 0 and colCount 1', () => {
    const [result] = computeDayLayout([makeAppt()])
    expect(result.colIndex).toBe(0)
    expect(result.colCount).toBe(1)
  })

  it('two non-overlapping appointments each get colCount 1', () => {
    const a = makeAppt({ id: 'a', startTime: '09:00', endTime: '10:00' })
    const b = makeAppt({ id: 'b', startTime: '10:00', endTime: '11:00' })
    const [ra, rb] = computeDayLayout([a, b])
    expect(ra.colCount).toBe(1)
    expect(rb.colCount).toBe(1)
  })

  it('two overlapping appointments both get colCount 2 with distinct colIndex', () => {
    const a = makeAppt({ id: 'a', startTime: '09:00', endTime: '10:00' })
    const b = makeAppt({ id: 'b', startTime: '09:30', endTime: '10:30' })
    const [ra, rb] = computeDayLayout([a, b])
    expect(ra.colCount).toBe(2)
    expect(rb.colCount).toBe(2)
    expect(ra.colIndex).not.toBe(rb.colIndex)
  })

  it('three fully overlapping appointments each get colCount 3', () => {
    const a = makeAppt({ id: 'a', startTime: '09:00', endTime: '11:00' })
    const b = makeAppt({ id: 'b', startTime: '09:30', endTime: '10:30' })
    const c = makeAppt({ id: 'c', startTime: '10:00', endTime: '11:30' })
    const result = computeDayLayout([a, b, c])
    expect(result.every((r) => r.colCount === 3)).toBe(true)
    const indices = result.map((r) => r.colIndex)
    expect(new Set(indices).size).toBe(3)
  })

  it('preserves all original appointment fields', () => {
    const appt = makeAppt({ id: 'orig', patientName: 'Ana' })
    const [result] = computeDayLayout([appt])
    expect(result.id).toBe('orig')
    expect(result.patientName).toBe('Ana')
  })
})

// ── getDayWorkingRanges ───────────────────────────────────────────────────────

describe('getDayWorkingRanges', () => {
  it('returns [] for a day-off exception', () => {
    const ex = makeException({ exceptionDate: '2026-05-27', isDayOff: true })
    expect(getDayWorkingRanges(WED, undefined, [ex])).toEqual([])
  })

  it('returns special-hour range from a non-day-off exception', () => {
    const ex = makeException({ exceptionDate: '2026-05-27', isDayOff: false, startTime: '10:00', endTime: '14:00' })
    // 10:00 = 600 min, 14:00 = 840 min
    expect(getDayWorkingRanges(WED, undefined, [ex])).toEqual([{ start: 600, end: 840 }])
  })

  it('returns range from per-day availability when no exception', () => {
    const av = makeAvailability({ dayOfWeek: WED.getDay(), startTime: '08:00', endTime: '17:00' })
    // 08:00 = 480, 17:00 = 1020
    expect(getDayWorkingRanges(WED, [av])).toEqual([{ start: 480, end: 1020 }])
  })

  it('returns [] when availability exists but not for this day of week', () => {
    const av = makeAvailability({ dayOfWeek: 1 }) // Monday, not Wednesday
    expect(getDayWorkingRanges(WED, [av])).toEqual([])
  })

  it('returns default business hours when no availability is provided', () => {
    expect(getDayWorkingRanges(WED)).toEqual([
      { start: DEFAULT_START_MINUTES, end: DEFAULT_END_MINUTES },
    ])
  })
})

// ── getDayStatus ──────────────────────────────────────────────────────────────

describe('getDayStatus', () => {
  it('marks day as dayOff when exception isDayOff', () => {
    const ex = makeException({ exceptionDate: '2026-05-27', isDayOff: true, reason: 'Feriado' })
    const result = getDayStatus(WED, undefined, [ex])
    expect(result.isWorking).toBe(false)
    expect(result.kind).toBe('dayOff')
    expect(result.reason).toBe('Feriado')
  })

  it('marks day as special when exception has custom hours', () => {
    const ex = makeException({ exceptionDate: '2026-05-27', isDayOff: false, startTime: '10:00', endTime: '14:00' })
    const result = getDayStatus(WED, undefined, [ex])
    expect(result.isWorking).toBe(true)
    expect(result.kind).toBe('special')
    expect(result.timeRange).toMatch(/10:00/)
  })

  it('defaults to working when no availability is configured', () => {
    const result = getDayStatus(WED, [])
    expect(result.isWorking).toBe(true)
    expect(result.kind).toBe('working')
  })

  it('marks non-scheduled day as dayOff', () => {
    const av = makeAvailability({ dayOfWeek: 1 }) // Monday only
    const result = getDayStatus(WED, [av])
    expect(result.isWorking).toBe(false)
    expect(result.kind).toBe('dayOff')
  })
})

// ── buildTimeSlots ────────────────────────────────────────────────────────────

describe('buildTimeSlots', () => {
  it('falls back to default business hours with no availability or appointments', () => {
    const slots = buildTimeSlots([], [], undefined, undefined)
    expect(slots[0]).toBe(DEFAULT_START_MINUTES)
    expect(slots[slots.length - 1]).toBe(DEFAULT_END_MINUTES)
    // (1080 - 480) / 30 + 1 = 21 slots
    expect(slots).toHaveLength((DEFAULT_END_MINUTES - DEFAULT_START_MINUTES) / SLOT_MINUTES + 1)
  })

  it('uses availability to set the time window', () => {
    const av = makeAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true })
    const slots = buildTimeSlots([], [], [av])
    // 09:00 = 540, 17:00 = 1020
    expect(slots[0]).toBe(540)
    expect(slots[slots.length - 1]).toBe(1020)
  })

  it('expands start when an appointment begins before the availability window', () => {
    const av = makeAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true })
    // Appointment at 07:30 = 450 min → snapped to floor(450/30)*30 = 450
    const appt = makeAppt({ startTime: '07:30', endTime: '08:30' })
    const slots = buildTimeSlots([appt], [], [av])
    expect(slots[0]).toBeLessThan(540)
    expect(slots[0]).toBe(450)
  })

  it('expands end when an appointment finishes after the availability window', () => {
    const av = makeAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true })
    // Appointment ending at 19:00 = 1140 → snapped to ceil(1140/30)*30 = 1140
    const appt = makeAppt({ startTime: '18:00', endTime: '19:00' })
    const slots = buildTimeSlots([appt], [], [av])
    expect(slots[slots.length - 1]).toBeGreaterThan(1020)
    expect(slots[slots.length - 1]).toBe(1140)
  })

  it('produces slots that are multiples of SLOT_MINUTES', () => {
    const slots = buildTimeSlots([], [])
    expect(slots.every((s) => s % SLOT_MINUTES === 0)).toBe(true)
  })

  it('returns at least one slot when given empty inputs', () => {
    expect(buildTimeSlots([], [])).not.toHaveLength(0)
  })
})
