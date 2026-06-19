import type { AppointmentStatus } from '@/features/scheduling/types/scheduling.types'

import {
  APPOINTMENT_TRANSITIONS,
  canTransitionTo,
  getAvailableTransitions,
  isTerminalStatus,
} from '@/features/scheduling/utils/appointment-state-machine'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

// ── Fixture ───────────────────────────────────────────────────────────────────
// Factory defaults: appointmentDate '2026-05-26' + startTime '1970-01-01T10:00:00.000Z'
// → buildAppointmentDateTime produces new Date('2026-05-26T10:00:00-03:00') = 13:00 UTC
//
// BEFORE/AFTER use explicit UTC timestamps so tests are timezone-independent.

const BEFORE_SLOT = new Date('2026-05-26T12:00:00Z') // 09:00 Brazil — slot hasn't started
const AFTER_SLOT = new Date('2026-05-26T14:00:00Z') // 11:00 Brazil — slot has started

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
  it.each<AppointmentStatus>(['COMPLETED', 'NO_SHOW', 'CANCELED'])('%s is terminal', (status) => {
    expect(isTerminalStatus(status)).toBe(true)
  })

  it.each<AppointmentStatus>(['PENDING', 'CONFIRMED'])('%s is not terminal', (status) => {
    expect(isTerminalStatus(status)).toBe(false)
  })
})

// ── canTransitionTo — state machine guard ─────────────────────────────────────

describe('canTransitionTo — state machine guard', () => {
  it('allows PENDING → CONFIRMED', () => {
    expect(canTransitionTo(makeAppointment({ status: 'PENDING' }), 'CONFIRMED')).toBe(true)
  })

  it('allows PENDING → CANCELED', () => {
    expect(canTransitionTo(makeAppointment({ status: 'PENDING' }), 'CANCELED')).toBe(true)
  })

  it('rejects PENDING → COMPLETED (not in transition map)', () => {
    expect(canTransitionTo(makeAppointment({ status: 'PENDING' }), 'COMPLETED')).toBe(false)
  })

  it('rejects PENDING → NO_SHOW (not in transition map)', () => {
    expect(canTransitionTo(makeAppointment({ status: 'PENDING' }), 'NO_SHOW')).toBe(false)
  })

  it('rejects any transition from a terminal status', () => {
    const statuses: AppointmentStatus[] = ['COMPLETED', 'NO_SHOW', 'CANCELED']
    const targets: AppointmentStatus[] = [
      'PENDING',
      'CONFIRMED',
      'CANCELED',
      'COMPLETED',
      'NO_SHOW',
    ]
    for (const status of statuses) {
      for (const target of targets) {
        expect(canTransitionTo(makeAppointment({ status }), target)).toBe(false)
      }
    }
  })

  it('allows CONFIRMED → CANCELED regardless of appointment time', () => {
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'CANCELED', BEFORE_SLOT)).toBe(
      true,
    )
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'CANCELED', AFTER_SLOT)).toBe(
      true,
    )
  })
})

// ── canTransitionTo — time guard ──────────────────────────────────────────────

describe('canTransitionTo — time guard for COMPLETED and NO_SHOW', () => {
  it('allows CONFIRMED → COMPLETED when the appointment slot has started', () => {
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'COMPLETED', AFTER_SLOT)).toBe(
      true,
    )
  })

  it('rejects CONFIRMED → COMPLETED when the appointment slot is in the future', () => {
    expect(
      canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'COMPLETED', BEFORE_SLOT),
    ).toBe(false)
  })

  it('allows CONFIRMED → NO_SHOW when the appointment slot has started', () => {
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'NO_SHOW', AFTER_SLOT)).toBe(
      true,
    )
  })

  it('rejects CONFIRMED → NO_SHOW when the appointment slot is in the future', () => {
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'NO_SHOW', BEFORE_SLOT)).toBe(
      false,
    )
  })

  it('allows transition exactly at the slot start time', () => {
    const atSlot = new Date('2026-05-26T13:00:00Z') // 10:00 Brazil = 13:00 UTC
    expect(canTransitionTo(makeAppointment({ status: 'CONFIRMED' }), 'COMPLETED', atSlot)).toBe(
      true,
    )
  })
})

// ── getAvailableTransitions ───────────────────────────────────────────────────

describe('getAvailableTransitions', () => {
  it('returns CONFIRMED and CANCELED for a PENDING appointment', () => {
    const result = getAvailableTransitions(makeAppointment({ status: 'PENDING' }), {
      now: AFTER_SLOT,
    })
    expect(result).toEqual(expect.arrayContaining(['CONFIRMED', 'CANCELED']))
    expect(result).toHaveLength(2)
  })

  it('returns COMPLETED, NO_SHOW, and CANCELED for a CONFIRMED past appointment', () => {
    const result = getAvailableTransitions(makeAppointment({ status: 'CONFIRMED' }), {
      now: AFTER_SLOT,
    })
    expect(result).toEqual(expect.arrayContaining(['COMPLETED', 'NO_SHOW', 'CANCELED']))
    expect(result).toHaveLength(3)
  })

  it('returns only CANCELED for a CONFIRMED future appointment', () => {
    const result = getAvailableTransitions(makeAppointment({ status: 'CONFIRMED' }), {
      now: BEFORE_SLOT,
    })
    expect(result).toEqual(['CANCELED'])
  })

  it('returns an empty array for any terminal status', () => {
    expect(
      getAvailableTransitions(makeAppointment({ status: 'COMPLETED' }), { now: AFTER_SLOT }),
    ).toEqual([])
    expect(
      getAvailableTransitions(makeAppointment({ status: 'NO_SHOW' }), { now: AFTER_SLOT }),
    ).toEqual([])
    expect(
      getAvailableTransitions(makeAppointment({ status: 'CANCELED' }), { now: AFTER_SLOT }),
    ).toEqual([])
  })

  it('filters results by roleAllowedTargets', () => {
    const result = getAvailableTransitions(makeAppointment({ status: 'PENDING' }), {
      now: AFTER_SLOT,
      roleAllowedTargets: ['CONFIRMED'],
    })
    expect(result).toEqual(['CONFIRMED'])
  })

  it('returns empty when roleAllowedTargets excludes all valid transitions', () => {
    const result = getAvailableTransitions(makeAppointment({ status: 'PENDING' }), {
      now: AFTER_SLOT,
      roleAllowedTargets: ['COMPLETED'],
    })
    expect(result).toEqual([])
  })
})
