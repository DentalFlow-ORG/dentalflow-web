import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

// ── Hook mock ────────────────────────────────────────────────────────────────

const mockUseInventoryPage = vi.fn()
vi.mock('@/features/inventory/hooks/useInventoryPage', () => ({
  useInventoryPage: () => mockUseInventoryPage(),
}))

// ── Radix Select stub (jsdom-unfriendly) ────────────────────────────────────

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

// ── Child component stubs ───────────────────────────────────────────────────

vi.mock('@/features/inventory/components/CategoryManagerModal', () => ({
  CategoryManagerModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="category-manager-modal" /> : null,
}))
vi.mock('@/features/inventory/components/InventoryAnalysisPanel', () => ({
  InventoryAnalysisPanel: () => <div data-testid="analysis-panel" />,
}))
vi.mock('@/features/inventory/components/InventoryKpiGrid', () => ({
  InventoryKpiGrid: () => <div data-testid="kpi-grid" />,
}))
vi.mock('@/features/inventory/components/InventoryProductTable', () => ({
  InventoryProductTable: () => <div data-testid="product-table" />,
}))
vi.mock('@/features/inventory/components/ProductDetailsDrawer', () => ({
  ProductDetailsDrawer: ({
    product,
    onEdit,
    onDeactivate,
  }: {
    product: { id: string } | null
    onEdit: (p: { id: string }) => void
    onDeactivate: (p: { id: string }) => void
  }) =>
    product ? (
      <div data-testid="product-drawer">
        <button type="button" onClick={() => onEdit(product)}>
          drawer-edit
        </button>
        <button type="button" onClick={() => onDeactivate(product)}>
          drawer-deactivate
        </button>
      </div>
    ) : null,
}))
vi.mock('@/features/inventory/components/ProductFormModal', () => ({
  ProductFormModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="product-form-modal" /> : null,
}))
vi.mock('@/features/inventory/components/StockAbnormalConsumptionSection', () => ({
  StockAbnormalConsumptionSection: () => <div data-testid="abnormal-consumption" />,
}))
vi.mock('@/features/inventory/components/StockMovementModal', () => ({
  StockMovementModal: ({ product }: { product: { id: string } | null }) =>
    product ? <div data-testid="movement-modal" /> : null,
}))
vi.mock('@/features/inventory/components/StockPurchaseListSection', () => ({
  StockPurchaseListSection: () => <div data-testid="purchase-list" />,
}))

import { InventoryPageContainer } from '@/features/inventory/containers/InventoryPageContainer'
import type { StockSummary } from '@/features/inventory/types/inventory.types'

function makeSummary(overrides: Partial<StockSummary> = {}): StockSummary {
  return {
    totalActive: 10,
    lowStock: 0,
    emptyStock: 0,
    expiring: 0,
    expired: 0,
    inactive: 0,
    estimatedValue: 50000,
    totalCategories: 2,
    ...overrides,
  }
}

function makeDefaultState(overrides: Record<string, unknown> = {}) {
  return {
    summary: makeSummary(),
    categories: [{ id: 'cat-1', name: 'Luvas' }],
    products: [{ id: 'p1', name: 'Luva M' }],
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
    isOwner: true,
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
    quickMovingIds: new Set<string>(),
    handleQuickMove: vi.fn(),
    planBlocked: false,
    ...overrides,
  }
}

