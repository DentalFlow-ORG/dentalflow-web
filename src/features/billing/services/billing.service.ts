import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  BillingPlansResponse,
  ChangeSubscriptionPlanRequest,
  CheckoutSessionRequest,
  ClinicSubscription,
  CurrentBillingStatus,
  SessionUrlResponse,
  StartTrialRequest,
} from '../types/billing.types'

export function listBillingPlans() {
  return apiRequest<BillingPlansResponse>('/billing/plans', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function changeSubscriptionPlan(dto: ChangeSubscriptionPlanRequest) {
  return apiRequest<CurrentBillingStatus>('/billing/subscription/change-plan', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function getClinicSubscription() {
  return apiRequest<ClinicSubscription | null>('/billing/subscription', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getCurrentBillingStatus() {
  return apiRequest<CurrentBillingStatus>('/billing/subscription/current', {
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

export function startTrial(dto: StartTrialRequest) {
  return apiRequest<CurrentBillingStatus>('/billing/trial/start', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function createPortalSession() {
  return apiRequest<SessionUrlResponse>('/billing/portal-session', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function cancelSubscription() {
  return apiRequest<void>('/billing/subscription/cancel', {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}
