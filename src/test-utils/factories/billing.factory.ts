import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'

export function makeBillingStatus(overrides?: Partial<CurrentBillingStatus>): CurrentBillingStatus {
  return {
    hasSubscription: true,
    status: 'active',
    planKey: 'professional',
    planName: 'Professional',
    billingInterval: 'monthly',
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    trialEndsAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    accessAllowed: true,
    requiresPlanSelection: false,
    requiresPayment: false,
    message: '',
    ...overrides,
  }
}

export function makeAccessGrantedBillingStatus(overrides?: Partial<CurrentBillingStatus>): CurrentBillingStatus {
  return makeBillingStatus({ accessAllowed: true, ...overrides })
}

export function makeAccessDeniedBillingStatus(overrides?: Partial<CurrentBillingStatus>): CurrentBillingStatus {
  return makeBillingStatus({ accessAllowed: false, ...overrides })
}
