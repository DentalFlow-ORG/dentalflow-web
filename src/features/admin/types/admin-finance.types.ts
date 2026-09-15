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
    currency: string
    stripeEventsTotal: number
    stripeEventsProcessed: number
    stripeEventsFailed: number
  }
  revenueByCurrency: Array<{
    currency: string
    estimatedMrr: number
    estimatedArr: number
  }>
  statusDistribution: Array<{
    status: AdminSubscriptionStatus
    count: number
  }>
  subscriptionsByPlan: Array<{
    planId: string
    planName: string
    activeSubscriptions: number
    trialSubscriptions: number
    canceledSubscriptions: number
    pastDueSubscriptions: number
    totalSubscriptions: number
    subscriberCount: number
    estimatedMrr: number
    estimatedArr: number
    currency: string
  }>
  revenueByPrice: Array<{
    stripePriceId: string
    priceNickname: string | null
    planId: string
    planName: string
    currency: string
    billingInterval: 'MONTHLY' | 'YEARLY' | null
    estimatedMrr: number
    estimatedArr: number
    subscriberCount: number
  }>
  recentlyCreatedSubscriptions: AdminFinanceSubscriptionPreview[]
  recentlyCanceledSubscriptions: AdminFinanceSubscriptionPreview[]
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
  trialSubscriptionsCount: number
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
  status: AdminSubscriptionStatus
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  endedAt: string | null
  items: Array<{
    id: string
    stripePriceId: string
    priceNickname: string | null
    billingInterval: 'MONTHLY' | 'YEARLY' | null
    unitAmount: number | null
    unitAmountDecimal: string | null
    currency: string
    quantity: number
  }>
  createdAt: string
  updatedAt: string
}

export type AdminFinanceSubscriptionPreview = {
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
  }
  status: AdminSubscriptionStatus
  billingInterval: 'MONTHLY' | 'YEARLY' | null
  currency: string
  createdAt: string
  currentPeriodEnd: string | null
  canceledAt: string | null
  endedAt: string | null
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
