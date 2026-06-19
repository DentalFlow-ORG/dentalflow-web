import { render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// InventoryProductCard renders mobile cards with duplicate buttons — stub to avoid conflicts
vi.mock('@/features/inventory/components/InventoryProductCard', () => ({
  InventoryProductCard: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`mobile-card-${product.id}`}>{product.name}</div>
  ),
}))

// Pagination may use Radix Select internally — stub to keep tests focused
vi.mock('@/components/common/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}))

import { InventoryProductTable } from '@/features/inventory/components/InventoryProductTable'
import type { StockProduct } from '@/features/inventory/types/inventory.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function buildProduct(overrides: Partial<StockProduct> = {}): StockProduct {
  return {
    id: 'prod-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-1',
    name: 'Luva cirúrgica',
    description: 'Luva descartável estéril',
    unit: 'cx',
    currentQuantity: 10,
    minQuantity: 2,
    purchasePrice: 5000,
    supplier: 'Fornecedor ABC',
    expiresAt: '2027-12-31T00:00:00.000Z',
    notes: null,
    isActive: true,
    status: 'ACTIVE',
    category: { id: 'cat-1', name: 'Descartáveis', color: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function defaultProps(overrides: Partial<Parameters<typeof InventoryProductTable>[0]> = {}) {
  return {
    products: [buildProduct()],
    isLoading: false,
    page: 1,
    pageSize: 10,
    total: 1,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onViewDetails: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    onDeactivate: vi.fn(),
    onReactivate: vi.fn(),
    quickMovingIds: new Set<string>(),
    onQuickMove: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryProductTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Product identity ───────────────────────────────────────────────────────

  it('renders the product name in the table row', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Luva cirúrgica')
  })

  it('renders the product description in the table row', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Luva descartável estéril')
  })

  it('renders the category name in the table row', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Descartáveis')
  })

  it('renders the status badge in the table row', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    // StockStatusBadge renders text for ACTIVE
    expect(screen.getByText('Em estoque')).toBeInTheDocument()
  })

  it('renders the current quantity in the table row', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('10 cx')
  })

  // ── Null field fallbacks ───────────────────────────────────────────────────

  it('renders — for null purchase price', () => {
    render(
      <InventoryProductTable
        {...defaultProps({ products: [buildProduct({ purchasePrice: null })] })}
      />,
    )

    // At least one — is present in the table
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('—')
  })

  it('renders the purchase price when set', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    // 5000 cents = R$50,00
    const table = screen.getByRole('table')
    expect(table.textContent).toMatch(/R\$\s*50/)
  })

  it('renders the supplier when set', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Fornecedor ABC')
  })

  it('renders the expiry date when set', () => {
    render(<InventoryProductTable {...defaultProps()} />)

    // formatProductDate renders something for 2027-12-31
    const table = screen.getByRole('table')
    expect(table.textContent).toMatch(/2027|dez/)
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders the empty state when products array is empty', () => {
    render(<InventoryProductTable {...defaultProps({ products: [], total: 0 })} />)

    expect(screen.getByRole('table')).toHaveTextContent('Nenhum produto encontrado.')
  })

  // ── Eye button ─────────────────────────────────────────────────────────────

  it('calls onViewDetails with the product when Eye button is clicked', async () => {
    const onViewDetails = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onViewDetails })} />)

    await user.click(screen.getByRole('button', { name: `Ver detalhes de ${product.name}` }))

    expect(onViewDetails).toHaveBeenCalledWith(product)
  })

  // ── Pencil button ──────────────────────────────────────────────────────────

  it('calls onEdit with the product when Pencil button is clicked', async () => {
    const onEdit = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onEdit })} />)

    await user.click(screen.getByRole('button', { name: `Editar produto ${product.name}` }))

    expect(onEdit).toHaveBeenCalledWith(product)
  })

  // ── MoveRight button ───────────────────────────────────────────────────────

  it('calls onMove with the product when MoveRight button is clicked', async () => {
    const onMove = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onMove })} />)

    await user.click(screen.getByRole('button', { name: `Movimentar estoque de ${product.name}` }))

    expect(onMove).toHaveBeenCalledWith(product)
  })

  // ── PowerOff button ────────────────────────────────────────────────────────

  it('calls onDeactivate with the product when PowerOff button is clicked', async () => {
    const onDeactivate = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onDeactivate })} />)

    await user.click(screen.getByRole('button', { name: `Desativar produto ${product.name}` }))

    expect(onDeactivate).toHaveBeenCalledWith(product)
  })

  // ── Power (reactivate) button ──────────────────────────────────────────────

  it('calls onReactivate with the product when Power button is clicked', async () => {
    const onReactivate = vi.fn()
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onReactivate })} />)

    await user.click(screen.getByRole('button', { name: `Reativar produto ${product.name}` }))

    expect(onReactivate).toHaveBeenCalledWith(product)
  })

  // ── Inactive product visibility ────────────────────────────────────────────

  it('hides Pencil, MoveRight, and PowerOff for an inactive product', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<InventoryProductTable {...defaultProps({ products: [product] })} />)

    expect(
      screen.queryByRole('button', { name: `Editar produto ${product.name}` }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: `Movimentar estoque de ${product.name}` }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: `Desativar produto ${product.name}` }),
    ).not.toBeInTheDocument()
  })

  it('shows Power button for inactive product when onReactivate is provided', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<InventoryProductTable {...defaultProps({ products: [product] })} />)

    expect(
      screen.getByRole('button', { name: `Reativar produto ${product.name}` }),
    ).toBeInTheDocument()
  })

  // ── Quick move +1 ──────────────────────────────────────────────────────────

  it('calls onQuickMove with "in" when +1 button is clicked', async () => {
    const onQuickMove = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onQuickMove })} />)

    await user.click(screen.getByRole('button', { name: `Adicionar 1 unidade de ${product.name}` }))

    expect(onQuickMove).toHaveBeenCalledWith(product, 'in')
  })

  // ── Quick move -1 ──────────────────────────────────────────────────────────

  it('calls onQuickMove with "out" when -1 button is clicked', async () => {
    const onQuickMove = vi.fn()
    const product = buildProduct({ currentQuantity: 5 })
    const user = userEvent.setup()
    render(<InventoryProductTable {...defaultProps({ products: [product], onQuickMove })} />)

    await user.click(screen.getByRole('button', { name: `Remover 1 unidade de ${product.name}` }))

    expect(onQuickMove).toHaveBeenCalledWith(product, 'out')
  })

  it('disables the -1 button when currentQuantity is 0', () => {
    const product = buildProduct({ currentQuantity: 0 })
    render(<InventoryProductTable {...defaultProps({ products: [product] })} />)

    expect(
      screen.getByRole('button', { name: /Estoque insuficiente para saída rápida/i }),
    ).toBeDisabled()
  })

  // ── Loading spinner ────────────────────────────────────────────────────────

  it('shows a loading spinner instead of quantity when product is in quickMovingIds', () => {
    const product = buildProduct()
    const quickMovingIds = new Set([product.id])
    render(<InventoryProductTable {...defaultProps({ products: [product], quickMovingIds })} />)

    const table = screen.getByRole('table')
    expect(table.querySelector('.animate-spin')).toBeInTheDocument()
  })

  // ── Scrollbar ──────────────────────────────────────────────────────────────

  it('has app-scrollbar on the horizontal scroll wrapper', () => {
    const { container } = render(<InventoryProductTable {...defaultProps()} />)

    expect(container.querySelector('.app-scrollbar')).toBeInTheDocument()
  })
})
