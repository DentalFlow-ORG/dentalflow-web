import { apiRequest } from '@/services/http'

export type PrivacyRequestType =
  | 'CONFIRM_PROCESSING'
  | 'ACCESS_DATA'
  | 'CORRECT_DATA'
  | 'DELETE_OR_ANONYMIZE'
  | 'PORTABILITY'
  | 'SHARING_INFORMATION'
  | 'REVOKE_CONSENT'
  | 'OTHER'

export type RequesterType = 'PATIENT' | 'CLINIC_OWNER' | 'CLINIC_STAFF' | 'OTHER'

export type CreatePrivacyRequestPayload = {
  requesterName: string
  requesterEmail: string
  requesterType: RequesterType
  clinicName?: string
  requestType: PrivacyRequestType
  description: string
  identityConfirmationAccepted: boolean
}

export type PrivacyRequestResponse = {
  requestCode: string
  message: string
}

export function createPrivacyRequest(
  payload: CreatePrivacyRequestPayload,
): Promise<PrivacyRequestResponse> {
  return apiRequest<PrivacyRequestResponse>('/privacy/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export type CookieConsentLogPayload = {
  anonymousId?: string
  categories: {
    necessary: true
    preferences: boolean
    analytics: boolean
    marketing: boolean
  }
  policyVersion: string
  source: 'banner' | 'preferences'
}

export async function logCookieConsent(payload: CookieConsentLogPayload): Promise<void> {
  try {
    await apiRequest('/privacy/cookie-consent', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch {
    // Non-blocking: consent is stored locally; backend logging is best-effort
  }
}
