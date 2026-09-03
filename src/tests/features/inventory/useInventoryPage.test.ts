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
  createStockMovement,
  deleteStockProduct,
  getStockProduct,
  getStockSummary,
  listStockCategories,
  listStockProducts,
  reactivateStockProduct,
} from '@/features/inventory/services/inventory.service'

// ── Auth mock ─────────────────────────────────────────────────────────────────

let mockRole: 'OWNER' | 'ASSISTANT' = 'OWNER'
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: mockRole } }),
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
    mockRole = 'OWNER'
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

  // ── Filters ───────────────────────────────────────────────────────────────

  it('debounces search changes and resets to page 1', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.useFakeTimers()
    try {
      act(() => result.current.setPage(3))
      act(() => result.current.handleSearchChange('luva'))

      expect(result.current.search).toBe('luva')
      expect(result.current.page).toBe(1)
      expect(listStockProducts).not.toHaveBeenCalledWith(
        expect.objectContaining({ search: 'luva' }),
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400)
      })

      expect(listStockProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'luva', page: 1 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('clears a pending debounced search on unmount without throwing', async () => {
    setupDefaultMocks()
    const { result, unmount } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.useFakeTimers()
    try {
      act(() => result.current.handleSearchChange('x'))
      expect(() => unmount()).not.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })

  it('reloads products when the category filter changes and resets page', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(2))
    act(() => result.current.handleCategoryChange('cat-2'))

    expect(result.current.categoryId).toBe('cat-2')
    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(listStockProducts).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-2', page: 1 }),
      ),
    )
  })

  it('reloads products when the status filter changes and resets page', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleStatusChange('LOW'))

    expect(result.current.status).toBe('LOW')
    await waitFor(() =>
      expect(listStockProducts).toHaveBeenCalledWith(expect.objectContaining({ status: 'LOW' })),
    )
  })

  it('shows a filter error via the alert when reloading products fails', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(listStockProducts).mockRejectedValueOnce(new ApiError('Falha ao filtrar.', 500, null))
    act(() => result.current.handleStatusChange('EXPIRED'))

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao filtrar', description: 'Falha ao filtrar.' }),
      ),
    )
  })

  it('shows a generic filter error when the rejection is not an ApiError', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(listStockProducts).mockRejectedValueOnce(new Error('boom'))
    act(() => result.current.handleStatusChange('EXPIRED'))

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Erro ao filtrar produtos.' }),
      ),
    )
  })

  it('handleClearFilters resets search, category, status, and page', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleCategoryChange('cat-9'))
    act(() => result.current.handleStatusChange('LOW'))
    act(() => result.current.setPage(3))
    act(() => result.current.handleClearFilters())

    expect(result.current.search).toBe('')
    expect(result.current.categoryId).toBeUndefined()
    expect(result.current.status).toBeUndefined()
    expect(result.current.page).toBe(1)
    expect(result.current.hasFilters).toBe(false)
  })

  it('handlePageSizeChange updates pageSize and resets page to 1', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPage(2))
    act(() => result.current.handlePageSizeChange(50))

    expect(result.current.pageSize).toBe(50)
    expect(result.current.page).toBe(1)
  })

  it('hasFilters reflects any active search/category/status', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasFilters).toBe(false)

    act(() => result.current.handleCategoryChange('cat-1'))
    expect(result.current.hasFilters).toBe(true)
  })

  // ── Create / edit modal ───────────────────────────────────────────────────

  it('opens and closes the create/edit product modal', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenCreate())
    expect(result.current.isCreateModalOpen).toBe(true)

    const product = makeProduct()
    act(() => result.current.handleOpenEdit(product))
    expect(result.current.editingProduct).toEqual(product)

    act(() => result.current.handleCloseModal())
    expect(result.current.isCreateModalOpen).toBe(false)
    expect(result.current.editingProduct).toBeNull()
  })

  it('handleProductSaved reloads summary and products', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    vi.mocked(getStockSummary).mockClear()

    act(() => result.current.handleProductSaved())

    await waitFor(() => expect(getStockSummary).toHaveBeenCalled())
  })

  // ── Category manager (OWNER-gated) ────────────────────────────────────────

  it('opens the category manager for an OWNER', async () => {
    mockRole = 'OWNER'
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenCategoryManager())
    expect(result.current.isCategoryManagerOpen).toBe(true)

    act(() => result.current.handleCloseCategoryManager())
    expect(result.current.isCategoryManagerOpen).toBe(false)
  })

  it('does not open the category manager for a non-OWNER', async () => {
    mockRole = 'ASSISTANT'
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenCategoryManager())
    expect(result.current.isCategoryManagerOpen).toBe(false)
  })

  it('reloadInventoryData refreshes summary+categories, and products only when requested', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    vi.mocked(listStockProducts).mockClear()

    act(() => result.current.reloadInventoryData())
    await waitFor(() => expect(getStockSummary).toHaveBeenCalledTimes(2))
    expect(listStockProducts).not.toHaveBeenCalled()

    act(() => result.current.reloadInventoryData({ refreshProducts: true }))
    await waitFor(() => expect(listStockProducts).toHaveBeenCalled())
  })

  it('shows an error alert when reloadInventoryData fails', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(getStockSummary).mockRejectedValueOnce(new Error('fail'))
    act(() => result.current.reloadInventoryData())

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Erro ao recarregar categorias.' }),
      ),
    )
  })

  // ── Movement modal / details ──────────────────────────────────────────────

  it('opens/closes the movement modal and the details drawer', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const product = makeProduct()
    act(() => result.current.handleOpenMovement(product))
    expect(result.current.movingProduct).toEqual(product)
    act(() => result.current.handleCloseMovement())
    expect(result.current.movingProduct).toBeNull()

    act(() => result.current.handleOpenDetails(product))
    expect(result.current.viewingProduct).toEqual(product)
    act(() => result.current.handleCloseDetails())
    expect(result.current.viewingProduct).toBeNull()
  })

  it('handleMovementSaved reloads and refreshes the viewed product when it matches', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(getStockProduct).mockResolvedValue(product)

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenMovement(product))
    act(() => result.current.handleOpenDetails(product))
    const refreshKeyBefore = result.current.movementHistoryRefreshKey

    act(() => result.current.handleMovementSaved())

    await waitFor(() => expect(getStockProduct).toHaveBeenCalledWith(product.id))
    expect(result.current.movementHistoryRefreshKey).toBeGreaterThan(refreshKeyBefore)
  })

  it('handleMovementSaved shows an alert when refetching the viewed product fails', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(getStockProduct).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenMovement(product))
    act(() => result.current.handleOpenDetails(product))
    act(() => result.current.handleMovementSaved())

    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Erro ao recarregar produto.' }),
      ),
    )
  })

  it('handleMovementSaved does not refetch when no product is being viewed', async () => {
    setupDefaultMocks()
    const product = makeProduct()

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenMovement(product))
    act(() => result.current.handleMovementSaved())

    expect(getStockProduct).not.toHaveBeenCalled()
  })

  // ── Deactivate ────────────────────────────────────────────────────────────

  it('deactivates a product successfully', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(deleteStockProduct).mockResolvedValue(undefined)

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDeactivateRequest(product))
    expect(result.current.deactivatingProduct).toEqual(product)

    await act(async () => {
      await result.current.handleDeactivateConfirm()
    })

    expect(deleteStockProduct).toHaveBeenCalledWith(product.id)
    expect(result.current.deactivatingProduct).toBeNull()
    expect(result.current.isDeactivating).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Produto desativado com sucesso.', tone: 'success' }),
    )
  })

  it('sets deactivateError on failure and keeps the dialog open', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(deleteStockProduct).mockRejectedValue(new ApiError('Não permitido.', 403, null))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDeactivateRequest(product))
    await act(async () => {
      await result.current.handleDeactivateConfirm()
    })

    expect(result.current.deactivateError).toBe('Não permitido.')
    expect(result.current.deactivatingProduct).toEqual(product)
  })

  it('shows a generic deactivateError when the rejection is not an ApiError', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(deleteStockProduct).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDeactivateRequest(product))
    await act(async () => {
      await result.current.handleDeactivateConfirm()
    })

    expect(result.current.deactivateError).toBe(
      'Não foi possível desativar o produto. Tente novamente.',
    )
  })

  it('handleDeactivateConfirm is a no-op when no product is pending', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDeactivateConfirm()
    })

    expect(deleteStockProduct).not.toHaveBeenCalled()
  })

  it('handleDeactivateCancel clears the pending product and error', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleDeactivateRequest(product))
    act(() => result.current.handleDeactivateCancel())

    expect(result.current.deactivatingProduct).toBeNull()
    expect(result.current.deactivateError).toBeNull()
  })

  // ── Reactivate ────────────────────────────────────────────────────────────

  it('reactivates a product successfully and updates the viewed product if matching', async () => {
    setupDefaultMocks()
    const product = makeProduct({ status: 'INACTIVE' })
    const updated = { ...product, status: 'ACTIVE' as const }
    vi.mocked(reactivateStockProduct).mockResolvedValue(updated)

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenDetails(product))
    act(() => result.current.handleReactivateRequest(product))

    await act(async () => {
      await result.current.handleReactivateConfirm()
    })

    expect(reactivateStockProduct).toHaveBeenCalledWith(product.id)
    expect(result.current.reactivatingProduct).toBeNull()
    expect(result.current.viewingProduct).toEqual(updated)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Produto reativado com sucesso.' }),
    )
  })

  it('sets reactivateError on failure', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(reactivateStockProduct).mockRejectedValue(new ApiError('Erro custom.', 500, null))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleReactivateRequest(product))
    await act(async () => {
      await result.current.handleReactivateConfirm()
    })

    expect(result.current.reactivateError).toBe('Erro custom.')
  })

  it('shows a generic reactivateError when the rejection is not an ApiError', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(reactivateStockProduct).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleReactivateRequest(product))
    await act(async () => {
      await result.current.handleReactivateConfirm()
    })

    expect(result.current.reactivateError).toBe(
      'Não foi possível reativar o produto. Tente novamente.',
    )
  })

  it('handleReactivateConfirm is a no-op when no product is pending', async () => {
    setupDefaultMocks()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleReactivateConfirm()
    })

    expect(reactivateStockProduct).not.toHaveBeenCalled()
  })

  it('handleReactivateCancel clears the pending product and error', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleReactivateRequest(product))
    act(() => result.current.handleReactivateCancel())

    expect(result.current.reactivatingProduct).toBeNull()
    expect(result.current.reactivateError).toBeNull()
  })

  // ── Quick move ────────────────────────────────────────────────────────────

  it('performs a quick "in" movement successfully', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(createStockMovement).mockResolvedValue(
      undefined as unknown as ReturnType<typeof createStockMovement> extends Promise<infer T>
        ? T
        : never,
    )

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleQuickMove(product, 'in')
    })

    expect(createStockMovement).toHaveBeenCalledWith(
      expect.objectContaining({ productId: product.id, type: 'IN', quantity: 1 }),
    )
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Entrada rápida registrada com sucesso.' }),
    )
    expect(result.current.quickMovingIds.has(product.id)).toBe(false)
  })

  it('performs a quick "out" movement and refreshes the viewed product', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(createStockMovement).mockResolvedValue(
      undefined as unknown as ReturnType<typeof createStockMovement> extends Promise<infer T>
        ? T
        : never,
    )
    vi.mocked(getStockProduct).mockResolvedValue(product)

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handleOpenDetails(product))

    await act(async () => {
      await result.current.handleQuickMove(product, 'out')
    })

    expect(createStockMovement).toHaveBeenCalledWith(expect.objectContaining({ type: 'OUT' }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Saída rápida registrada com sucesso.' }),
    )
  })

  it('shows an error alert when a quick move fails', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(createStockMovement).mockRejectedValue(
      new ApiError('Estoque insuficiente.', 400, null),
    )

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleQuickMove(product, 'out')
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro na movimentação rápida',
        description: 'Estoque insuficiente.',
      }),
    )
    expect(result.current.quickMovingIds.has(product.id)).toBe(false)
  })

  it('shows a generic quick-move error when the rejection is not an ApiError', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    vi.mocked(createStockMovement).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleQuickMove(product, 'out')
    })

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Não foi possível registrar a movimentação rápida.',
      }),
    )
  })

  it('ignores a second concurrent quick move on the same product', async () => {
    setupDefaultMocks()
    const product = makeProduct()
    let resolveMovement: () => void = () => {}
    vi.mocked(createStockMovement).mockReturnValue(
      new Promise((resolve) => {
        resolveMovement = () => resolve(undefined as never)
      }),
    )

    const { result } = renderHook(() => useInventoryPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let firstCall!: Promise<void>
    act(() => {
      firstCall = result.current.handleQuickMove(product, 'in')
    })
    expect(result.current.quickMovingIds.has(product.id)).toBe(true)

    await act(async () => {
      await result.current.handleQuickMove(product, 'in')
    })

    expect(createStockMovement).toHaveBeenCalledTimes(1)

    resolveMovement()
    await act(async () => {
      await firstCall
    })
  })
})
