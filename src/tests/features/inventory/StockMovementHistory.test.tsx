import { act, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/services/inventory.service', () => ({
  listProductStockMovements: vi.fn(),
  createStockProduct: vi.fn(),
  updateStockProduct: vi.fn(),
  getStockSummary: vi.fn(),
  listStockProducts: vi.fn(),
  listStockCategories: vi.fn(),
  createStockMovement: vi.fn(),
  deleteStockCategory: vi.fn(),
  createStockCategory: vi.fn(),
  updateStockCategory: vi.fn(),
}))

import { StockMovementHistory } from '@/features/inventory/components/StockMovementHistory'
import { listProductStockMovements } from '@/features/inventory/services/inventory.service'
import type { StockMovement, StockProduct } from '@/features/inventory/types/inventory.types'

const mockList = vi.mocked(listProductStockMovements)

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

function buildMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    id: 'mov-1',
    clinicId: 'clinic-1',
    productId: 'prod-1',
    type: 'IN',
    quantity: 5,
    previousQuantity: 10,
    newQuantity: 15,
    reason: 'Reposição mensal',
    notes: null,
    performedByUserId: 'user-1',
    performedBy: {
      id: 'user-1',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
    },
    createdAt: '2026-06-01T13:00:00.000Z',
    ...overrides,
  }
}

function mockResolved(movements: StockMovement[]) {
  mockList.mockResolvedValue({
    data: movements,
    total: movements.length,
    page: 1,
    limit: 8,
  } as never)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StockMovementHistory', () => {
  it('recovers from a failed history request on refresh and displays movement notes', async () => {
    mockList.mockRejectedValueOnce(new Error('offline'))
    const { rerender } = render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)
    await screen.findByText('Não foi possível carregar o histórico de movimentações.')
    mockList.mockResolvedValueOnce({
      data: [buildMovement({ notes: 'Lote conferido' })],
      total: 1,
      page: 1,
      limit: 8,
    })
    rerender(<StockMovementHistory product={buildProduct()} refreshKey={1} />)
    expect(await screen.findByText('Lote conferido')).toBeInTheDocument()
    expect(
      screen.queryByText('Não foi possível carregar o histórico de movimentações.'),
    ).not.toBeInTheDocument()
  })
  it.each(['success', 'failure'] as const)(
    'ignores the previous product history %s after switching products',
    async (outcome) => {
      let resolve!: (value: Awaited<ReturnType<typeof listProductStockMovements>>) => void
      let reject!: (error: Error) => void
      mockList.mockReturnValueOnce(
        new Promise((yes, no) => {
          resolve = yes
          reject = no
        }),
      )
      const { rerender } = render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)
      mockList.mockResolvedValueOnce({
        data: [buildMovement({ id: 'current', productId: 'prod-2', reason: 'Movimentação atual' })],
        total: 1,
        page: 1,
        limit: 8,
      })
      rerender(<StockMovementHistory product={buildProduct({ id: 'prod-2' })} refreshKey={0} />)
      await screen.findByText('Movimentação atual')
      await act(async () => {
        if (outcome === 'success') resolve({ data: [buildMovement()], total: 1, page: 1, limit: 8 })
        else reject(new Error('Histórico antigo indisponível'))
      })
      expect(screen.getByText('Movimentação atual')).toBeInTheDocument()
      expect(screen.queryByText('Reposição mensal')).not.toBeInTheDocument()
      expect(
        screen.queryByText('Não foi possível carregar o histórico de movimentações.'),
      ).not.toBeInTheDocument()
    },
  )
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  it('renders loading state while fetching', () => {
    // never-resolving promise — keeps component in loading state
    mockList.mockReturnValue(new Promise(() => {}))
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(screen.getByText(/Carregando movimentações/i)).toBeInTheDocument()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders the empty state when no movements exist', async () => {
    mockResolved([])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/Nenhuma movimentação registrada/i)).toBeInTheDocument()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders an error message when the API call fails', async () => {
    mockList.mockRejectedValue(new Error('Network error'))
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/Não foi possível carregar/i)).toBeInTheDocument()
  })

  // ── Movement list ──────────────────────────────────────────────────────────

  it('renders the movement type label for IN', async () => {
    mockResolved([buildMovement({ type: 'IN' })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText('Entrada')).toBeInTheDocument()
  })

  it('renders the movement type label for OUT', async () => {
    mockResolved([buildMovement({ type: 'OUT' })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText('Saída')).toBeInTheDocument()
  })

  it('renders the movement type label for ADJUSTMENT', async () => {
    mockResolved([buildMovement({ type: 'ADJUSTMENT' })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText('Ajuste')).toBeInTheDocument()
  })

  it('renders the movement type label for LOSS', async () => {
    mockResolved([buildMovement({ type: 'LOSS' })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText('Perda/descarte')).toBeInTheDocument()
  })

  it('renders the quantity with sign prefix for IN', async () => {
    mockResolved([buildMovement({ type: 'IN', quantity: 5 })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/\+5 cx/)).toBeInTheDocument()
  })

  it('renders the quantity with sign prefix for OUT', async () => {
    mockResolved([buildMovement({ type: 'OUT', quantity: 3 })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/-3 cx/)).toBeInTheDocument()
  })

  it('renders the quantity transition arrow', async () => {
    mockResolved([buildMovement({ previousQuantity: 10, newQuantity: 15 })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/10 → 15/)).toBeInTheDocument()
  })

  it('renders the performer name', async () => {
    mockResolved([buildMovement()])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText(/João Silva/i)).toBeInTheDocument()
  })

  it('renders the reason when provided', async () => {
    mockResolved([buildMovement({ reason: 'Reposição de estoque' })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    expect(await screen.findByText('Reposição de estoque')).toBeInTheDocument()
  })

  it('does not render a reason row when reason is null', async () => {
    mockResolved([buildMovement({ reason: null })])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)

    // wait for list to render
    await screen.findByText('Entrada')
    expect(screen.queryByText('Reposição mensal')).not.toBeInTheDocument()
  })

  // ── Refresh behavior ───────────────────────────────────────────────────────

  it('re-fetches when refreshKey changes', async () => {
    mockResolved([])
    const { rerender } = render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)
    await screen.findByText(/Nenhuma movimentação/i)

    rerender(<StockMovementHistory product={buildProduct()} refreshKey={1} />)
    await screen.findByText(/Nenhuma movimentação/i)

    expect(mockList).toHaveBeenCalledTimes(2)
  })

  it('calls listProductStockMovements with the correct productId and limit', async () => {
    mockResolved([])
    render(<StockMovementHistory product={buildProduct()} refreshKey={0} />)
    await screen.findByText(/Nenhuma movimentação/i)

    expect(mockList).toHaveBeenCalledWith('prod-1', { page: 1, limit: 8 })
  })
})
