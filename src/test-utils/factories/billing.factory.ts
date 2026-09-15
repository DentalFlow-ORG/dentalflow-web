import type {
  BillingPlan,
  BillingPlanCampaign,
  CurrentBillingStatus,
} from '@/features/billing/types/billing.types'

const DEFAULT_PLAN_CAMPAIGN: BillingPlanCampaign = {
  enabled: false,
  promotionalPriceMonthly: null,
  compareAtPriceMonthly: null,
  promotionReady: false,
  couponConfigured: false,
}

export function makeBillingPlan(overrides?: Partial<BillingPlan>): BillingPlan {
  return {
    id: 'plan-1',
    name: 'Professional',
    slug: 'professional',
    description: null,
    priceMonthly: 9900,
    priceYearly: 99000,
    hasMonthlyPrice: true,
    hasYearlyPrice: true,
    trialEligible: true,
    annualDiscountPercent: null,
    maxProfiles: null,
    maxServicesPerProfile: null,
    hasAppointments: true,
    hasAnalytics: true,
    hasCustomDomain: false,
    hasPrioritySupport: false,
    displayOrder: 1,
    campaign: DEFAULT_PLAN_CAMPAIGN,
    ...overrides,
  }
}

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

export function makeAccessGrantedBillingStatus(
  overrides?: Partial<CurrentBillingStatus>,
): CurrentBillingStatus {
  return makeBillingStatus({ accessAllowed: true, ...overrides })
}

export function makeAccessDeniedBillingStatus(
  overrides?: Partial<CurrentBillingStatus>,
): CurrentBillingStatus {
  return makeBillingStatus({ accessAllowed: false, ...overrides })
}
