import type { Appointment } from '@/features/scheduling/types/scheduling.types'

// These defaults match the time-guard test fixtures in the scheduling tests:
//   appointmentDate '2026-05-26' + startTime '1970-01-01T10:00:00.000Z'
//   → buildAppointmentDateTime produces new Date('2026-05-26T10:00:00-03:00') = 13:00 UTC
export const DEFAULT_APPT_DATE = '2026-05-26'
export const DEFAULT_APPT_START = '1970-01-01T10:00:00.000Z'

export function makeAppointment(overrides?: Partial<Appointment>): Appointment {
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
    appointmentDate: DEFAULT_APPT_DATE,
    startTime: DEFAULT_APPT_START,
    endTime: null,
    durationMinutes: null,
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
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z',
    profile: null,
    service: null,
    patient: null,
    ...overrides,
  }
}
