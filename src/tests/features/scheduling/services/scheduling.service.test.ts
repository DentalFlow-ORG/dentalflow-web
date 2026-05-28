import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  updateAppointmentPayment,
  cancelAppointment,
  getAvailableSlots,
} from '@/features/scheduling/services/scheduling.service'
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentPaymentDto,
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
