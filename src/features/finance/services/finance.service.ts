import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateFinancialCategoryDto,
  CreateFinancialTransactionDto,
  CreateFixedExpenseDto,
  FinanceFilters,
  FinanceSummary,
  FinancialCategory,
  FinancialTransaction,
  FinancialTransactionsResponse,
  FixedExpense,
  UpdateFinancialCategoryDto,
  UpdateFinancialTransactionDto,
  UpdateFixedExpenseDto,
} from '../types/finance.types'

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

export function createFinancialCategory(dto: CreateFinancialCategoryDto) {
  return apiRequest<FinancialCategory>('/finance/categories', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateFinancialCategory(id: string, dto: UpdateFinancialCategoryDto) {
  return apiRequest<FinancialCategory>(`/finance/categories/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteFinancialCategory(id: string) {
  return apiRequest<void>(`/finance/categories/${id}`, {
    method: 'DELETE',
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

export function updateFinancialTransaction(id: string, dto: UpdateFinancialTransactionDto) {
  return apiRequest<FinancialTransaction>(`/finance/transactions/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteFinancialTransaction(id: string) {
  return apiRequest<void>(`/finance/transactions/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

export function updateFixedExpense(id: string, dto: UpdateFixedExpenseDto) {
  return apiRequest<FixedExpense>(`/finance/fixed-expenses/${id}`, {
    method: 'PATCH',
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
