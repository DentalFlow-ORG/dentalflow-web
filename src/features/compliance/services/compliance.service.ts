import { apiRequest } from '@/services/http'

import type {
  AuditLogEntry,
  AuditLogFilters,
  CookieConsentFilters,
  CookieConsentLog,
  PaginatedResponse,
  PrivacyRequest,
  PrivacyRequestFilters,
} from '../types/compliance.types'

function buildParams(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function listPrivacyRequests(
  filters: PrivacyRequestFilters,
): Promise<PaginatedResponse<PrivacyRequest>> {
  return apiRequest<PaginatedResponse<PrivacyRequest>>(
    `/privacy/requests${buildParams(filters)}`,
  )
}

export function listAuditLogs(
  filters: AuditLogFilters,
): Promise<PaginatedResponse<AuditLogEntry>> {
  return apiRequest<PaginatedResponse<AuditLogEntry>>(
    `/audit-logs${buildParams(filters)}`,
  )
}

export function listCookieConsents(
  filters: CookieConsentFilters,
): Promise<PaginatedResponse<CookieConsentLog>> {
  return apiRequest<PaginatedResponse<CookieConsentLog>>(
    `/privacy/cookie-consents${buildParams(filters)}`,
  )
}
