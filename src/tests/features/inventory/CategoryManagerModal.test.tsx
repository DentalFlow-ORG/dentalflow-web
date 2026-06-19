import { render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

vi.mock('@/features/inventory/services/inventory.service', () => ({
  createStockCategory: vi.fn(),
  updateStockCategory: vi.fn(),
  deleteStockCategory: vi.fn(),
  createStockProduct: vi.fn(),
  updateStockProduct: vi.fn(),
  getStockSummary: vi.fn(),
  listStockProducts: vi.fn(),
  listStockCategories: vi.fn(),
  createStockMovement: vi.fn(),
  listProductStockMovements: vi.fn(),
}))

import { CategoryManagerModal } from '@/features/inventory/components/CategoryManagerModal'
import {
  createStockCategory,
  deleteStockCategory,
  updateStockCategory,
} from '@/features/inventory/services/inventory.service'
import type { StockCategory } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

const mockCreate = vi.mocked(createStockCategory)
const mockUpdate = vi.mocked(updateStockCategory)
const mockDelete = vi.mocked(deleteStockCategory)

// ── Fixtures ──────────────────────────────────────────────────────────────────

function buildCategory(overrides: Partial<StockCategory> = {}): StockCategory {
  return {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Descartáveis',
    color: null,
    productCount: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function defaultProps(overrides: Partial<Parameters<typeof CategoryManagerModal>[0]> = {}) {
  return {
    open: true,
    categories: [buildCategory()],
    onClose: vi.fn(),
    onCategoriesChanged: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CategoryManagerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue(buildCategory() as never)
    mockUpdate.mockResolvedValue(buildCategory() as never)
    mockDelete.mockResolvedValue(undefined as never)
  })

  // ── Title and description — main modal ─────────────────────────────────────

  it('renders a visible modal title', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    expect(screen.getByRole('heading', { name: /Gerenciar categorias/i })).toBeInTheDocument()
  })

  it('renders a visible modal description', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    expect(screen.getByText(/Crie, edite e exclua categorias/i)).toBeInTheDocument()
  })

  // ── Title and description — delete dialog ──────────────────────────────────

  it('renders a visible title in the delete confirmation dialog', async () => {
    const user = userEvent.setup()
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Excluir categoria ${category.name}` }))

    expect(await screen.findByRole('heading', { name: /Excluir categoria/i })).toBeInTheDocument()
  })

  it('renders a visible description in the delete confirmation dialog', async () => {
    const user = userEvent.setup()
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Excluir categoria ${category.name}` }))

    expect(
      await screen.findByText(/Categorias com produtos vinculados não podem ser excluídas/i),
    ).toBeInTheDocument()
  })

  // ── Create form fields ─────────────────────────────────────────────────────

  it('renders the name input', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    expect(screen.getByLabelText(/Nome da categoria/i)).toBeInTheDocument()
  })

  it('renders the color text input', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    // Use placeholder to target the hex color input specifically;
    // /Cor/i also matches aria-label="Cores sugeridas" and the swatch buttons
    expect(screen.getByPlaceholderText('#1E3A8A')).toBeInTheDocument()
  })

  // ── Color options ──────────────────────────────────────────────────────────

  it('renders six color swatches', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    expect(screen.getAllByRole('button', { name: /Selecionar cor/i })).toHaveLength(6)
  })

  it('marks a swatch as pressed after selecting it', async () => {
    const user = userEvent.setup()
    render(<CategoryManagerModal {...defaultProps()} />)

    const verdeSwatch = screen.getByRole('button', { name: 'Selecionar cor Verde' })
    expect(verdeSwatch).toHaveAttribute('aria-pressed', 'false')

    await user.click(verdeSwatch)

    expect(verdeSwatch).toHaveAttribute('aria-pressed', 'true')
  })

  // ── Create payload ─────────────────────────────────────────────────────────

  it('calls createStockCategory with the entered name on submit', async () => {
    const user = userEvent.setup()
    render(<CategoryManagerModal {...defaultProps({ categories: [] })} />)

    await user.type(screen.getByLabelText(/Nome da categoria/i), 'Anestésicos')
    await user.click(screen.getByRole('button', { name: /Cadastrar categoria/i }))

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Anestésicos' }))
  })

  it('includes the selected color in the create payload', async () => {
    const user = userEvent.setup()
    render(<CategoryManagerModal {...defaultProps({ categories: [] })} />)

    await user.type(screen.getByLabelText(/Nome da categoria/i), 'Anestésicos')
    await user.click(screen.getByRole('button', { name: 'Selecionar cor Azul' }))
    await user.click(screen.getByRole('button', { name: /Cadastrar categoria/i }))

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Anestésicos', color: '#1E3A8A' }),
    )
  })

  // ── Edit: pre-fill ─────────────────────────────────────────────────────────

  it('pre-fills the name input when edit is clicked', async () => {
    const user = userEvent.setup()
    const category = buildCategory({ name: 'Descartáveis' })
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Editar categoria ${category.name}` }))

    expect(screen.getByLabelText(/Nome da categoria/i)).toHaveValue('Descartáveis')
  })

  it('marks the category color swatch as pressed when editing', async () => {
    const user = userEvent.setup()
    const category = buildCategory({ color: '#10B981' })
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Editar categoria ${category.name}` }))

    expect(screen.getByRole('button', { name: 'Selecionar cor Verde' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  // ── Update payload ─────────────────────────────────────────────────────────

  it('calls updateStockCategory with the new name on submit in edit mode', async () => {
    const user = userEvent.setup()
    const category = buildCategory({ name: 'Descartáveis' })
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Editar categoria ${category.name}` }))
    await user.clear(screen.getByLabelText(/Nome da categoria/i))
    await user.type(screen.getByLabelText(/Nome da categoria/i), 'Descartáveis v2')
    await user.click(screen.getByRole('button', { name: /Salvar alterações/i }))

    expect(mockUpdate).toHaveBeenCalledWith(
      category.id,
      expect.objectContaining({ name: 'Descartáveis v2' }),
    )
  })

  it('restores create mode when cancel edit is clicked', async () => {
    const user = userEvent.setup()
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Editar categoria ${category.name}` }))
    await user.click(screen.getByRole('button', { name: /Cancelar edição/i }))

    expect(screen.getByRole('button', { name: /Cadastrar categoria/i })).toBeInTheDocument()
  })

  // ── Category list ──────────────────────────────────────────────────────────

  it('renders category names in the list', () => {
    const categories = [
      buildCategory({ id: 'cat-1', name: 'Descartáveis' }),
      buildCategory({ id: 'cat-2', name: 'Anestésicos' }),
    ]
    render(<CategoryManagerModal {...defaultProps({ categories })} />)

    expect(screen.getByText('Descartáveis')).toBeInTheDocument()
    expect(screen.getByText('Anestésicos')).toBeInTheDocument()
  })

  it('renders the empty state when there are no categories', () => {
    render(<CategoryManagerModal {...defaultProps({ categories: [] })} />)

    expect(screen.getByText(/Nenhuma categoria cadastrada/i)).toBeInTheDocument()
  })

  // ── Delete ─────────────────────────────────────────────────────────────────

  it('calls deleteStockCategory with the category id when delete is confirmed', async () => {
    const user = userEvent.setup()
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Excluir categoria ${category.name}` }))
    await user.click(await screen.findByRole('button', { name: 'Excluir categoria' }))

    expect(mockDelete).toHaveBeenCalledWith(category.id)
  })

  it('shows the 409 conflict message when a linked category is deleted', async () => {
    const user = userEvent.setup()
    const conflictError = new ApiError('Conflict', 409, null)
    mockDelete.mockRejectedValue(conflictError)
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Excluir categoria ${category.name}` }))
    await user.click(await screen.findByRole('button', { name: 'Excluir categoria' }))

    expect(
      await screen.findByText(/Não é possível excluir uma categoria com produtos vinculados/i),
    ).toBeInTheDocument()
  })

  // ── Scrollbars ─────────────────────────────────────────────────────────────

  it('modal body has app-scrollbar', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    // Dialog renders into a portal — query against the full document
    const scrollAreas = document.querySelectorAll('.app-scrollbar')
    expect(scrollAreas.length).toBeGreaterThanOrEqual(1)
  })

  it('category list has app-scrollbar', () => {
    render(<CategoryManagerModal {...defaultProps()} />)

    // Both the modal body and the category list sub-scroll have app-scrollbar
    const scrollAreas = document.querySelectorAll('.app-scrollbar')
    expect(scrollAreas.length).toBeGreaterThanOrEqual(2)
  })

  // ── Close ──────────────────────────────────────────────────────────────────

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<CategoryManagerModal {...defaultProps({ onClose })} />)

    await user.click(screen.getByRole('button', { name: /Fechar gerenciamento de categorias/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('closes the delete dialog and does not delete when cancel is clicked', async () => {
    const user = userEvent.setup()
    const category = buildCategory()
    render(<CategoryManagerModal {...defaultProps({ categories: [category] })} />)

    await user.click(screen.getByRole('button', { name: `Excluir categoria ${category.name}` }))
    await user.click(await screen.findByRole('button', { name: /Cancelar/i }))

    expect(mockDelete).not.toHaveBeenCalled()
  })
})
