export type BillingInterval = 'MONTHLY' | 'YEARLY'
export type NormalizedBillingInterval = 'monthly' | 'annual'
export type NormalizedBillingStatus =
  | 'missing'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'
  | 'paused'

export type BillingPlan = {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  hasMonthlyPrice: boolean
  hasYearlyPrice: boolean
  trialEligible: boolean
  annualDiscountPercent: number | null
  maxProfiles: number | null
  maxServicesPerProfile: number | null
  hasAppointments: boolean
  hasAnalytics: boolean
  hasCustomDomain: boolean
  hasPrioritySupport: boolean
  displayOrder: number
  campaign: BillingPlanCampaign
}

export type BillingPlanCampaign = {
  enabled: boolean
  promotionalPriceMonthly: number | null
  compareAtPriceMonthly: number | null
  promotionReady: boolean
  couponConfigured: boolean
}

export type BillingCampaign = {
  name: string
  enabled: boolean
  totalSpots: number
  claimedSpots: number
  promotionEndDate: string
  promotionalPrices: Record<string, { monthly: number; yearly?: number }>
  compareAtPrices: Record<string, { monthly: number; yearly?: number }>
  message: string
}

export type BillingPlansResponse = {
  plans: BillingPlan[]
  campaign: BillingCampaign
}

export type CurrentBillingStatus = {
  hasSubscription: boolean
  status: NormalizedBillingStatus
  planKey: string | null
  planName: string | null
  billingInterval: NormalizedBillingInterval | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  accessAllowed: boolean
  requiresPlanSelection: boolean
  requiresPayment: boolean
  message: string
}

export type CheckoutSessionRequest = {
  planKey: string
  billingInterval: BillingInterval
}

export type StartTrialRequest = CheckoutSessionRequest

export type ChangeSubscriptionPlanRequest = CheckoutSessionRequest

export type SessionUrlResponse = {
  url: string
}
