import type { AuditLogFilters } from '../types/compliance.types'

// Actions most relevant for dashboard display — full list kept in enum
export const COMMON_ACTIONS = [
  'USER_CREATED',
  'USER_LOGIN_SUCCESS',
  'USER_LOGIN_FAILURE',
  'USER_LOGOUT',
  'USER_REFRESH_TOKEN',
  'USER_REFRESH_TOKEN_FAILED',
  'TERMS_ACCEPTED',
  'PRIVACY_REQUEST_CREATED',
  'PRIVACY_REQUEST_STATUS_CHANGED',
  'COOKIE_CONSENT_RECORDED',
  'USER_UPDATED',
  'USER_DEACTIVATED',
  'USER_ROLE_CHANGED',
  'CLINICAL_RECORD_ACCESSED',
  'GOOGLE_CALENDAR_CONNECTED',
  'GOOGLE_CALENDAR_DISCONNECTED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_CANCELED',
] as const

export const INITIAL_FILTERS: AuditLogFilters = {
  action: '',
  actorUserId: '',
  clinicId: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 20,
}
