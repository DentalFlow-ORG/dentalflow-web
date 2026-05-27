import type { Appointment, AppointmentStatus } from '@/features/scheduling/types/scheduling.types'

import {
  APPOINTMENT_TRANSITIONS,
  canTransitionTo,
  getAvailableTransitions,
  isTerminalStatus,
} from '@/features/scheduling/utils/appointment-state-machine'

// ── Fixture ───────────────────────────────────────────────────────────────────
// appointmentDate: plain YYYY-MM-DD → isoDateToString returns '2026-05-26'
// startTime: UTC wall-clock stamp → formatWallTime extracts '10:00'
// buildAppointmentDateTime result: new Date('2026-05-26T10:00:00') (local)

const APPT_DATE = '2026-05-26'
const APPT_START = '1970-01-01T10:00:00.000Z'

const BEFORE_SLOT = new Date('2026-05-26T09:00:00') // 09:00 local — slot hasn't started
const AFTER_SLOT  = new Date('2026-05-26T11:00:00') // 11:00 local — slot has started

function makeAppointment(
  status: AppointmentStatus,
  appointmentDate = APPT_DATE,
  startTime = APPT_START,
): Appointment {
  return {
    id: 'appt-1',
    clinicId: 'clinic-1',
    profileId: 'prof-1',
    patientUserId: null,
    leadId: null,
    serviceId: null,
    patientName: 'Test Patient',
    patientEmail: null,
    patientPhone: null,
    appointmentDate,
    startTime,
    endTime: null,
    durationMinutes: null,
    status,
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
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z',
    profile: null,
    service: null,
    patient: null,
  }
}

// ── APPOINTMENT_TRANSITIONS ───────────────────────────────────────────────────

describe('APPOINTMENT_TRANSITIONS', () => {
  it('terminal statuses have no outgoing transitions', () => {
    expect(APPOINTMENT_TRANSITIONS.COMPLETED).toEqual([])
    expect(APPOINTMENT_TRANSITIONS.NO_SHOW).toEqual([])
    expect(APPOINTMENT_TRANSITIONS.CANCELED).toEqual([])
  })

  it('PENDING can transition to CONFIRMED and CANCELED', () => {
    expect(APPOINTMENT_TRANSITIONS.PENDING).toEqual(
      expect.arrayContaining(['CONFIRMED', 'CANCELED']),
    )
    expect(APPOINTMENT_TRANSITIONS.PENDING).toHaveLength(2)
  })

  it('CONFIRMED can transition to COMPLETED, NO_SHOW, and CANCELED', () => {
    expect(APPOINTMENT_TRANSITIONS.CONFIRMED).toEqual(
      expect.arrayContaining(['COMPLETED', 'NO_SHOW', 'CANCELED']),
    )
    expect(APPOINTMENT_TRANSITIONS.CONFIRMED).toHaveLength(3)
  })
})

// ── isTerminalStatus ──────────────────────────────────────────────────────────

describe('isTerminalStatus', () => {
  it.each<AppointmentStatus>(['COMPLETED', 'NO_SHOW', 'CANCELED'])(
    '%s is terminal',
    (status) => {
      expect(isTerminalStatus(status)).toBe(true)
    },
  )

  it.each<AppointmentStatus>(['PENDING', 'CONFIRMED'])(
    '%s is not terminal',
    (status) => {
      expect(isTerminalStatus(status)).toBe(false)
    },
  )
})

// ── canTransitionTo — state machine guard ─────────────────────────────────────

