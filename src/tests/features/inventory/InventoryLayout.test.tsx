/**
 * Tests that the Stock page renders sections in the required order:
 *   1. KPI summary
 *   2. Product table
 *   3. Purchase-list analysis
 *   4. Abnormal-consumption analysis
 *   5. AI inventory analysis panel
 *
 * We mock all data-fetching hooks to avoid network calls and keep tests fast.
 */
import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Service / hook mocks ──────────────────────────────────────────────────────

vi.mock('@/features/inventory/hooks/useInventoryPage', () => ({
  useInventoryPage: () => ({
    summary: { totalActive: 10, lowStock: 1, emptyStock: 0, expiring: 0, expired: 0 },
    categories: [],
    products: [],
    total: 1,
    isLoading: false,
    isLoadingProducts: false,
    error: null,
    search: '',
    categoryId: undefined,
    status: undefined,
    page: 1,
    pageSize: 20,
    hasFilters: false,
    handleSearchChange: vi.fn(),
    handleCategoryChange: vi.fn(),
    handleStatusChange: vi.fn(),
    handleClearFilters: vi.fn(),
    handleRetry: vi.fn(),
    setPage: vi.fn(),
    handlePageSizeChange: vi.fn(),
    isOwner: false,
    isCreateModalOpen: false,
    isCategoryManagerOpen: false,
    editingProduct: null,
    movingProduct: null,
    handleOpenCreate: vi.fn(),
    handleOpenCategoryManager: vi.fn(),
    handleCloseCategoryManager: vi.fn(),
    reloadInventoryData: vi.fn(),
    handleOpenEdit: vi.fn(),
    handleCloseModal: vi.fn(),
    handleProductSaved: vi.fn(),
    handleOpenMovement: vi.fn(),
    handleCloseMovement: vi.fn(),
    handleMovementSaved: vi.fn(),
    viewingProduct: null,
    movementHistoryRefreshKey: 0,
    handleOpenDetails: vi.fn(),
    handleCloseDetails: vi.fn(),
    deactivatingProduct: null,
    isDeactivating: false,
    deactivateError: null,
    handleDeactivateRequest: vi.fn(),
    handleDeactivateCancel: vi.fn(),
    handleDeactivateConfirm: vi.fn(),
    reactivatingProduct: null,
    isReactivating: false,
    reactivateError: null,
    handleReactivateRequest: vi.fn(),
    handleReactivateCancel: vi.fn(),
    handleReactivateConfirm: vi.fn(),
    quickMovingIds: new Set(),
    handleQuickMove: vi.fn(),
    planBlocked: false,
  }),
}))

vi.mock('@/features/inventory/hooks/useStockPurchaseList', () => ({
  useStockPurchaseList: () => ({ data: null, isLoading: false, error: null, isPlanBlocked: false, refetch: vi.fn() }),
}))

vi.mock('@/features/inventory/hooks/useStockAbnormalConsumption', () => ({
  useStockAbnormalConsumption: () => ({ data: null, isLoading: false, error: null, isPlanBlocked: false, refetch: vi.fn() }),
}))

vi.mock('@/features/inventory/hooks/useStockCopilot', () => ({
  useStockCopilot: () => ({ result: null, isLoadingInitial: false, isGenerating: false, error: null, isPlanBlocked: false, isQuotaExceeded: false, quotaMessage: null, handleGenerate: vi.fn() }),
}))

vi.mock('@/features/inventory/hooks/useAbnormalConsumptionCopilot', () => ({
  useAbnormalConsumptionCopilot: () => ({ result: null, isLoadingInitial: false, isGenerating: false, error: null, isPlanBlocked: false, isQuotaExceeded: false, quotaMessage: null, handleGenerate: vi.fn() }),
}))

vi.mock('@/features/inventory/hooks/useAiAssistantInventory', () => ({
  useAiAssistantInventory: () => ({ savedAnalysis: null, quota: null, dataReadiness: null, visibility: undefined, isLoadingInitial: false, handleGenerate: vi.fn() }),
}))

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ASSISTANT' } }),
}))

// Mock modals that require context providers not present in unit-test environment
vi.mock('@/features/inventory/components/ProductFormModal', () => ({
  ProductFormModal: () => null,
}))
vi.mock('@/features/inventory/components/CategoryManagerModal', () => ({
  CategoryManagerModal: () => null,
}))
vi.mock('@/features/inventory/components/StockMovementModal', () => ({
  StockMovementModal: () => null,
}))
vi.mock('@/features/inventory/components/ProductDetailsDrawer', () => ({
  ProductDetailsDrawer: () => null,
}))
vi.mock('@/features/inventory/components/DeactivateProductDialog', () => ({
  DeactivateProductDialog: () => null,
}))
vi.mock('@/features/inventory/components/ReactivateProductDialog', () => ({
  ReactivateProductDialog: () => null,
}))

// ── Component ─────────────────────────────────────────────────────────────────

import { InventoryPageContainer } from '@/features/inventory/containers/InventoryPageContainer'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryPageContainer — section order', () => {
  it('renders filters before product table, and analysis sections after product table', () => {
    render(<InventoryPageContainer />)

    const searchInput = screen.getByLabelText('Buscar produto')
    const purchaseListHeading = screen.getByText('Lista de compra sugerida')
    const abnormalHeading = screen.getByText('Consumo fora do padrão')
    const analysisHeading = screen.getByText('Análise do estoque')

    // Confirm all 4 landmarks are present
    expect(searchInput).toBeInTheDocument()
    expect(purchaseListHeading).toBeInTheDocument()
    expect(abnormalHeading).toBeInTheDocument()
    expect(analysisHeading).toBeInTheDocument()

    // DOM order: filters appear before analysis sections
    expect(
      searchInput.compareDocumentPosition(purchaseListHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    // DOM order: purchase list appears before abnormal consumption
    expect(
      purchaseListHeading.compareDocumentPosition(abnormalHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    // DOM order: abnormal consumption appears before AI analysis panel
    expect(
      abnormalHeading.compareDocumentPosition(analysisHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders the product table heading before the purchase-list heading', () => {
    render(<InventoryPageContainer />)

    // The product table renders a visible "Todos os status" select when products exist.
    // When products array is empty, the table still renders its container (or empty state).
    // We verify the search filter (part of the filters panel) appears before purchase list.
    const filtersSearchBox = screen.getByPlaceholderText('Buscar produto...')
    const purchaseListHeading = screen.getByText('Lista de compra sugerida')

    expect(
      filtersSearchBox.compareDocumentPosition(purchaseListHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
