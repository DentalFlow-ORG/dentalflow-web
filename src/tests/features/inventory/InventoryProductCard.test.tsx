import { render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { InventoryProductCard } from '@/features/inventory/components/InventoryProductCard'
import type { StockProduct } from '@/features/inventory/types/inventory.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildProduct(overrides: Partial<StockProduct> = {}): StockProduct {
  return {
    id: 'prod-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-1',
    name: 'Luva cirúrgica',
    description: null,
    unit: 'cx',
    currentQuantity: 10,
    minQuantity: 2,
    purchasePrice: null,
    supplier: null,
    expiresAt: null,
    notes: null,
    isActive: true,
    status: 'ACTIVE',
    category: { id: 'cat-1', name: 'Descartáveis', color: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function defaultHandlers() {
  return {
    onViewDetails: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    onDeactivate: vi.fn(),
    onReactivate: vi.fn(),
    quickMovingIds: new Set<string>(),
    onQuickMove: vi.fn(),
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Primary action ─────────────────────────────────────────────────────────

  it('renders "Ver detalhes" as the primary visible action', () => {
    render(<InventoryProductCard product={buildProduct()} {...defaultHandlers()} />)

    expect(screen.getByRole('button', { name: /Ver detalhes/i })).toBeInTheDocument()
  })

  it('calls onViewDetails when "Ver detalhes" is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Ver detalhes de Luva cirúrgica/i }))

    expect(handlers.onViewDetails).toHaveBeenCalledWith(product)
  })

  // ── Menu trigger ───────────────────────────────────────────────────────────

  it('renders the action menu trigger with an accessible label', () => {
    render(<InventoryProductCard product={buildProduct()} {...defaultHandlers()} />)

    expect(
      screen.getByRole('button', { name: /Mais ações para Luva cirúrgica/i }),
    ).toBeInTheDocument()
  })

  // ── Active product menu items ──────────────────────────────────────────────

  it('shows Editar in menu for active product', async () => {
    const user = userEvent.setup()
    render(<InventoryProductCard product={buildProduct()} {...defaultHandlers()} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('shows Movimentar in menu for active product', async () => {
    const user = userEvent.setup()
    render(<InventoryProductCard product={buildProduct()} {...defaultHandlers()} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.getByText('Movimentar')).toBeInTheDocument()
  })

  it('shows Desativar in menu for active product when onDeactivate is provided', async () => {
    const user = userEvent.setup()
    render(<InventoryProductCard product={buildProduct()} {...defaultHandlers()} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.getByText('Desativar')).toBeInTheDocument()
  })

  it('does not show Desativar when onDeactivate is not provided', async () => {
    const handlers = { ...defaultHandlers(), onDeactivate: undefined }
    const user = userEvent.setup()
    render(<InventoryProductCard product={buildProduct()} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.queryByText('Desativar')).not.toBeInTheDocument()
  })

  // ── Inactive product menu items ────────────────────────────────────────────

  it('shows Reativar in menu for inactive product when onReactivate is provided', async () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...defaultHandlers()} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.getByText('Reativar')).toBeInTheDocument()
  })

  it('does not show Editar or Movimentar for inactive product', async () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...defaultHandlers()} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))

    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
    expect(screen.queryByText('Movimentar')).not.toBeInTheDocument()
  })

  // ── Menu item callbacks ────────────────────────────────────────────────────

  it('calls onEdit when Editar menu item is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))
    await user.click(screen.getByText('Editar'))

    expect(handlers.onEdit).toHaveBeenCalledWith(product)
  })

  it('calls onMove when Movimentar menu item is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))
    await user.click(screen.getByText('Movimentar'))

    expect(handlers.onMove).toHaveBeenCalledWith(product)
  })

  it('calls onDeactivate when Desativar menu item is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))
    await user.click(screen.getByText('Desativar'))

    expect(handlers.onDeactivate).toHaveBeenCalledWith(product)
  })

  it('calls onReactivate when Reativar menu item is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Mais ações para/i }))
    await user.click(screen.getByText('Reativar'))

    expect(handlers.onReactivate).toHaveBeenCalledWith(product)
  })

  // ── Overflow safety ────────────────────────────────────────────────────────

  it('article root has overflow-hidden to contain child overflow on mobile', () => {
    const { container } = render(
      <InventoryProductCard product={buildProduct()} {...defaultHandlers()} />,
    )

    expect(container.querySelector('article.overflow-hidden')).toBeInTheDocument()
  })

  // ── Quick movement strip ───────────────────────────────────────────────────

  it('renders quick +1 and -1 buttons for active products', () => {
    const product = buildProduct()
    render(<InventoryProductCard product={product} {...defaultHandlers()} />)

    expect(
      screen.getByRole('button', { name: /Adicionar 1 unidade de Luva cirúrgica/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Remover 1 unidade de Luva cirúrgica/i }),
    ).toBeInTheDocument()
  })

  it('calls onQuickMove with "in" when +1 is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Adicionar 1 unidade/i }))

    expect(handlers.onQuickMove).toHaveBeenCalledWith(product, 'in')
  })

  it('calls onQuickMove with "out" when -1 is clicked', async () => {
    const handlers = defaultHandlers()
    const product = buildProduct({ currentQuantity: 5 })
    const user = userEvent.setup()
    render(<InventoryProductCard product={product} {...handlers} />)

    await user.click(screen.getByRole('button', { name: /Remover 1 unidade/i }))

    expect(handlers.onQuickMove).toHaveBeenCalledWith(product, 'out')
  })

  it('disables the -1 button when currentQuantity is 0', () => {
    const product = buildProduct({ currentQuantity: 0 })
    render(<InventoryProductCard product={product} {...defaultHandlers()} />)

    expect(
      screen.getByRole('button', { name: /Estoque insuficiente/i }),
    ).toBeDisabled()
  })

  it('shows a spinner for the product being moved', () => {
    const product = buildProduct()
    const quickMovingIds = new Set([product.id])
    const { container } = render(
      <InventoryProductCard product={product} {...defaultHandlers()} quickMovingIds={quickMovingIds} />,
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not render quick movement strip for inactive product', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<InventoryProductCard product={product} {...defaultHandlers()} />)

    expect(screen.queryByRole('button', { name: /Adicionar 1 unidade/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remover 1 unidade/i })).not.toBeInTheDocument()
  })
})
