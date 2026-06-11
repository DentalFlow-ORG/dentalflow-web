import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  Appointment,
  Availability,
  AvailabilityException,
  AvailabilitySlot,
  CanceledBy,
  CreateAppointmentDto,
  CreateAvailabilityDto,
  CreateAvailabilityExceptionDto,
  UpdateAppointmentDto,
  UpdateAppointmentPaymentDto,
  UpdateAppointmentStatusDto,
  UpdateAvailabilityDto,
  UpdateAvailabilityExceptionDto,
} from '../types/scheduling.types'

// --- Appointments ---

export function listAppointments(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiRequest<Appointment[]>(`/appointments${query}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getAppointment(id: string) {
  return apiRequest<Appointment>(`/appointments/${id}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createAppointment(dto: CreateAppointmentDto) {
  return apiRequest<Appointment>('/appointments', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAppointment(id: string, dto: UpdateAppointmentDto) {
  return apiRequest<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAppointmentStatus(id: string, dto: UpdateAppointmentStatusDto) {
  return apiRequest<Appointment>(`/appointments/${id}/status`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAppointmentPayment(id: string, dto: UpdateAppointmentPaymentDto) {
  return apiRequest<Appointment>(`/appointments/${id}/payment`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function cancelAppointment(id: string, reason?: string, canceledBy: CanceledBy = 'CLINIC') {
  return apiRequest<Appointment>(`/appointments/${id}/cancel`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ canceledBy, cancellationReason: reason }),
  })
}

export function getAvailableSlots(params: {
  profileId: string
  date: string
  serviceId?: string
  durationMinutes?: number
}) {
  const query = new URLSearchParams({ profileId: params.profileId, date: params.date })
  if (params.serviceId) query.set('serviceId', params.serviceId)
  if (params.durationMinutes != null) query.set('durationMinutes', String(params.durationMinutes))
  return apiRequest<AvailabilitySlot[]>(`/appointments/slots?${query}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

// --- Availability ---

export function listAvailability(profileId: string) {
  return apiRequest<Availability[]>(`/profiles/${profileId}/availability`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createAvailability(profileId: string, dto: CreateAvailabilityDto) {
  return apiRequest<Availability>(`/profiles/${profileId}/availability`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAvailability(profileId: string, availId: string, dto: UpdateAvailabilityDto) {
  return apiRequest<Availability>(`/profiles/${profileId}/availability/${availId}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteAvailability(profileId: string, availId: string) {
  return apiRequest<void>(`/profiles/${profileId}/availability/${availId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

// --- Availability Exceptions ---

export function listAvailabilityExceptions(profileId: string) {
  return apiRequest<AvailabilityException[]>(`/profiles/${profileId}/availability-exceptions`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createAvailabilityException(
  profileId: string,
  dto: CreateAvailabilityExceptionDto,
) {
  return apiRequest<AvailabilityException>(`/profiles/${profileId}/availability-exceptions`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAvailabilityException(
  profileId: string,
  excId: string,
  dto: UpdateAvailabilityExceptionDto,
) {
  return apiRequest<AvailabilityException>(
    `/profiles/${profileId}/availability-exceptions/${excId}`,
    {
      method: 'PATCH',
      accessToken: getAccessToken(),
      body: JSON.stringify(dto),
    },
  )
}

export function deleteAvailabilityException(profileId: string, excId: string) {
  return apiRequest<void>(`/profiles/${profileId}/availability-exceptions/${excId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