describe('InventoryPageContainer', () => {
  beforeEach(() => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState())
  })

  it('shows the plan-upgrade notice when planBlocked is true, and nothing else', () => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ planBlocked: true }))
    render(<InventoryPageContainer />)
    expect(screen.getByRole('heading', { name: 'Controle de Estoque' })).toBeInTheDocument()
    expect(screen.queryByTestId('product-table')).not.toBeInTheDocument()
  })

  it('renders the header, filters, and product table by default', () => {
    render(<InventoryPageContainer />)
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar produto...')).toBeInTheDocument()
    expect(screen.getByTestId('product-table')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument()
    expect(screen.getByTestId('purchase-list')).toBeInTheDocument()
    expect(screen.getByTestId('abnormal-consumption')).toBeInTheDocument()
    expect(screen.getByTestId('analysis-panel')).toBeInTheDocument()
  })

  it('shows "Gerenciar categorias" only for an owner', () => {
    const { rerender } = render(<InventoryPageContainer />)
    expect(screen.getByRole('button', { name: /gerenciar categorias/i })).toBeInTheDocument()

    mockUseInventoryPage.mockReturnValue(makeDefaultState({ isOwner: false }))
    rerender(<InventoryPageContainer />)
    expect(screen.queryByRole('button', { name: /gerenciar categorias/i })).not.toBeInTheDocument()
  })

  it('calls handleSearchChange when typing in the search field', async () => {
    const handleSearchChange = vi.fn()
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ handleSearchChange }))
    render(<InventoryPageContainer />)
    await userEvent.type(screen.getByPlaceholderText('Buscar produto...'), 'a')
    expect(handleSearchChange).toHaveBeenCalled()
  })

  it('calls handleCategoryChange with undefined when "all" is selected', async () => {
    const handleCategoryChange = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ handleCategoryChange, categoryId: 'cat-1' }),
    )
    render(<InventoryPageContainer />)
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'Todas as categorias')
    expect(handleCategoryChange).toHaveBeenCalledWith(undefined)
    await userEvent.selectOptions(selects[0], 'Luvas')
    expect(handleCategoryChange).toHaveBeenLastCalledWith('cat-1')
  })

  it('calls handleStatusChange with the selected status', async () => {
    const handleStatusChange = vi.fn()
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ handleStatusChange }))
    render(<InventoryPageContainer />)
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], selects[1].querySelectorAll('option')[1])
    expect(handleStatusChange).toHaveBeenCalledWith('ACTIVE')
    await userEvent.selectOptions(selects[1], 'all')
    expect(handleStatusChange).toHaveBeenLastCalledWith(undefined)
  })

  it('does not render attention chips when there is no summary', () => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ summary: null }))
    render(<InventoryPageContainer />)
    expect(screen.queryByRole('group', { name: /filtros rápidos/i })).not.toBeInTheDocument()
  })

  it('does not render attention chips when all counts are zero', () => {
    render(<InventoryPageContainer />)
    expect(screen.queryByRole('group', { name: /filtros rápidos/i })).not.toBeInTheDocument()
  })

  it('renders attention chips for non-zero counts and toggles the filter on click', async () => {
    const handleStatusChange = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({
        summary: makeSummary({ lowStock: 3, expired: 1 }),
        handleStatusChange,
      }),
    )
    render(<InventoryPageContainer />)
    const chip = screen.getByRole('button', { name: /filtrar por baixo estoque/i })
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(chip)
    expect(handleStatusChange).toHaveBeenCalledWith('LOW')
  })

  it('toggles an active chip off when clicked again', async () => {
    const handleStatusChange = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({
        summary: makeSummary({ lowStock: 3 }),
        status: 'LOW',
        handleStatusChange,
      }),
    )
    render(<InventoryPageContainer />)
    const chip = screen.getByRole('button', { name: /filtrar por baixo estoque/i })
    expect(chip).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(chip)
    expect(handleStatusChange).toHaveBeenCalledWith(undefined)
  })

  it('shows "Limpar filtros" only when hasFilters is true, and calls handleClearFilters', async () => {
    const handleClearFilters = vi.fn()
    const { rerender } = render(<InventoryPageContainer />)
    expect(screen.queryByRole('button', { name: /limpar filtros/i })).not.toBeInTheDocument()

    mockUseInventoryPage.mockReturnValue(makeDefaultState({ hasFilters: true, handleClearFilters }))
    rerender(<InventoryPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))
    expect(handleClearFilters).toHaveBeenCalledOnce()
  })

  it('shows the loading state via ListPageShell', () => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ isLoading: true }))
    render(<InventoryPageContainer />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando estoque...')
  })

  it('shows the empty state and creates a product from it when there are no products at all', async () => {
    const handleOpenCreate = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ total: 0, products: [], hasFilters: false, handleOpenCreate }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByText('Nenhum produto cadastrado')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button', { name: /novo produto/i })
    await userEvent.click(buttons[buttons.length - 1])
    expect(handleOpenCreate).toHaveBeenCalled()
  })

  it('shows the filtered-empty-state when filters produce no results', () => {
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ products: [], hasFilters: true, total: 0 }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
    expect(screen.queryByTestId('product-table')).not.toBeInTheDocument()
  })

  it('shows the product table (not the filtered-empty-state) while products are still loading', () => {
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ products: [], hasFilters: true, isLoadingProducts: true }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('product-table')).toBeInTheDocument()
  })

  it('opens the product-form modal when isCreateModalOpen is true', () => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ isCreateModalOpen: true }))
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('product-form-modal')).toBeInTheDocument()
  })

  it('opens the product-form modal when editingProduct is set', () => {
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ editingProduct: { id: 'p1', name: 'Luva M' } }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('product-form-modal')).toBeInTheDocument()
  })

  it('opens the category manager modal when isCategoryManagerOpen is true', () => {
    mockUseInventoryPage.mockReturnValue(makeDefaultState({ isCategoryManagerOpen: true }))
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('category-manager-modal')).toBeInTheDocument()
  })

  it('opens the movement modal when movingProduct is set', () => {
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ movingProduct: { id: 'p1', name: 'Luva M' } }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('movement-modal')).toBeInTheDocument()
  })

  it('opens the product details drawer when viewingProduct is set', () => {
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({ viewingProduct: { id: 'p1', name: 'Luva M' } }),
    )
    render(<InventoryPageContainer />)
    expect(screen.getByTestId('product-drawer')).toBeInTheDocument()
  })

  it('closes the details drawer and opens edit when editing from the drawer', async () => {
    const handleCloseDetails = vi.fn()
    const handleOpenEdit = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({
        viewingProduct: { id: 'p1', name: 'Luva M' },
        handleCloseDetails,
        handleOpenEdit,
      }),
    )
    render(<InventoryPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'drawer-edit' }))
    expect(handleCloseDetails).toHaveBeenCalledOnce()
    expect(handleOpenEdit).toHaveBeenCalledWith({ id: 'p1', name: 'Luva M' })
  })

  it('closes the details drawer and requests deactivation from the drawer', async () => {
    const handleCloseDetails = vi.fn()
    const handleDeactivateRequest = vi.fn()
    mockUseInventoryPage.mockReturnValue(
      makeDefaultState({
        viewingProduct: { id: 'p1', name: 'Luva M' },
        handleCloseDetails,
        handleDeactivateRequest,
      }),
    )
    render(<InventoryPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'drawer-deactivate' }))
    expect(handleCloseDetails).toHaveBeenCalledOnce()
    expect(handleDeactivateRequest).toHaveBeenCalledWith({ id: 'p1', name: 'Luva M' })
  })

  describe('deactivate confirmation (shared ConfirmDialog)', () => {
    const product = { id: 'p1', name: 'Luva M' }

    it('names the product and explains that history is kept', () => {
      mockUseInventoryPage.mockReturnValue(makeDefaultState({ deactivatingProduct: product }))
      render(<InventoryPageContainer />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveTextContent('Desativar produto')
      expect(dialog).toHaveTextContent('Luva M')
      expect(dialog).toHaveTextContent('o histórico será preservado')
    })

    it('confirms and cancels through the page handlers', async () => {
      const handleDeactivateConfirm = vi.fn()
      const handleDeactivateCancel = vi.fn()
      mockUseInventoryPage.mockReturnValue(
        makeDefaultState({
          deactivatingProduct: product,
          handleDeactivateConfirm,
          handleDeactivateCancel,
        }),
      )
      render(<InventoryPageContainer />)
      await userEvent.click(screen.getByRole('button', { name: 'Desativar produto' }))
      expect(handleDeactivateConfirm).toHaveBeenCalledOnce()
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      expect(handleDeactivateCancel).toHaveBeenCalledOnce()
    })

    it('disables both actions while deactivating and ignores Escape', async () => {
      const handleDeactivateCancel = vi.fn()
      mockUseInventoryPage.mockReturnValue(
        makeDefaultState({
          deactivatingProduct: product,
          isDeactivating: true,
          handleDeactivateCancel,
        }),
      )
      render(<InventoryPageContainer />)
      expect(screen.getByRole('button', { name: /Aguarde/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      await userEvent.keyboard('{Escape}')
      expect(handleDeactivateCancel).not.toHaveBeenCalled()
    })

    it('keeps the dialog open with the error after a failure', () => {
      mockUseInventoryPage.mockReturnValue(
        makeDefaultState({
          deactivatingProduct: product,
          deactivateError: 'Não foi possível desativar o produto.',
        }),
      )
      render(<InventoryPageContainer />)
      expect(screen.getByRole('dialog')).toHaveTextContent('Não foi possível desativar o produto.')
    })

    it('does not render the dialog when no product is selected', () => {
      render(<InventoryPageContainer />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('reactivate confirmation (shared ConfirmDialog)', () => {
    const product = { id: 'p1', name: 'Luva M' }

    it('names the product and confirms through the page handler', async () => {
      const handleReactivateConfirm = vi.fn()
      mockUseInventoryPage.mockReturnValue(
        makeDefaultState({ reactivatingProduct: product, handleReactivateConfirm }),
      )
      render(<InventoryPageContainer />)
      expect(screen.getByRole('dialog')).toHaveTextContent('Luva M')
      await userEvent.click(screen.getByRole('button', { name: 'Reativar produto' }))
      expect(handleReactivateConfirm).toHaveBeenCalledOnce()
    })

    it('shows the pending state and the failure message', () => {
      mockUseInventoryPage.mockReturnValue(
        makeDefaultState({
          reactivatingProduct: product,
          isReactivating: true,
          reactivateError: 'Falha ao reativar.',
        }),
      )
      render(<InventoryPageContainer />)
      expect(screen.getByRole('button', { name: /Aguarde/ })).toBeDisabled()
      expect(screen.getByRole('dialog')).toHaveTextContent('Falha ao reativar.')
    })
  })
})
