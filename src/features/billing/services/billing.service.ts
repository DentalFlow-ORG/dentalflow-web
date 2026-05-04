import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  BillingPlan,
  CheckoutSessionRequest,
  ClinicSubscription,
  PortalSessionRequest,
  SessionUrlResponse,
} from '../types/billing.types'

export function listBillingPlans() {
  return apiRequest<BillingPlan[]>('/billing/plans', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getClinicSubscription() {
  return apiRequest<ClinicSubscription | null>('/billing/subscription', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createCheckoutSession(dto: CheckoutSessionRequest) {
  return apiRequest<SessionUrlResponse>('/billing/checkout-session', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function createPortalSession(dto: PortalSessionRequest) {
  return apiRequest<SessionUrlResponse>('/billing/portal-session', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function cancelSubscription() {
  return apiRequest<void>('/billing/subscription/cancel', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}
