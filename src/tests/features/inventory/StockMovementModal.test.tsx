import { act, fireEvent, render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

vi.mock('@/features/inventory/services/inventory.service', () => ({
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

import { StockMovementModal } from '@/features/inventory/components/StockMovementModal'
import { createStockMovement } from '@/features/inventory/services/inventory.service'
import type { StockProduct } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

const mockCreateMovement = vi.mocked(createStockMovement)

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

function defaultProps(overrides = {}) {
  return {
    product: buildProduct(),
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StockMovementModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMovement.mockResolvedValue(undefined as never)
  })

  // ── Dialog structure ───────────────────────────────────────────────────────

  it('dismisses once with Escape without recording a movement', async () => {
    const props = defaultProps()
    render(<StockMovementModal {...props} />)
    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledOnce()
    expect(mockCreateMovement).not.toHaveBeenCalled()
  })

  it('clears quantity and validation errors when reopened for another product', async () => {
    const props = defaultProps()
    const { rerender } = render(<StockMovementModal {...props} />)
    fireEvent.change(screen.getByRole('spinbutton', { name: /^Quantidade$/i }), {
      target: { value: '0' },
    })
    await userEvent.click(screen.getByRole('button', { name: /Registrar movimentação/ }))
    expect(screen.getByText('Informe uma quantidade maior que zero.')).toBeInTheDocument()
    rerender(<StockMovementModal {...props} product={null} />)
    rerender(
      <StockMovementModal {...props} product={buildProduct({ id: 'prod-2', name: 'Resina' })} />,
    )
    expect(screen.getByText('Resina')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /^Quantidade$/i })).toHaveValue(null)
    expect(screen.queryByText('Informe uma quantidade maior que zero.')).not.toBeInTheDocument()
  })

  it.each(['OUT', 'LOSS'] as const)(
    'records %s with fractional quantity and trimmed justification',
    async (type) => {
      const props = defaultProps()
      render(<StockMovementModal {...props} />)
      await userEvent.click(
        screen.getByRole('radio', { name: type === 'OUT' ? /Saída/i : /Perda\/descarte/i }),
      )
      fireEvent.change(screen.getByRole('spinbutton', { name: /^Quantidade$/i }), {
        target: { value: '1.5' },
      })
      fireEvent.change(screen.getByLabelText(/Motivo/), { target: { value: '  Uso clínico  ' } })
      fireEvent.change(screen.getByLabelText(/Observações/), { target: { value: '  Conferido  ' } })
      await userEvent.click(screen.getByRole('button', { name: /Registrar movimentação/ }))
      expect(mockCreateMovement).toHaveBeenCalledWith({
        productId: 'prod-1',
        type,
        quantity: 1.5,
        reason: 'Uso clínico',
        notes: 'Conferido',
      })
      expect(props.onSuccess).toHaveBeenCalledOnce()
      expect(props.onClose).toHaveBeenCalledOnce()
    },
  )

  it.each(['', '-1'])(
    'prevents native submission of invalid final quantity %s',
    async (quantity) => {
      render(<StockMovementModal {...defaultProps()} />)
      await userEvent.click(screen.getByRole('radio', { name: /Ajuste/i }))
      const input = screen.getByRole('spinbutton', { name: /Quantidade final/i })
      fireEvent.change(input, { target: { value: quantity } })
      await userEvent.click(screen.getByRole('button', { name: /Registrar movimentação/ }))
      expect(input).toBeInvalid()
      expect(mockCreateMovement).not.toHaveBeenCalled()
    },
  )

  it('accepts an explicit zero adjustment and blocks duplicate submission while saving', async () => {
    let resolve!: () => void
    mockCreateMovement.mockReturnValueOnce(
      new Promise((yes) => {
        resolve = () => yes(undefined as never)
      }),
    )
    const props = defaultProps()
    render(<StockMovementModal {...props} />)
    await userEvent.click(screen.getByRole('radio', { name: /Ajuste/i }))
    fireEvent.change(screen.getByRole('spinbutton', { name: /Quantidade final/i }), {
      target: { value: '0' },
    })
    const submit = screen.getByRole('button', { name: /Registrar movimentação/ })
    await userEvent.click(submit)
    expect(submit).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await userEvent.click(submit)
    expect(mockCreateMovement).toHaveBeenCalledOnce()
    expect(mockCreateMovement).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADJUSTMENT', newQuantity: 0 }),
    )
    expect(props.onClose).not.toHaveBeenCalled()
    await act(async () => resolve())
    expect(props.onSuccess).toHaveBeenCalledOnce()
    expect(submit).toBeEnabled()
  })

  it.each([new ApiError('Saldo insuficiente', 400, null), new Error('offline')])(
    'preserves the draft and retries a failed movement: %s',
    async (error) => {
      mockCreateMovement.mockRejectedValueOnce(error)
      const props = defaultProps()
      render(<StockMovementModal {...props} />)
      fireEvent.change(screen.getByRole('spinbutton', { name: /^Quantidade$/i }), {
        target: { value: '2' },
      })
      await userEvent.click(screen.getByRole('button', { name: /Registrar movimentação/ }))
      expect(
        screen.getByText(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível registrar a movimentação. Tente novamente.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: /^Quantidade$/i })).toHaveValue(2)
      expect(props.onSuccess).not.toHaveBeenCalled()
      expect(props.onClose).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: /Registrar movimentação/ }))
      expect(mockCreateMovement).toHaveBeenCalledTimes(2)
      expect(props.onSuccess).toHaveBeenCalledOnce()
    },
  )

  it('renders the dialog title', () => {
    render(<StockMovementModal {...defaultProps()} />)

    expect(screen.getByRole('heading', { name: /Movimentar estoque/i })).toBeInTheDocument()
  })

  it('renders a visible description', () => {
    render(<StockMovementModal {...defaultProps()} />)

    expect(screen.getByText(/Registre uma entrada, saída, ajuste ou perda/i)).toBeInTheDocument()
  })

  it('renders the scrollable body with app-scrollbar class', () => {
    render(<StockMovementModal {...defaultProps()} />)

    // Dialog renders into a portal — query against the full document
    expect(document.querySelector('.app-scrollbar')).toBeInTheDocument()
  })

  it('shows the product name and current stock in the context block', () => {
    render(<StockMovementModal {...defaultProps()} />)

    expect(screen.getByText('Luva cirúrgica')).toBeInTheDocument()
    expect(screen.getByText(/Estoque atual: 10 cx/i)).toBeInTheDocument()
  })

  // ── Section headings ───────────────────────────────────────────────────────

  it('renders section headings', () => {
    render(<StockMovementModal {...defaultProps()} />)

    // Use { selector: 'p' } to target only the visible section heading,
    // not any sr-only elements with the same text
    expect(screen.getByText('Tipo de movimentação', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Quantidade', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Justificativa', { selector: 'p' })).toBeInTheDocument()
  })

  // ── Movement type selector ─────────────────────────────────────────────────

  it('renders all four movement type options', () => {
    render(<StockMovementModal {...defaultProps()} />)

    expect(screen.getByText('Entrada')).toBeInTheDocument()
    expect(screen.getByText('Saída')).toBeInTheDocument()
    expect(screen.getByText('Ajuste')).toBeInTheDocument()
    expect(screen.getByText('Perda/descarte')).toBeInTheDocument()
  })

  it('defaults to Entrada selected', () => {
    render(<StockMovementModal {...defaultProps()} />)

    const entradaRadio = screen.getByRole('radio', { name: /Entrada/i })
    expect(entradaRadio).toBeChecked()
  })

  it('changes selected type when a different option is clicked', async () => {
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps()} />)

    await user.click(screen.getByRole('radio', { name: /Saída/i }))

    expect(screen.getByRole('radio', { name: /Saída/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Entrada/i })).not.toBeChecked()
  })

  it('shows "Quantidade final" label when Ajuste is selected', async () => {
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps()} />)

    await user.click(screen.getByRole('radio', { name: /Ajuste/i }))

    // Use getByRole('spinbutton') to target the number input specifically,
    // not the radio whose label text contains "a quantidade final"
    expect(screen.getByRole('spinbutton', { name: /Quantidade final/i })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: /^Quantidade$/i })).not.toBeInTheDocument()
  })

  // ── Submit payload ─────────────────────────────────────────────────────────

  it('calls createStockMovement with IN type and quantity', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps({ onSuccess })} />)

    await user.type(screen.getByRole('spinbutton', { name: /^Quantidade$/i }), '5')
    await user.click(screen.getByRole('button', { name: /Registrar movimentação/i }))

    expect(mockCreateMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        type: 'IN',
        quantity: 5,
      }),
    )
  })

  it('calls createStockMovement with ADJUSTMENT type and newQuantity', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps({ onSuccess })} />)

    await user.click(screen.getByRole('radio', { name: /Ajuste/i }))
    // Target the number input by spinbutton role, not by label text (which also
    // matches the "Define a quantidade final" description in the Ajuste card)
    await user.type(screen.getByRole('spinbutton', { name: /Quantidade final/i }), '20')
    await user.click(screen.getByRole('button', { name: /Registrar movimentação/i }))

    expect(mockCreateMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        type: 'ADJUSTMENT',
        newQuantity: 20,
      }),
    )
  })

  it('shows an error when submitting with zero quantity', async () => {
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps()} />)

    // Type 0: bypasses the `required` HTML5 check but fails the JS `> 0` validation
    await user.type(screen.getByRole('spinbutton', { name: /^Quantidade$/i }), '0')
    await user.click(screen.getByRole('button', { name: /Registrar movimentação/i }))

    expect(screen.getByText(/Informe uma quantidade maior que zero/i)).toBeInTheDocument()
    expect(mockCreateMovement).not.toHaveBeenCalled()
  })

  // ── Close behavior ─────────────────────────────────────────────────────────

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Cancelar/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close icon button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<StockMovementModal {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Fechar movimentação/i }))

    expect(onClose).toHaveBeenCalled()
  })

  // ── Closed state ───────────────────────────────────────────────────────────

  it('renders nothing when product is null', () => {
    render(<StockMovementModal product={null} onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.queryByRole('heading', { name: /Movimentar estoque/i })).not.toBeInTheDocument()
  })
})
