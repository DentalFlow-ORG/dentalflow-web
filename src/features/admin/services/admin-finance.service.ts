import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  AdminFinancePlan,
  AdminFinanceStripeEvent,
  AdminFinanceSubscription,
  AdminFinanceSummary,
  PaginatedResponse,
  StripeEventFilters,
  SubscriptionFilters,
} from '../types/admin-finance.types'

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function getAdminFinanceSummary() {
  return apiRequest<AdminFinanceSummary>('/admin/finance/summary', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listAdminFinancePlans() {
  return apiRequest<AdminFinancePlan[]>('/admin/finance/plans', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listAdminFinanceSubscriptions(filters: SubscriptionFilters) {
  return apiRequest<PaginatedResponse<AdminFinanceSubscription>>(
    `/admin/finance/subscriptions${buildQuery(filters)}`,
    {
      method: 'GET',
      accessToken: getAccessToken(),
    },
  )
}

export function listAdminFinanceStripeEvents(filters: StripeEventFilters) {
  return apiRequest<PaginatedResponse<AdminFinanceStripeEvent>>(
    `/admin/finance/stripe-events${buildQuery(filters)}`,
    {
      method: 'GET',
      accessToken: getAccessToken(),
    },
  )
}
