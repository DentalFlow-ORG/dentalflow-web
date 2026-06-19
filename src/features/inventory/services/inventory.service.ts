import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateStockCategoryPayload,
  CreateStockMovementPayload,
  CreateStockProductPayload,
  ListStockMovementsQuery,
  ListStockProductsQuery,
  PaginatedStockMovementsResponse,
  PaginatedStockProductsResponse,
  StockCategory,
  StockMovement,
  StockProduct,
  StockPurchaseList,
  StockSummary,
  UpdateStockCategoryPayload,
  UpdateStockProductPayload,
} from '../types/inventory.types'

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

// ── Summary ──────────────────────────────────────────────────────────────────

export function getStockSummary() {
  return apiRequest<StockSummary>('/stock/summary', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

// ── Purchase list ─────────────────────────────────────────────────────────────

export function getStockPurchaseList() {
  return apiRequest<StockPurchaseList>('/stock/purchase-list', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

// ── Categories ───────────────────────────────────────────────────────────────

export function listStockCategories() {
  return apiRequest<StockCategory[]>('/stock/categories', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createStockCategory(payload: CreateStockCategoryPayload) {
  return apiRequest<StockCategory>('/stock/categories', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function updateStockCategory(id: string, payload: UpdateStockCategoryPayload) {
  return apiRequest<StockCategory>(`/stock/categories/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function deleteStockCategory(id: string) {
  return apiRequest<void>(`/stock/categories/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

// ── Products ─────────────────────────────────────────────────────────────────

export function listStockProducts(query: ListStockProductsQuery = {}) {
  return apiRequest<PaginatedStockProductsResponse>(
    `/stock/products${buildQuery({
      search: query.search,
      categoryId: query.categoryId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function getStockProduct(id: string) {
  return apiRequest<StockProduct>(`/stock/products/${id}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createStockProduct(payload: CreateStockProductPayload) {
  return apiRequest<StockProduct>('/stock/products', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function updateStockProduct(id: string, payload: UpdateStockProductPayload) {
  return apiRequest<StockProduct>(`/stock/products/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function deleteStockProduct(id: string) {
  return apiRequest<void>(`/stock/products/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

export function reactivateStockProduct(id: string) {
  return apiRequest<StockProduct>(`/stock/products/${id}/reactivate`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
  })
}

// â”€â”€ Movements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function createStockMovement(payload: CreateStockMovementPayload) {
  return apiRequest<StockMovement>('/stock/movements', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function listProductStockMovements(productId: string, query: ListStockMovementsQuery = {}) {
  return apiRequest<PaginatedStockMovementsResponse>(
    `/stock/products/${productId}/movements${buildQuery({
      type: query.type,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page,
      limit: query.limit,
    })}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}
