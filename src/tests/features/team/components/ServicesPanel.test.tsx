import type { ReactNode } from 'react'

import { render, screen, userEvent, waitFor, within } from '@/test-utils/render-utils'

import { ServicesPanel } from '@/features/team/components/ServicesPanel'
import type { ServiceItem } from '@/features/team/types/team.types'
import { createService, deleteService, updateService } from '@/features/team/services/team.service'

const mocks = vi.hoisted(() => ({
  showAlert: vi.fn(),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mocks.showAlert }),
}))

vi.mock('@/components/common/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    subject,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    isConfirming,
  }: {
    open: boolean
    title: string
    description?: ReactNode
    subject?: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    isConfirming?: boolean
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {subject && <p>{subject}</p>}
        {description && <p>{description}</p>}
        <button type="button" disabled={isConfirming} onClick={onConfirm}>
          {confirmLabel}
        </button>
        {cancelLabel && (
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
      </div>
    ) : null,
}))

vi.mock('@/features/team/services/team.service', () => ({
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}))

function makeService(overrides: Partial<ServiceItem> = {}): ServiceItem {
  return {
    id: 'service-1',
    profileId: 'profile-1',
    clinicId: 'clinic-1',
    name: 'Clareamento dental',
    description: 'Procedimento estético com acompanhamento profissional.',
    priceFrom: 180,
    priceTo: 320,
    durationMinutes: 60,
    isPriceDisplayed: true,
    isActive: true,
    displayOrder: 1,
    estimatedDirectCostCents: 4500,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function renderPanel(
  overrides: Partial<{
    services: ServiceItem[]
    onServicesChange: (services: ServiceItem[]) => void
    readOnly: boolean
  }> = {},
) {
  const props = {
    profileId: 'profile-1',
    services: [makeService()],
    onServicesChange: vi.fn(),
    readOnly: false,
    ...overrides,
  }

  render(<ServicesPanel {...props} />)

  return props
}

describe('ServicesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders service identity, status, price, duration, and owner-only direct cost', () => {
    renderPanel({
      services: [
        makeService(),
        makeService({
          id: 'service-2',
          name: 'Consulta inicial',
          description: null,
          priceFrom: null,
          priceTo: null,
          durationMinutes: 30,
          isActive: false,
          displayOrder: 2,
          estimatedDirectCostCents: null,
        }),
      ],
    })

    expect(screen.getByText('Clareamento dental')).toBeInTheDocument()
    expect(screen.getByText(/procedimento estético/i)).toBeInTheDocument()
    expect(screen.getByText('Consulta inicial')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText(/180/)).toHaveTextContent(/320/)
    expect(screen.getAllByText(/custo direto:/i)).toHaveLength(2)
    expect(screen.getByText('R$ 45,00')).toBeInTheDocument()
  })

  it('hides create, edit, delete, and direct cost controls in read-only mode', () => {
    renderPanel({ readOnly: true })

    expect(screen.getByText(/visualização apenas/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /adicionar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar serviço/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remover serviço/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/custo direto:/i)).not.toBeInTheDocument()
  })

  it('shows create, edit, and delete controls when the panel is editable', () => {
    renderPanel()

    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar serviço clareamento dental/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remover serviço clareamento dental/i })).toBeInTheDocument()
  })

  it('opens a prefilled edit form and closes it on cancel', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: /editar serviço clareamento dental/i }))

    expect(screen.getByRole('textbox', { name: /nome/i })).toHaveValue('Clareamento dental')
    expect(screen.getByRole('textbox', { name: /descrição/i })).toHaveValue(
      'Procedimento estético com acompanhamento profissional.',
    )
    expect(screen.getByLabelText(/duração/i)).toHaveValue('60')
    expect(screen.getByLabelText(/preço a partir/i)).toHaveValue('180,00')
    expect(screen.getByLabelText(/preço até/i)).toHaveValue('320,00')
    expect(screen.getByLabelText(/custo direto estimado/i)).toHaveValue('45,00')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByRole('textbox', { name: /nome/i })).not.toBeInTheDocument()
    expect(screen.getByText('Clareamento dental')).toBeInTheDocument()
  })

  it('creates a service with the same payload shape as the form helpers', async () => {
    const user = userEvent.setup()
    const created = makeService({ id: 'service-created', name: 'Profilaxia' })
    vi.mocked(createService).mockResolvedValue(created)
    const onServicesChange = vi.fn()

    renderPanel({ services: [], onServicesChange })

    await user.click(screen.getByRole('button', { name: /adicionar/i }))
    await user.type(screen.getByRole('textbox', { name: /nome/i }), 'Profilaxia')
    await user.type(screen.getByRole('textbox', { name: /descrição/i }), 'Limpeza preventiva')
    await user.type(screen.getByLabelText(/duração/i), '45')
    await user.type(screen.getByLabelText(/preço a partir/i), '120,00')
    await user.type(screen.getByLabelText(/preço até/i), '180,00')
    await user.type(screen.getByLabelText(/custo direto estimado/i), '25,50')
    await user.click(screen.getByLabelText(/serviço ativo/i))
    await user.click(screen.getByRole('button', { name: /adicionar serviço/i }))

    await waitFor(() =>
      expect(createService).toHaveBeenCalledWith('profile-1', {
        name: 'Profilaxia',
        description: 'Limpeza preventiva',
        priceFrom: 120,
        priceTo: 180,
        durationMinutes: 45,
        isActive: false,
        estimatedDirectCostCents: 2550,
      }),
    )
    expect(onServicesChange).toHaveBeenCalledWith([created])
  })

  it('updates a service with the unchanged update payload shape', async () => {
    const user = userEvent.setup()
    const service = makeService()
    const updated = makeService({ name: 'Clareamento supervisionado' })
    vi.mocked(updateService).mockResolvedValue(updated)
    const onServicesChange = vi.fn()

    renderPanel({ services: [service], onServicesChange })

    await user.click(screen.getByRole('button', { name: /editar serviço clareamento dental/i }))
    const nameInput = screen.getByRole('textbox', { name: /nome/i })
    await user.clear(nameInput)
    await user.type(nameInput, 'Clareamento supervisionado')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(updateService).toHaveBeenCalledWith('profile-1', 'service-1', {
        name: 'Clareamento supervisionado',
        description: 'Procedimento estético com acompanhamento profissional.',
        priceFrom: 180,
        priceTo: 320,
        durationMinutes: 60,
        isActive: true,
        estimatedDirectCostCents: 4500,
      }),
    )
    expect(onServicesChange).toHaveBeenCalledWith([updated])
  })

  it('confirms deletion and calls the existing delete flow', async () => {
    const user = userEvent.setup()
    vi.mocked(deleteService).mockResolvedValue(undefined)
    const onServicesChange = vi.fn()
    const services = [
      makeService(),
      makeService({ id: 'service-2', name: 'Consulta inicial', displayOrder: 2 }),
    ]

    renderPanel({ services, onServicesChange })

    await user.click(screen.getByRole('button', { name: /remover serviço clareamento dental/i }))
    const dialog = screen.getByRole('dialog', { name: /remover serviço/i })
    expect(within(dialog).getByText('Clareamento dental')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /remover/i }))

    await waitFor(() => expect(deleteService).toHaveBeenCalledWith('profile-1', 'service-1'))
    expect(onServicesChange).toHaveBeenCalledWith([services[1]])
  })

  it('keeps the add form reset when canceling and reopening', async () => {
    const user = userEvent.setup()
    renderPanel({ services: [] })

    await user.click(screen.getByRole('button', { name: /adicionar/i }))
    await user.type(screen.getByRole('textbox', { name: /nome/i }), 'Serviço temporário')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    await user.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(screen.getByRole('textbox', { name: /nome/i })).toHaveValue('')
  })
})
