import type { Availability, AvailabilityException } from '@/features/scheduling/types/scheduling.types'

export function makeAvailability(overrides?: Partial<Availability>): Availability {
  return {
    id: 'av1',
    profileId: 'p1',
    clinicId: 'c1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '17:00',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeAvailabilityException(overrides?: Partial<AvailabilityException>): AvailabilityException {
  return {
    id: 'ex1',
    profileId: 'p1',
    clinicId: 'c1',
    exceptionDate: '2026-05-25',
    isDayOff: true,
    startTime: null,
    endTime: null,
    reason: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
