import { apiRequest } from './http'

export type PublicLeadPayload = {
  name: string
  phone: string
  clinicName?: string
  preferredTime?: string
  context?: string
  acceptedPrivacyPolicy: boolean
}

export type PublicLeadResponse = {
  success: true
  message: string
}

export function submitPublicLead(payload: PublicLeadPayload): Promise<PublicLeadResponse> {
  return apiRequest<PublicLeadResponse>('/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
