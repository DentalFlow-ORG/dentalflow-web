import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  AppointmentInvoiceDraft,
  AppointmentsForInvoiceFilters,
  AppointmentsForInvoiceResponse,
  FiscalProfilePayload,
  FiscalProfileResponse,
  FiscalSummary,
  InvoiceFilters,
  InvoiceRequest,
  InvoicesResponse,
  ServiceInvoice,
} from '../types/fiscal.types'

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function getFiscalProfile() {
  return apiRequest<FiscalProfileResponse>('/clinic/fiscal-profile', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function saveFiscalProfile(payload: FiscalProfilePayload) {
  return apiRequest('/clinic/fiscal-profile', {
    method: 'PUT',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function getFiscalSummary() {
  return apiRequest<FiscalSummary>('/clinic/invoices/summary', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listInvoices(filters: InvoiceFilters) {
  return apiRequest<InvoicesResponse>(
    `/clinic/invoices${buildQuery({
      status: filters.status,
      customer: filters.customer,
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.limit,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function createInvoice(payload: InvoiceRequest) {
  return apiRequest<ServiceInvoice>('/clinic/invoices', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function getInvoice(id: string) {
  return apiRequest<ServiceInvoice>(`/clinic/invoices/${id}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function updateInvoice(id: string, payload: InvoiceRequest) {
  return apiRequest<ServiceInvoice>(`/clinic/invoices/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function markInvoiceReady(id: string) {
  return apiRequest<ServiceInvoice>(`/clinic/invoices/${id}/mark-ready`, {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function simulateInvoiceIssue(id: string) {
  return apiRequest<{ invoice: ServiceInvoice; message: string }>(
    `/clinic/invoices/${id}/simulate-issue`,
    { method: 'POST', accessToken: getAccessToken() },
  )
}

export function cancelInvoice(id: string, reason: string) {
  return apiRequest<ServiceInvoice>(`/clinic/invoices/${id}/cancel`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ reason }),
  })
}

export function listAppointmentsForInvoice(filters: AppointmentsForInvoiceFilters) {
  return apiRequest<AppointmentsForInvoiceResponse>(
    `/clinic/invoices/appointments${buildQuery({
      patient: filters.patient,
      from: filters.from,
      to: filters.to,
      profileId: filters.profileId,
      paymentStatus: filters.paymentStatus,
      page: filters.page,
      limit: filters.limit,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function getAppointmentInvoiceDraft(appointmentId: string) {
  return apiRequest<AppointmentInvoiceDraft>(`/clinic/invoices/from-appointment/${appointmentId}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}
