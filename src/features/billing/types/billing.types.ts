export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'PAUSED'
  | 'INCOMPLETE'

export type BillingInterval = 'MONTHLY' | 'YEARLY'

export type BillingPlan = {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  hasMonthlyPrice: boolean
  hasYearlyPrice: boolean
  maxProfiles: number | null
  maxLeadsPerMonth: number | null
  maxServicesPerProfile: number | null
  hasAppointments: boolean
  hasAnalytics: boolean
  hasCustomDomain: boolean
  hasPrioritySupport: boolean
  displayOrder: number
}

export type ClinicSubscription = {
  id: string
  status: SubscriptionStatus
  billingInterval: BillingInterval | null
  plan: {
    id: string
    name: string
    slug: string
    priceMonthly: number
    priceYearly: number
  } | null
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
}

export type CheckoutSessionRequest = {
  planId: string
  billingInterval: BillingInterval
}

export type SessionUrlResponse = {
  url: string
}
