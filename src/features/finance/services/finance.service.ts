import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateFinancialTransactionDto,
  CreateFixedExpenseDto,
  FinanceFilters,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransactionsResponse,
  FinanceSummary,
  FixedExpense,
} from '../types/finance.types'

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function getFinanceSummary(filters: FinanceFilters) {
  return apiRequest<FinanceSummary>(
    `/finance/summary${buildQuery({
      from: filters.from,
      to: filters.to,
      groupBy: filters.groupBy,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function listFinancialCategories() {
  return apiRequest<FinancialCategory[]>('/finance/categories', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listFinancialTransactions(filters: FinanceFilters, page = 1, limit = 20) {
  return apiRequest<FinancialTransactionsResponse>(
    `/finance/transactions${buildQuery({
      from: filters.from,
      to: filters.to,
      groupBy: filters.groupBy,
      type: filters.type,
      status: filters.status,
      categoryId: filters.categoryId,
      page,
      limit,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function createFinancialTransaction(dto: CreateFinancialTransactionDto) {
  return apiRequest<FinancialTransaction>('/finance/transactions', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function listFixedExpenses() {
  return apiRequest<FixedExpense[]>('/finance/fixed-expenses', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createFixedExpense(dto: CreateFixedExpenseDto) {
  return apiRequest<FixedExpense>('/finance/fixed-expenses', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function generateFixedExpenseOccurrence(fixedExpenseId: string, period: string) {
  return apiRequest<FinancialTransaction>(
    `/finance/fixed-expenses/${fixedExpenseId}/generate${buildQuery({ period })}`,
    { method: 'POST', accessToken: getAccessToken() },
  )
}