describe('canTransitionTo — state machine guard', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(canTransitionTo(makeAppointment('PENDING'), 'CONFIRMED')).toBe(true)
  })

  it('allows PENDING → CANCELED', () => {
    expect(canTransitionTo(makeAppointment('PENDING'), 'CANCELED')).toBe(true)
  })

  it('rejects PENDING → COMPLETED (not in transition map)', () => {
    expect(canTransitionTo(makeAppointment('PENDING'), 'COMPLETED')).toBe(false)
  })

  it('rejects PENDING → NO_SHOW (not in transition map)', () => {
    expect(canTransitionTo(makeAppointment('PENDING'), 'NO_SHOW')).toBe(false)
  })

  it('rejects any transition from a terminal status', () => {
    const statuses: AppointmentStatus[] = ['COMPLETED', 'NO_SHOW', 'CANCELED']
    const targets: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'NO_SHOW']
    for (const status of statuses) {
      for (const target of targets) {
        expect(canTransitionTo(makeAppointment(status), target)).toBe(false)
      }
    }
  })

  it('allows CONFIRMED → CANCELED regardless of appointment time', () => {
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'CANCELED', BEFORE_SLOT)).toBe(true)
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'CANCELED', AFTER_SLOT)).toBe(true)
  })
})

// ── canTransitionTo — time guard ──────────────────────────────────────────────

describe('canTransitionTo — time guard for COMPLETED and NO_SHOW', () => {
  it('allows CONFIRMED → COMPLETED when the appointment slot has started', () => {
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'COMPLETED', AFTER_SLOT)).toBe(true)
  })

  it('rejects CONFIRMED → COMPLETED when the appointment slot is in the future', () => {
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'COMPLETED', BEFORE_SLOT)).toBe(false)
  })

  it('allows CONFIRMED → NO_SHOW when the appointment slot has started', () => {
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'NO_SHOW', AFTER_SLOT)).toBe(true)
  })

  it('rejects CONFIRMED → NO_SHOW when the appointment slot is in the future', () => {
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'NO_SHOW', BEFORE_SLOT)).toBe(false)
  })

  it('allows transition exactly at the slot start time', () => {
    const atSlot = new Date('2026-05-26T10:00:00')
    expect(canTransitionTo(makeAppointment('CONFIRMED'), 'COMPLETED', atSlot)).toBe(true)
  })
})

// ── getAvailableTransitions ───────────────────────────────────────────────────

describe('getAvailableTransitions', () => {
  it('returns CONFIRMED and CANCELED for a PENDING appointment', () => {
    const result = getAvailableTransitions(makeAppointment('PENDING'), { now: AFTER_SLOT })
    expect(result).toEqual(expect.arrayContaining(['CONFIRMED', 'CANCELED']))
    expect(result).toHaveLength(2)
  })

  it('returns COMPLETED, NO_SHOW, and CANCELED for a CONFIRMED past appointment', () => {
    const result = getAvailableTransitions(makeAppointment('CONFIRMED'), { now: AFTER_SLOT })
    expect(result).toEqual(expect.arrayContaining(['COMPLETED', 'NO_SHOW', 'CANCELED']))
    expect(result).toHaveLength(3)
  })

  it('returns only CANCELED for a CONFIRMED future appointment', () => {
    const result = getAvailableTransitions(makeAppointment('CONFIRMED'), { now: BEFORE_SLOT })
    expect(result).toEqual(['CANCELED'])
  })

  it('returns an empty array for any terminal status', () => {
    expect(getAvailableTransitions(makeAppointment('COMPLETED'), { now: AFTER_SLOT })).toEqual([])
    expect(getAvailableTransitions(makeAppointment('NO_SHOW'),   { now: AFTER_SLOT })).toEqual([])
    expect(getAvailableTransitions(makeAppointment('CANCELED'),  { now: AFTER_SLOT })).toEqual([])
  })

  it('filters results by roleAllowedTargets', () => {
    const result = getAvailableTransitions(makeAppointment('PENDING'), {
      now: AFTER_SLOT,
      roleAllowedTargets: ['CONFIRMED'],
    })
    expect(result).toEqual(['CONFIRMED'])
  })

  it('returns empty when roleAllowedTargets excludes all valid transitions', () => {
    const result = getAvailableTransitions(makeAppointment('PENDING'), {
      now: AFTER_SLOT,
      roleAllowedTargets: ['COMPLETED'],
    })
    expect(result).toEqual([])
  })
})
