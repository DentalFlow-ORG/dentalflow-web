export const STOCK_PRODUCT_STATUSES = [
  'ACTIVE',
  'LOW',
  'EMPTY',
  'EXPIRING',
  'EXPIRED',
  'INACTIVE',
] as const

export type StockProductStatus = (typeof STOCK_PRODUCT_STATUSES)[number]

export const STOCK_MOVEMENT_TYPES = [
  'IN',
  'OUT',
  'ADJUSTMENT',
  'LOSS',
] as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number]

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

export type StockMovement = {
  id: string
  clinicId: string
  productId: string
  type: StockMovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string | null
  notes: string | null
  performedByUserId: string
  createdAt: string
  product?: {
    id: string
    name: string
    unit: string
    category?: {
      id: string
      name: string
    }
  }
  performedBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
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

export type ListStockMovementsQuery = {
  productId?: string
  type?: StockMovementType
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export type PaginatedStockMovementsResponse = {
  data: StockMovement[]
  total: number
  page: number
  limit: number
}

export type CreateStockMovementPayload = {
  productId: string
  type: StockMovementType
  quantity?: number
  newQuantity?: number
  reason?: string
  notes?: string
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
  minQuantity?: number
  purchasePrice?: number // in cents
  supplier?: string
  expiresAt?: string | null // YYYY-MM-DD or null to clear
  notes?: string
  isActive?: boolean
}

// ── Stock Copilot ─────────────────────────────────────────────────────────────

export type StockCopilotResult = {
  summary: string
  highlights: string[]
  recommendedActions: string[]
  generatedAt: string
  cached: boolean
  source: 'AI' | 'CACHE'
  /** Present when generated via POST (includes live snapshot); absent from GET /latest. */
  purchaseListSnapshot?: {
    totalItems: number
    criticalItems: number
    highPriorityItems: number
    mediumPriorityItems: number
    totalEstimatedCostCents: number
  }
}

// ── Purchase list ─────────────────────────────────────────────────────────────

export type PurchasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM'

export type PurchaseListItem = {
  productId: string
  productName: string
  categoryName: string | null
  supplier: string | null
  currentQuantity: number
  minQuantity: number
  unit: string | null
  deficitQuantity: number
  suggestedPurchaseQuantity: number
  estimatedCostCents: number | null
  priority: PurchasePriority
  reason: string
}

export type StockPurchaseList = {
  summary: {
    totalItems: number
    criticalItems: number
    highPriorityItems: number
    mediumPriorityItems: number
    totalEstimatedCostCents: number
  }
  items: PurchaseListItem[]
}

// ── Abnormal Consumption ──────────────────────────────────────────────────────

export type AnomalyType =
  | 'CONSUMPTION_SPIKE'
  | 'LOSS_SPIKE'
  | 'FREQUENT_ADJUSTMENTS'
  | 'NEW_UNUSUAL_CONSUMPTION'

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW'

export type AbnormalConsumptionItem = {
  productId: string
  productName: string
  categoryName: string | null
  currentQuantity: number
  minQuantity: number
  unit: string | null
  anomalyType: AnomalyType
  severity: AnomalySeverity
  recentQuantity: number
  baselineQuantity: number
  changePercent: number | null
  movementCount: number
  reason: string
  suggestedAction: string
}

export type GetAbnormalConsumptionResponse = {
  summary: {
    totalAnomalies: number
    highSeverity: number
    mediumSeverity: number
    lowSeverity: number
    recentDays: number
    baselineDays: number
    analyzedProducts: number
    generatedAt: string
  }
  items: AbnormalConsumptionItem[]
}

// ── Abnormal Consumption Copilot ──────────────────────────────────────────────

export type AbnormalConsumptionCopilotResult = {
  summary: string
  highlights: string[]
  recommendedActions: string[]
  generatedAt: string
  cached: boolean
  source: 'AI' | 'CACHE'
  /** Present when generated via POST (includes live snapshot); absent from GET /latest. */
  anomalySnapshot?: {
    totalAnomalies: number
    highSeverity: number
    mediumSeverity: number
    lowSeverity: number
    recentDays: number
    baselineDays: number
    analyzedProducts: number
  }
}
