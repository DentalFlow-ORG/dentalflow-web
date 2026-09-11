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

// Radix Select does not work in JSDOM — stub with native <select>
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

// DatePickerInput: stub with native date input
vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    value,
    onValueChange,
  }: { id: string; value: string; onValueChange: (v: string) => void }) => (
    <input id={id} type="date" value={value} onChange={(e) => onValueChange(e.target.value)} />
  ),
}))

import { ProductFormModal } from '@/features/inventory/components/ProductFormModal'
import {
  createStockProduct,
  updateStockProduct,
} from '@/features/inventory/services/inventory.service'
import type { StockCategory, StockProduct } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

const mockCreate = vi.mocked(createStockProduct)
const mockUpdate = vi.mocked(updateStockProduct)

// ── Fixtures ──────────────────────────────────────────────────────────────────

const categories: StockCategory[] = [
  {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Descartáveis',
    color: null,
    productCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    clinicId: 'clinic-1',
    name: 'Anestésicos',
    color: null,
    productCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function buildProduct(overrides: Partial<StockProduct> = {}): StockProduct {
  return {
    id: 'prod-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-1',
    name: 'Luva cirúrgica',
    description: 'Luva descartável',
    unit: 'cx',
    currentQuantity: 10,
    minQuantity: 2,
    purchasePrice: 5000,
    supplier: 'Fornecedor ABC',
    expiresAt: '2027-12-31T00:00:00.000Z',
    notes: 'Notas internas',
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
    open: true,
    product: null,
    categories,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue(buildProduct())
    mockUpdate.mockResolvedValue(buildProduct())
  })

  // ── Create mode ────────────────────────────────────────────────────────────

  it('dismisses once with Escape without saving a product', async () => {
    const props = defaultProps()
    render(<ProductFormModal {...props} />)
    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledOnce()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects whitespace-only names and missing categories', async () => {
    render(<ProductFormModal {...defaultProps()} />)
    fireEvent.change(screen.getByLabelText(/Nome do produto/i), { target: { value: '   ' } })
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }))
    expect(screen.getByText('O nome do produto é obrigatório.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Nome do produto/i), { target: { value: 'Resina' } })
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }))
    expect(screen.getByText('Selecione uma categoria para o produto.')).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a product with entered stock, price, expiry and trimmed optional details', async () => {
    const props = defaultProps()
    render(<ProductFormModal {...props} />)
    for (const [label, value] of [
      [/Nome do produto/i, '  Resina  '],
      [/Unidade/i, '  ml  '],
      [/Fornecedor/i, '  Dental  '],
      [/Quantidade atual/i, '1.5'],
      [/Quantidade mínima/i, '0.5'],
      [/Validade/i, '2027-12-31'],
      [/Valor de compra/i, '123456'],
      [/^Descrição/i, '  Uso clínico  '],
      [/Observações internas/i, '  Lote A  '],
    ] as const)
      fireEvent.change(screen.getByLabelText(label), { target: { value } })
    await userEvent.selectOptions(screen.getByRole('combobox'), 'cat-2')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }))
    expect(mockCreate).toHaveBeenCalledWith({
      name: 'Resina',
      categoryId: 'cat-2',
      unit: 'ml',
      currentQuantity: 1.5,
      minQuantity: 0.5,
      purchasePrice: 123456,
      supplier: 'Dental',
      expiresAt: '2027-12-31',
      description: 'Uso clínico',
      notes: 'Lote A',
    })
    expect(props.onSuccess).toHaveBeenCalledOnce()
  })

  it('loads a product without optional data and omits unset values when saving', async () => {
    render(
      <ProductFormModal
        {...defaultProps({
          product: buildProduct({
            minQuantity: 0,
            purchasePrice: null,
            supplier: null,
            expiresAt: null,
            description: null,
            notes: null,
          }),
        })}
      />,
    )
    expect(screen.getByLabelText(/Fornecedor/i)).toHaveValue('')
    expect(screen.getByLabelText(/Validade/i)).toHaveValue('')
    expect(screen.getByLabelText(/Quantidade mínima/i)).toHaveValue(null)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(mockUpdate).toHaveBeenCalledWith('prod-1', {
      name: 'Luva cirúrgica',
      categoryId: 'cat-1',
      unit: 'cx',
      minQuantity: undefined,
      purchasePrice: undefined,
      supplier: undefined,
      expiresAt: null,
      description: undefined,
      notes: undefined,
    })
  })

  it.each([new ApiError('Produto duplicado', 409, null), new Error('offline')])(
    'preserves a failed creation and retries: %s',
    async (error) => {
      mockCreate.mockRejectedValueOnce(error)
      const props = defaultProps()
      render(<ProductFormModal {...props} />)
      fireEvent.change(screen.getByLabelText(/Nome do produto/i), { target: { value: 'Resina' } })
      await userEvent.selectOptions(screen.getByRole('combobox'), 'cat-1')
      await userEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }))
      expect(
        screen.getByText(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível salvar o produto. Tente novamente.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/Nome do produto/i)).toHaveValue('Resina')
      expect(props.onClose).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: 'Cadastrar produto' }))
      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(props.onSuccess).toHaveBeenCalledOnce()
    },
  )

  it('disables repeated saves while an update is pending', async () => {
    let resolve!: (product: StockProduct) => void
    mockUpdate.mockReturnValueOnce(
      new Promise((yes) => {
        resolve = yes
      }),
    )
    const props = defaultProps({ product: buildProduct() })
    render(<ProductFormModal {...props} />)
    const submit = screen.getByRole('button', { name: 'Salvar alterações' })
    await userEvent.click(submit)
    expect(submit).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await userEvent.click(submit)
    expect(mockUpdate).toHaveBeenCalledOnce()
    await act(async () => resolve(buildProduct()))
    expect(props.onSuccess).toHaveBeenCalledOnce()
  })

  it('resets an edited draft when closing and reopening in create mode', () => {
    const props = defaultProps()
    const { rerender } = render(<ProductFormModal {...props} product={buildProduct()} />)
    fireEvent.change(screen.getByLabelText(/Nome do produto/i), {
      target: { value: 'Rascunho alterado' },
    })
    rerender(<ProductFormModal {...props} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<ProductFormModal {...props} />)
    expect(screen.getByLabelText(/Nome do produto/i)).toHaveValue('')
    expect(screen.getByLabelText(/Fornecedor/i)).toHaveValue('')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('renders the create mode title', () => {
    render(<ProductFormModal {...defaultProps()} />)

    expect(screen.getByRole('heading', { name: /Novo produto/i })).toBeInTheDocument()
  })

  it('renders a visible description in create mode', () => {
    render(<ProductFormModal {...defaultProps()} />)

    expect(screen.getByText(/Preencha os dados para cadastrar/i)).toBeInTheDocument()
  })

  it('renders all main fields in create mode', () => {
    render(<ProductFormModal {...defaultProps()} />)

    expect(screen.getByLabelText(/Nome do produto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Quantidade atual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Quantidade mínima/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor de compra/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fornecedor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Observações internas/i)).toBeInTheDocument()
  })

  it('renders section headings', () => {
    render(<ProductFormModal {...defaultProps()} />)

    expect(screen.getByText('Identificação')).toBeInTheDocument()
    expect(screen.getByText('Controle de estoque')).toBeInTheDocument()
    expect(screen.getByText('Valores')).toBeInTheDocument()
    expect(screen.getByText('Observações')).toBeInTheDocument()
  })

  it('renders the scrollable body with app-scrollbar class', () => {
    render(<ProductFormModal {...defaultProps()} />)

    // Dialog renders into a portal — query against the full document
    expect(document.querySelector('.app-scrollbar')).toBeInTheDocument()
  })

  it('renders the submit button labeled "Cadastrar produto"', () => {
    render(<ProductFormModal {...defaultProps()} />)

    expect(screen.getByRole('button', { name: /Cadastrar produto/i })).toBeInTheDocument()
  })

  it('calls createStockProduct with correct payload on submit', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<ProductFormModal {...defaultProps({ onSuccess })} />)

    await user.type(screen.getByLabelText(/Nome do produto/i), 'Luva P')
    // Native <select> — select by displayed text
    await user.selectOptions(screen.getByRole('combobox'), 'Descartáveis')

    await user.click(screen.getByRole('button', { name: /Cadastrar produto/i }))

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Luva P',
        categoryId: 'cat-1',
      }),
    )
  })

  // ── Edit mode ──────────────────────────────────────────────────────────────

  it('renders the edit mode title', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByRole('heading', { name: /Editar produto/i })).toBeInTheDocument()
  })

  it('renders a visible description in edit mode', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByText(/Atualize os dados do produto/i)).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByLabelText(/Nome do produto/i)).toHaveValue('Luva cirúrgica')
  })

  it('pre-fills supplier field in edit mode', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByLabelText(/Fornecedor/i)).toHaveValue('Fornecedor ABC')
  })

  it('shows quantity display box instead of quantity input in edit mode', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByText('Quantidade atual')).toBeInTheDocument()
    expect(screen.getByText(/Para alterar/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Quantidade atual/i)).not.toBeInTheDocument()
  })

  it('calls updateStockProduct on submit in edit mode', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<ProductFormModal {...defaultProps({ product: buildProduct(), onSuccess })} />)

    // Clear and re-type name
    await user.clear(screen.getByLabelText(/Nome do produto/i))
    await user.type(screen.getByLabelText(/Nome do produto/i), 'Luva M')

    await user.click(screen.getByRole('button', { name: /Salvar alterações/i }))

    expect(mockUpdate).toHaveBeenCalledWith('prod-1', expect.objectContaining({ name: 'Luva M' }))
  })

  it('renders the submit button labeled "Salvar alterações" in edit mode', () => {
    render(<ProductFormModal {...defaultProps({ product: buildProduct() })} />)

    expect(screen.getByRole('button', { name: /Salvar alterações/i })).toBeInTheDocument()
  })

  // ── Close behavior ─────────────────────────────────────────────────────────

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ProductFormModal {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Cancelar/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close icon button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ProductFormModal {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Fechar/i }))

    expect(onClose).toHaveBeenCalled()
  })

  // ── Warning when no categories ─────────────────────────────────────────────

  it('shows a warning when no categories are available', () => {
    render(<ProductFormModal {...defaultProps({ categories: [] })} />)

    expect(screen.getByText(/Nenhuma categoria disponível/i)).toBeInTheDocument()
  })
})
