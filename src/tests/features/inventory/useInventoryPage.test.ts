import { act, renderHook, waitFor } from '@/test-utils/render-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/services/http'

// ── Service mock ─────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/services/inventory.service', () => ({
  getStockSummary: vi.fn(),
  listStockCategories: vi.fn(),
  listStockProducts: vi.fn(),
  getStockProduct: vi.fn(),
  createStockMovement: vi.fn(),
  deleteStockProduct: vi.fn(),
  reactivateStockProduct: vi.fn(),
}))

import {
  getStockSummary,
  listStockCategories,
  listStockProducts,
} from '@/features/inventory/services/inventory.service'

// ── Auth mock ─────────────────────────────────────────────────────────────────

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'OWNER' } }),
}))

// ── Alert mock ────────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// ── Import hook after mocks are registered ────────────────────────────────────

import { useInventoryPage } from '@/features/inventory/hooks/useInventoryPage'
import type {
  StockCategory,
  StockProduct,
  StockSummary,
} from '@/features/inventory/types/inventory.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSummary(overrides: Partial<StockSummary> = {}): StockSummary {
  return {
    totalActive: 10,
    lowStock: 2,
    emptyStock: 0,
    expiring: 1,
    expired: 0,
    inactive: 3,
    estimatedValue: 50000,
    totalCategories: 4,
    ...overrides,
  }
}

function makeCategory(overrides: Partial<StockCategory> = {}): StockCategory {
  return {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Luvas',
    color: '#10B981',
    productCount: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeProduct(overrides: Partial<StockProduct> = {}): StockProduct {
  return {
    id: 'prod-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-1',
    name: 'Luva cirúrgica M',
    description: null,
    unit: 'cx',
    currentQuantity: 10,
    minQuantity: 3,
    purchasePrice: 2500,
    supplier: null,
    expiresAt: null,
    notes: null,
    isActive: true,
    status: 'ACTIVE',
    category: { id: 'cat-1', name: 'Luvas', color: '#10B981' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const defaultProductsResponse = { data: [makeProduct()], total: 1, page: 1, limit: 20 }

function setupDefaultMocks() {
  vi.mocked(getStockSummary).mockResolvedValue(makeSummary())
  vi.mocked(listStockCategories).mockResolvedValue([makeCategory()])
  vi.mocked(listStockProducts).mockResolvedValue(defaultProductsResponse)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useInventoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Initial load ──────────────────────────────────────────────────────────

  it('fetches summary, categories, and products in parallel on mount', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getStockSummary).toHaveBeenCalledTimes(1)
    expect(listStockCategories).toHaveBeenCalledTimes(1)
    expect(listStockProducts).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it('populates summary, categories, and products after initial load', async () => {
    const summary = makeSummary({ totalActive: 7, lowStock: 1 })
    const category = makeCategory({ name: 'Anestésicos' })
    const product = makeProduct({ name: 'Lidocaína 2%' })

    vi.mocked(getStockSummary).mockResolvedValue(summary)
    vi.mocked(listStockCategories).mockResolvedValue([category])
    vi.mocked(listStockProducts).mockResolvedValue({
      data: [product],
      total: 1,
      page: 1,
      limit: 20,
    })

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.summary).toEqual(summary)
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0].name).toBe('Anestésicos')
    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].name).toBe('Lidocaína 2%')
    expect(result.current.total).toBe(1)
  })

  it('sets error and clears planBlocked when load fails with a non-403 error', async () => {
    vi.mocked(getStockSummary).mockRejectedValue(new ApiError('Servidor indisponível.', 500, null))
    vi.mocked(listStockCategories).mockResolvedValue([])
    vi.mocked(listStockProducts).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Servidor indisponível.')
    expect(result.current.planBlocked).toBe(false)
  })

  // ── Plan blocking (403) ───────────────────────────────────────────────────

  it('sets planBlocked=true and keeps error=null when load receives HTTP 403', async () => {
    vi.mocked(getStockSummary).mockRejectedValue(new ApiError('Plano insuficiente.', 403, null))
    vi.mocked(listStockCategories).mockResolvedValue([])
    vi.mocked(listStockProducts).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.planBlocked).toBe(true)
    expect(result.current.error).toBeNull()
  })

  // ── handleRetry ───────────────────────────────────────────────────────────

  it('handleRetry triggers a fresh fetch of summary, categories, and products', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callsBefore = vi.mocked(getStockSummary).mock.calls.length

    act(() => result.current.handleRetry())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(vi.mocked(getStockSummary).mock.calls.length).toBeGreaterThan(callsBefore)
    expect(listStockCategories).toHaveBeenCalledTimes(2)
    expect(listStockProducts).toHaveBeenCalledTimes(2)
  })

  it('clears planBlocked on a successful retry after a 403', async () => {
    // First load → 403
    vi.mocked(getStockSummary).mockRejectedValueOnce(new ApiError('Plano insuficiente.', 403, null))
    vi.mocked(listStockCategories).mockResolvedValue([makeCategory()])
    vi.mocked(listStockProducts).mockResolvedValue(defaultProductsResponse)

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.planBlocked).toBe(true)

    // Retry → succeeds
    vi.mocked(getStockSummary).mockResolvedValueOnce(makeSummary())

    act(() => result.current.handleRetry())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.planBlocked).toBe(false)
    expect(result.current.summary).toEqual(makeSummary())
  })

  it('clears error state when retry succeeds after a previous non-403 failure', async () => {
    // First load → generic error
    vi.mocked(getStockSummary).mockRejectedValueOnce(
      new ApiError('Servidor indisponível.', 500, null),
    )
    vi.mocked(listStockCategories).mockResolvedValue([])
    vi.mocked(listStockProducts).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeTruthy()

    // Retry → succeeds
    vi.mocked(getStockSummary).mockResolvedValueOnce(makeSummary())
    vi.mocked(listStockCategories).mockResolvedValue([makeCategory()])
    vi.mocked(listStockProducts).mockResolvedValue(defaultProductsResponse)

    act(() => result.current.handleRetry())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.summary).toEqual(makeSummary())
  })
})
