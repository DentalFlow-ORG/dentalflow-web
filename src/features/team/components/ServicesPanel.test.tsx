import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import { ApiError } from '@/services/http'
import { ServicesPanel, emptyForm, toCreateDto, toUpdateDto } from './ServicesPanel'
import type { ServiceItem } from '../types/team.types'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockCreateService = vi.fn()
const mockUpdateService = vi.fn()
const mockDeleteService = vi.fn()
const mockShowAlert = vi.fn()

vi.mock('../services/team.service', () => ({
  createService: (...args: unknown[]) => mockCreateService(...args),
  updateService: (...args: unknown[]) => mockUpdateService(...args),
  deleteService: (...args: unknown[]) => mockDeleteService(...args),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// Avoid Radix UI Portal issues in jsdom — render a minimal dialog substitute
vi.mock('@/components/common/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    onConfirm,
    confirmLabel,
  }: {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    confirmLabel: string
    cancelLabel?: string
    title?: string
    description?: ReactNode
    subject?: string
    tone?: string
    isConfirming?: boolean
  }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseService: ServiceItem = {
  id: 'svc-1',
  profileId: 'prof-1',
  clinicId: 'clinic-1',
  name: 'Limpeza',
  description: null,
  priceFrom: null,
  priceTo: null,
  durationMinutes: null,
  isPriceDisplayed: true,
  isActive: true,
  displayOrder: 0,
  estimatedDirectCostCents: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const serviceWithCost: ServiceItem = { ...baseService, estimatedDirectCostCents: 3000 }

function renderPanel(props: Partial<Parameters<typeof ServicesPanel>[0]> = {}) {
  return renderWithProviders(
    <ServicesPanel
      profileId="prof-1"
      services={[]}
      onServicesChange={vi.fn()}
      {...props}
    />,
  )
}

// ── readOnly rendering ────────────────────────────────────────────────────────

describe('ServicesPanel — readOnly rendering', () => {
  beforeEach(() => vi.clearAllMocks())

  it('OWNER mode shows "Adicionar" button', () => {
    renderPanel({ services: [baseService] })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('OWNER mode shows edit and delete controls', () => {
    renderPanel({ services: [baseService] })
    expect(screen.getByRole('button', { name: /Editar serviço/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Remover serviço/i })).toBeInTheDocument()
  })

  it('OWNER mode shows "Custo direto" line in the row', () => {
    renderPanel({ services: [baseService] })
    // The row span contains "Custo direto:" (with colon); the panel subtitle does not
    expect(screen.getByText(/Custo direto:/i, { selector: 'span' })).toBeInTheDocument()
  })

  it('readOnly hides "Adicionar" button', () => {
    renderPanel({ services: [baseService], readOnly: true })
    expect(screen.queryByRole('button', { name: /Adicionar/i })).not.toBeInTheDocument()
  })

  it('readOnly hides edit and delete controls', () => {
    renderPanel({ services: [baseService], readOnly: true })
    expect(screen.queryByRole('button', { name: /Editar serviço/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remover serviço/i })).not.toBeInTheDocument()
  })

  it('readOnly hides "Custo direto" line', () => {
    renderPanel({ services: [serviceWithCost], readOnly: true })
    expect(screen.queryByText(/Custo direto:/i, { selector: 'span' })).not.toBeInTheDocument()
  })

  it('readOnly with services shows "Visualização apenas" notice', () => {
    renderPanel({ services: [baseService], readOnly: true })
    expect(screen.getByText(/Visualização apenas/i)).toBeInTheDocument()
  })

  it('readOnly with no services does not show the read-only notice', () => {
    renderPanel({ services: [], readOnly: true })
    expect(screen.queryByText(/Visualização apenas/i)).not.toBeInTheDocument()
  })

  it('empty list shows empty-state text and "Adicionar" button', () => {
    renderPanel({ services: [] })
    expect(screen.getByText(/Nenhum procedimento cadastrado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })
})

// ── toCreateDto — pure unit tests ─────────────────────────────────────────────

describe('ServicesPanel — toCreateDto', () => {
  it('omits blank optional fields (no null on create)', () => {
    const dto = toCreateDto({ ...emptyForm(), name: 'Consulta' })
    expect(dto.name).toBe('Consulta')
    expect('description' in dto).toBe(false)
    expect('priceFrom' in dto).toBe(false)
    expect('priceTo' in dto).toBe(false)
    expect('durationMinutes' in dto).toBe(false)
    expect('estimatedDirectCostCents' in dto).toBe(false)
  })

  it('converts cost "30,00" to estimatedDirectCostCents: 3000', () => {
    const dto = toCreateDto({
      ...emptyForm(),
      name: 'Limpeza',
      estimatedDirectCostCents: '30,00',
    })
    expect(dto.estimatedDirectCostCents).toBe(3000)
  })
})

// ── toUpdateDto — pure unit tests ─────────────────────────────────────────────

describe('ServicesPanel — toUpdateDto', () => {
  it('sends null when cost is cleared', () => {
    const dto = toUpdateDto({
      ...emptyForm(),
      name: 'Limpeza',
      estimatedDirectCostCents: '',
    })
    expect(dto.estimatedDirectCostCents).toBeNull()
  })

  it('sends null when description is cleared', () => {
    const dto = toUpdateDto({ ...emptyForm(), name: 'Limpeza', description: '' })
    expect(dto.description).toBeNull()
  })

  it('converts cost "45,00" to estimatedDirectCostCents: 4500', () => {
    const dto = toUpdateDto({
      ...emptyForm(),
      name: 'Limpeza',
      estimatedDirectCostCents: '45,00',
    })
    expect(dto.estimatedDirectCostCents).toBe(4500)
  })
})

// ── Error classification (async, via UI) ──────────────────────────────────────

describe('ServicesPanel — error classification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateService.mockResolvedValue({ ...baseService })
    mockDeleteService.mockResolvedValue(undefined)
  })

  it('shows permission message when createService returns 403', async () => {
    mockCreateService.mockRejectedValue(new ApiError('Forbidden', 403, {}))
    const user = userEvent.setup()
    renderPanel({ services: [] })

    await user.click(screen.getByRole('button', { name: /Adicionar/i }))
    await user.type(screen.getByLabelText('Nome'), 'Limpeza')
    await user.click(screen.getByRole('button', { name: /Adicionar serviço/i }))

    expect(
      await screen.findByText(/Você não tem permissão para gerenciar serviços/i),
    ).toBeInTheDocument()
  })

  it('shows linked-records message when deleteService returns 409', async () => {
    mockDeleteService.mockRejectedValue(new ApiError('Conflict', 409, {}))
    const user = userEvent.setup()
    renderPanel({ services: [baseService] })

    await user.click(screen.getByRole('button', { name: /Remover serviço/i }))
    await user.click(screen.getByRole('button', { name: 'Remover' }))

    expect(
      await screen.findByText(/registros vinculados/i),
    ).toBeInTheDocument()
  })
})
