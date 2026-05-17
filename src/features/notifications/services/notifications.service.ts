import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateConsentRequest,
  NotificationConsent,
  NotificationMessagesResponse,
  NotificationPreference,
  NotificationQuota,
  NotificationTemplate,
  SendNotificationRequest,
  SendNotificationResponse,
} from '../types/notifications.types'

function auth() {
  return { accessToken: getAccessToken() }
}

export function getPreferences() {
  return apiRequest<NotificationPreference>('/notifications/preferences', {
    method: 'GET',
    ...auth(),
  })
}

export function updatePreferences(data: Partial<NotificationPreference>) {
  return apiRequest<NotificationPreference>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...auth(),
  })
}

export function getQuota() {
  return apiRequest<NotificationQuota>('/notifications/quota', {
    method: 'GET',
    ...auth(),
  })
}

export function listTemplates() {
  return apiRequest<NotificationTemplate[]>('/notifications/templates', {
    method: 'GET',
    ...auth(),
  })
}

export function listMessages(params?: { appointmentId?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.appointmentId) qs.set('appointmentId', params.appointmentId)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiRequest<NotificationMessagesResponse>(`/notifications/messages${query}`, {
    method: 'GET',
    ...auth(),
  })
}

export function listConsents(params?: { phone?: string }) {
  const qs = new URLSearchParams({ channel: 'WHATSAPP', scope: 'UTILITY' })
  if (params?.phone) qs.set('phone', params.phone)
  return apiRequest<NotificationConsent[]>(`/notifications/consents?${qs.toString()}`, {
    method: 'GET',
    ...auth(),
  })
}

export function createOrUpdateConsent(data: CreateConsentRequest) {
  return apiRequest<{ id: string; granted: boolean }>('/notifications/consents', {
    method: 'POST',
    body: JSON.stringify(data),
    ...auth(),
  })
}

export function revokeConsent(consentId: string) {
  return apiRequest<NotificationConsent>(`/notifications/consents/${consentId}/revoke`, {
    method: 'PATCH',
    ...auth(),
  })
}

export function sendNotification(data: SendNotificationRequest) {
  return apiRequest<SendNotificationResponse>('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(data),
    ...auth(),
  })
}

// Template variable substitution for preview only (not sent to backend)
export function renderTemplatePreview(
  bodyPt: string,
  vars: Record<string, string>,
): string {
  const map: Record<string, string> = {
    patientName: vars.patientName ?? '—',
    date: vars.date ?? '—',
    time: vars.time ?? '—',
    clinicName: vars.clinicName ?? '—',
    amount: vars.amount ?? '—',
  }

  return bodyPt
    .replace(/\{\{1\}\}/g, map.patientName)
    .replace(/\{\{2\}\}/g, map.date !== '—' ? map.date : map.amount)
    .replace(/\{\{3\}\}/g, map.time)
    .replace(/\{\{4\}\}/g, map.clinicName)
}

// Map template slug to human-readable label
export const TEMPLATE_LABELS: Record<string, string> = {
  appointment_reminder_24h: 'Lembrete de consulta (24h)',
  appointment_confirmation_request: 'Solicitação de confirmação',
  appointment_rescheduled: 'Reagendamento',
  payment_pending_notice: 'Cobrança pendente',
  post_appointment_simple: 'Mensagem pós-consulta',
}

// Which templates are relevant for each appointment status
export const TEMPLATES_BY_STATUS: Record<string, string[]> = {
  PENDING: ['appointment_reminder_24h', 'appointment_confirmation_request'],
  CONFIRMED: ['appointment_reminder_24h'],
  COMPLETED: ['post_appointment_simple', 'payment_pending_notice'],
  CANCELED: ['appointment_rescheduled'],
  NO_SHOW: ['appointment_rescheduled', 'payment_pending_notice'],
}
