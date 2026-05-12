export const STOCK_PRODUCT_STATUSES = [
  'ACTIVE',
  'LOW',
  'EMPTY',
  'EXPIRING',
  'EXPIRED',
  'INACTIVE',
] as const

export type StockProductStatus = (typeof STOCK_PRODUCT_STATUSES)[number]

export type StockCategory = {
  id: string
  clinicId: string
  name: string
  color: string | null
  productCount: number
  createdAt: string
  updatedAt: string
}

export type StockProduct = {
  id: string
  clinicId: string
  categoryId: string
  name: string
  description: string | null
  unit: string
  currentQuantity: number
  minQuantity: number
  purchasePrice: number | null // in cents
  supplier: string | null
  expiresAt: string | null
  notes: string | null
  isActive: boolean
  status: StockProductStatus
  category: {
    id: string
    name: string
    color: string | null
  }
  createdAt: string
  updatedAt: string
}

export type StockSummary = {
  totalActive: number
  lowStock: number
  emptyStock: number
  expiring: number
  expired: number
  inactive: number
  estimatedValue: number // in cents
  totalCategories: number
}

export type ListStockProductsQuery = {
  search?: string
  categoryId?: string
  status?: StockProductStatus
  page?: number
  limit?: number
}

export type PaginatedStockProductsResponse = {
  data: StockProduct[]
  total: number
  page: number
  limit: number
}

export type CreateStockCategoryPayload = {
  name: string
  color?: string
}

export type UpdateStockCategoryPayload = {
  name?: string
  color?: string
}

export type CreateStockProductPayload = {
  name: string
  categoryId: string
  description?: string
  unit?: string
  currentQuantity?: number
  minQuantity?: number
  purchasePrice?: number // in cents
  supplier?: string
  expiresAt?: string // YYYY-MM-DD
  notes?: string
  isActive?: boolean
}

export type UpdateStockProductPayload = {
  name?: string
  categoryId?: string
  description?: string
  unit?: string
  currentQuantity?: number
  minQuantity?: number
  purchasePrice?: number // in cents
  supplier?: string
  expiresAt?: string | null // YYYY-MM-DD or null to clear
  notes?: string
  isActive?: boolean
}
