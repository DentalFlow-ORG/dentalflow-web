import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  updateAppointmentPayment,
  cancelAppointment,
  getAvailableSlots,
  listAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  listAvailabilityExceptions,
  createAvailabilityException,
  updateAvailabilityException,
  deleteAvailabilityException,
} from '@/features/scheduling/services/scheduling.service'
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentPaymentDto,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  CreateAvailabilityExceptionDto,
  UpdateAvailabilityExceptionDto,
} from '@/features/scheduling/types/scheduling.types'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-test')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue(undefined)
})

// ─── listAppointments ─────────────────────────────────────────────────────────

describe('listAppointments', () => {
  it('calls GET /appointments with no query when date is omitted', async () => {
    await listAppointments()
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments')
    expect(options.method).toBe('GET')
  })

  it('appends encoded date as query string when date is provided', async () => {
    await listAppointments('2026-06-15')
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments?date=2026-06-15')
  })
})

// ─── createAppointment ────────────────────────────────────────────────────────

describe('createAppointment', () => {
  const dto: CreateAppointmentDto = {
    profileId: 'prof-1',
    patientName: 'João Silva',
    patientPhone: '11999999999',
    appointmentDate: '2026-06-15',
    startTime: '10:00',
  }

  it('calls POST /appointments with the serialized dto as body', async () => {
    await createAppointment(dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(dto)
  })

  it('passes the access token from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-create')
    await createAppointment(dto)
    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-create')
  })
})

// ─── updateAppointment ────────────────────────────────────────────────────────

describe('updateAppointment', () => {
  it('calls PATCH /appointments/{id} with the serialized dto as body', async () => {
    const dto: UpdateAppointmentDto = { notes: 'Atualizado', durationMinutes: 60 }
    await updateAppointment('appt-99', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments/appt-99')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual(dto)
  })
})

// ─── updateAppointmentStatus ──────────────────────────────────────────────────

describe('updateAppointmentStatus', () => {
  it('calls PATCH /appointments/{id}/status with the status body', async () => {
    await updateAppointmentStatus('appt-42', { status: 'CONFIRMED' })
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments/appt-42/status')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual({ status: 'CONFIRMED' })
  })
})

// ─── updateAppointmentPayment ─────────────────────────────────────────────────

describe('updateAppointmentPayment', () => {
  it('calls PATCH /appointments/{id}/payment with the payment dto body', async () => {
    const dto: UpdateAppointmentPaymentDto = { paymentStatus: 'PAID', paidAmountCents: 15000 }
    await updateAppointmentPayment('appt-7', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments/appt-7/payment')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual(dto)
  })
})

// ─── cancelAppointment ────────────────────────────────────────────────────────

describe('cancelAppointment', () => {
  it('calls POST /appointments/{id}/cancel with canceledBy and cancellationReason', async () => {
    await cancelAppointment('appt-5', 'Patient request', 'CLINIC')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments/appt-5/cancel')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      canceledBy: 'CLINIC',
      cancellationReason: 'Patient request',
    })
  })

  it('defaults canceledBy to "CLINIC" when not supplied', async () => {
    await cancelAppointment('appt-5', 'No show')
    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body).canceledBy).toBe('CLINIC')
  })
})

// ─── getAvailableSlots ────────────────────────────────────────────────────────

describe('getAvailableSlots', () => {
  it('calls GET /appointments/slots with required profileId and date params', async () => {
    mockApiRequest.mockResolvedValue([])
    await getAvailableSlots({ profileId: 'prof-1', date: '2026-06-15' })
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/appointments/slots?profileId=prof-1&date=2026-06-15')
    expect(options.method).toBe('GET')
  })

  it('appends optional serviceId and durationMinutes to the query when provided', async () => {
    mockApiRequest.mockResolvedValue([])
    await getAvailableSlots({
      profileId: 'prof-1',
      date: '2026-06-15',
      serviceId: 'svc-2',
      durationMinutes: 30,
    })
    const [path] = mockApiRequest.mock.calls[0]
    expect(path).toContain('serviceId=svc-2')
    expect(path).toContain('durationMinutes=30')
  })
})

// ─── listAvailability ─────────────────────────────────────────────────────────

describe('listAvailability', () => {
  it('calls GET /profiles/{profileId}/availability', async () => {
    mockApiRequest.mockResolvedValue([])
    await listAvailability('prof-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability')
    expect(options.method).toBe('GET')
  })
})

// ─── createAvailability ───────────────────────────────────────────────────────

describe('createAvailability', () => {
  const dto: CreateAvailabilityDto = { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' }

  it('calls POST /profiles/{profileId}/availability with the serialized dto as body', async () => {
    await createAvailability('prof-1', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(dto)
  })

  it('passes the access token from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-avail')
    await createAvailability('prof-1', dto)
    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-avail')
  })
})

// ─── updateAvailability ───────────────────────────────────────────────────────

describe('updateAvailability', () => {
  it('calls PATCH /profiles/{profileId}/availability/{availId} with the serialized dto as body', async () => {
    const dto: UpdateAvailabilityDto = { isActive: false }
    await updateAvailability('prof-1', 'av-1', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability/av-1')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual(dto)
  })
})

// ─── deleteAvailability ───────────────────────────────────────────────────────

describe('deleteAvailability', () => {
  it('calls DELETE /profiles/{profileId}/availability/{availId} with no body', async () => {
    await deleteAvailability('prof-1', 'av-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability/av-1')
    expect(options.method).toBe('DELETE')
    expect(options.body).toBeUndefined()
  })
})

// ─── listAvailabilityExceptions ───────────────────────────────────────────────

describe('listAvailabilityExceptions', () => {
  it('calls GET /profiles/{profileId}/availability-exceptions', async () => {
    mockApiRequest.mockResolvedValue([])
    await listAvailabilityExceptions('prof-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability-exceptions')
    expect(options.method).toBe('GET')
  })
})

// ─── createAvailabilityException ──────────────────────────────────────────────

describe('createAvailabilityException', () => {
  it('calls POST /profiles/{profileId}/availability-exceptions with the serialized dto as body', async () => {
    const dto: CreateAvailabilityExceptionDto = { exceptionDate: '2026-07-04', isDayOff: true }
    await createAvailabilityException('prof-1', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability-exceptions')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(dto)
  })
})

// ─── updateAvailabilityException ──────────────────────────────────────────────

describe('updateAvailabilityException', () => {
  it('calls PATCH /profiles/{profileId}/availability-exceptions/{excId} with the serialized dto as body', async () => {
    const dto: UpdateAvailabilityExceptionDto = { isDayOff: false, startTime: '09:00', endTime: '12:00' }
    await updateAvailabilityException('prof-1', 'ex-1', dto)
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability-exceptions/ex-1')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual(dto)
  })
})

// ─── deleteAvailabilityException ──────────────────────────────────────────────

describe('deleteAvailabilityException', () => {
  it('calls DELETE /profiles/{profileId}/availability-exceptions/{excId} with no body', async () => {
    await deleteAvailabilityException('prof-1', 'ex-1')
    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/profiles/prof-1/availability-exceptions/ex-1')
    expect(options.method).toBe('DELETE')
    expect(options.body).toBeUndefined()
  })
})

// ─── error propagation ────────────────────────────────────────────────────────

describe('error propagation', () => {
  it('rejects with the same error thrown by apiRequest', async () => {
    const error = new Error('Network error')
    mockApiRequest.mockRejectedValue(error)
    await expect(
      updateAppointmentStatus('appt-1', { status: 'CONFIRMED' }),
    ).rejects.toThrow('Network error')
  })
})
