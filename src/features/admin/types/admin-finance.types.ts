export type AdminSubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'PAUSED'
  | 'INCOMPLETE'

export type AdminFinanceSummary = {
  kpis: {
    totalPlans: number
    activePlans: number
    activeSubscriptions: number
    trialSubscriptions: number
    canceledSubscriptions: number
    pastDueSubscriptions: number
    estimatedMrr: number
    estimatedArr: number
    stripeEventsTotal: number
    stripeEventsProcessed: number
    stripeEventsFailed: number
  }
  statusDistribution: Array<{
    status: AdminSubscriptionStatus
    count: number
  }>
  subscriptionsByPlan: Array<{
    planId: string
    planName: string
    activeSubscriptions: number
    totalSubscriptions: number
    estimatedMrr: number
  }>
}

export type AdminFinancePlan = {
  id: string
  name: string
  slug: string
  description: string | null
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  priceMonthly: number
  priceYearly: number
  maxProfiles: number | null
  maxLeadsPerMonth: number | null
  maxServicesPerProfile: number | null
  hasAppointments: boolean
  hasAnalytics: boolean
  hasCustomDomain: boolean
  hasPrioritySupport: boolean
  isActive: boolean
  isPublic: boolean
  displayOrder: number
  subscriptionsCount: number
  activeSubscriptionsCount: number
  createdAt: string
  updatedAt: string
}

export type AdminFinanceSubscription = {
  id: string
  clinic: {
    id: string
    name: string
    email: string | null
  }
  plan: {
    id: string
    name: string
    slug: string
    priceMonthly: number
    priceYearly: number
  }
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: AdminSubscriptionStatus
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  endedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminFinanceStripeEvent = {
  id: string
  type: string
  processed: boolean
  processedAt: string | null
  errorMessage: string | null
  createdAt: string
  receivedAt: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

export type SubscriptionFilters = {
  page: number
  limit: number
  status?: AdminSubscriptionStatus
  planId?: string
  search?: string
  from?: string
  to?: string
}

export type StripeEventFilters = {
  page: number
  limit: number
  processed?: 'true' | 'false'
  type?: string
  from?: string
  to?: string
}
