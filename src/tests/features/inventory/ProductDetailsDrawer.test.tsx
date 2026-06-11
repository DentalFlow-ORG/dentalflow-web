import { render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// StockMovementHistory makes API calls — stub it out
vi.mock('@/features/inventory/components/StockMovementHistory', () => ({
  StockMovementHistory: ({ product }: { product: { name: string } }) => (
    <div data-testid="movement-history">Histórico de {product.name}</div>
  ),
}))

import { ProductDetailsDrawer } from '@/features/inventory/components/ProductDetailsDrawer'
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
    notes: 'Notas internas aqui',
    isActive: true,
    status: 'ACTIVE',
    category: { id: 'cat-1', name: 'Descartáveis', color: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    ...overrides,
  }
}

function defaultProps(overrides: Partial<Parameters<typeof ProductDetailsDrawer>[0]> = {}) {
  return {
    product: buildProduct(),
    isOwner: true,
    movementHistoryRefreshKey: 0,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onMove: vi.fn(),
    onDeactivate: vi.fn(),
    onReactivate: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductDetailsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Identity ───────────────────────────────────────────────────────────────

  it('renders the product name as the dialog title', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByRole('heading', { name: /Luva cirúrgica/i })).toBeInTheDocument()
  })

  it('renders the status badge in the header', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Em estoque')).toBeInTheDocument()
  })

  it('renders the category name in the header metadata area', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    // category appears in the header metadata span and in the info section row
    const matches = screen.getAllByText('Descartáveis')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the "Produto" eyebrow label', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Produto', { selector: 'p' })).toBeInTheDocument()
  })

  // ── Quantity chips ─────────────────────────────────────────────────────────

  it('renders the current quantity chip', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('10 cx')).toBeInTheDocument()
    expect(screen.getByText('Quantidade atual')).toBeInTheDocument()
  })

  it('renders the minimum quantity chip', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('2 cx')).toBeInTheDocument()
    expect(screen.getByText('Quantidade mínima')).toBeInTheDocument()
  })

  it('shows — in the minimum quantity chip when minQuantity is 0', () => {
    render(
      <ProductDetailsDrawer {...defaultProps({ product: buildProduct({ minQuantity: 0 }) })} />,
    )

    expect(screen.getByText('Quantidade mínima')).toBeInTheDocument()
  })

  // ── Actions: active product, isOwner ──────────────────────────────────────

  it('renders Editar button for active product', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByRole('button', { name: /Editar produto/i })).toBeInTheDocument()
  })

  it('renders Movimentar button for active product', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(
      screen.getByRole('button', { name: /Movimentar estoque de Luva cirúrgica/i }),
    ).toBeInTheDocument()
  })

  it('renders Desativar button for active product when isOwner', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(
      screen.getByRole('button', { name: /Desativar produto Luva cirúrgica/i }),
    ).toBeInTheDocument()
  })

  it('does not render Desativar when isOwner is false', () => {
    render(<ProductDetailsDrawer {...defaultProps({ isOwner: false })} />)

    expect(screen.queryByRole('button', { name: /Desativar produto/i })).not.toBeInTheDocument()
  })

  // ── Actions: inactive product ──────────────────────────────────────────────

  it('does not render Editar or Movimentar for an inactive product', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<ProductDetailsDrawer {...defaultProps({ product })} />)

    expect(screen.queryByRole('button', { name: /Editar produto/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Movimentar estoque/i })).not.toBeInTheDocument()
  })

  it('renders Reativar button for inactive product when isOwner', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<ProductDetailsDrawer {...defaultProps({ product })} />)

    expect(
      screen.getByRole('button', { name: /Reativar produto Luva cirúrgica/i }),
    ).toBeInTheDocument()
  })

  it('hides the Ações section entirely when product is inactive and isOwner is false', () => {
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    render(<ProductDetailsDrawer {...defaultProps({ product, isOwner: false })} />)

    expect(screen.queryByText('Ações', { selector: 'p' })).not.toBeInTheDocument()
  })

  // ── Action callbacks ───────────────────────────────────────────────────────

  it('calls onEdit with the product when Editar is clicked', async () => {
    const onEdit = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<ProductDetailsDrawer {...defaultProps({ product, onEdit })} />)

    await user.click(screen.getByRole('button', { name: /Editar produto/i }))

    expect(onEdit).toHaveBeenCalledWith(product)
  })

  it('calls onMove with the product when Movimentar is clicked', async () => {
    const onMove = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<ProductDetailsDrawer {...defaultProps({ product, onMove })} />)

    await user.click(screen.getByRole('button', { name: /Movimentar estoque de Luva cirúrgica/i }))

    expect(onMove).toHaveBeenCalledWith(product)
  })

  it('calls onDeactivate with the product when Desativar is clicked', async () => {
    const onDeactivate = vi.fn()
    const product = buildProduct()
    const user = userEvent.setup()
    render(<ProductDetailsDrawer {...defaultProps({ product, onDeactivate })} />)

    await user.click(screen.getByRole('button', { name: /Desativar produto Luva cirúrgica/i }))

    expect(onDeactivate).toHaveBeenCalledWith(product)
  })

  it('calls onReactivate with the product when Reativar is clicked', async () => {
    const onReactivate = vi.fn()
    const product = buildProduct({ status: 'INACTIVE', isActive: false })
    const user = userEvent.setup()
    render(<ProductDetailsDrawer {...defaultProps({ product, onReactivate })} />)

    await user.click(screen.getByRole('button', { name: /Reativar produto Luva cirúrgica/i }))

    expect(onReactivate).toHaveBeenCalledWith(product)
  })

  // ── Product info section ───────────────────────────────────────────────────

  it('renders the "Informações do produto" section heading', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Informações do produto', { selector: 'p' })).toBeInTheDocument()
  })

  it('renders category in the product info section', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Categoria')).toBeInTheDocument()
  })

  it('renders unit in the product info section', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Unidade')).toBeInTheDocument()
  })

  it('renders the purchase price when set', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    // 5000 cents = R$50,00
    expect(screen.getByText(/R\$\s*50/i)).toBeInTheDocument()
  })

  it('renders the supplier when set', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Fornecedor ABC')).toBeInTheDocument()
  })

  // ── Description and notes ──────────────────────────────────────────────────

  it('renders the "Descrição e observações" section when description is set', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Descrição e observações', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Luva descartável estéril')).toBeInTheDocument()
  })

  it('renders the notes sub-label and content when notes is set', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Observações internas')).toBeInTheDocument()
    expect(screen.getByText('Notas internas aqui')).toBeInTheDocument()
  })

  it('does not render the description section when description and notes are both null', () => {
    render(
      <ProductDetailsDrawer
        {...defaultProps({ product: buildProduct({ description: null, notes: null }) })}
      />,
    )

    expect(screen.queryByText('Descrição e observações', { selector: 'p' })).not.toBeInTheDocument()
  })

  it('renders the section when only notes is set (no description)', () => {
    render(
      <ProductDetailsDrawer {...defaultProps({ product: buildProduct({ description: null }) })} />,
    )

    expect(screen.getByText('Descrição e observações', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Notas internas aqui')).toBeInTheDocument()
    expect(screen.queryByText('Descrição', { selector: 'p' })).not.toBeInTheDocument()
  })

  // ── Movement history ───────────────────────────────────────────────────────

  it('renders the "Movimentações recentes" section heading', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByText('Movimentações recentes', { selector: 'p' })).toBeInTheDocument()
  })

  it('renders the movement history component', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    expect(screen.getByTestId('movement-history')).toBeInTheDocument()
  })

  // ── Close ──────────────────────────────────────────────────────────────────

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ProductDetailsDrawer {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Fechar detalhes/i }))

    expect(onClose).toHaveBeenCalled()
  })

  // ── Empty / closed state ───────────────────────────────────────────────────

  it('renders nothing meaningful when product is null', () => {
    render(<ProductDetailsDrawer {...defaultProps({ product: null })} />)

    expect(screen.queryByRole('heading', { name: /Luva cirúrgica/i })).not.toBeInTheDocument()
  })

  // ── Scrollable body ────────────────────────────────────────────────────────

  it('has app-scrollbar on the drawer body', () => {
    render(<ProductDetailsDrawer {...defaultProps()} />)

    // Dialog renders into a portal — query against the full document
    expect(document.querySelector('.app-scrollbar')).toBeInTheDocument()
  })
})
