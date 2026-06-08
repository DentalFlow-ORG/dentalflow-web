import { render, screen, userEvent } from '@/test-utils/render-utils'

import { AppointmentServiceValueSection } from '@/features/scheduling/components/appointments/AppointmentServiceValueSection'
import type { ProfileService } from '@/features/scheduling/types/profile.types'

function makeService(overrides: Partial<ProfileService> = {}): ProfileService {
  return {
    id: 'svc-1',
    profileId: 'prof-1',
    clinicId: 'clinic-1',
    name: 'Limpeza dental',
    description: null,
    durationMinutes: 60,
    priceFrom: null,
    priceTo: null,
    isPriceDisplayed: true,
    isActive: true,
    displayOrder: 0,
    estimatedDirectCostCents: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const baseProps = {
  services: [],
  serviceId: '',
  isSelectDisabled: false,
  isSubmitting: false,
  estimatedAmount: '',
  estimateManuallyEdited: false,
  onServiceChange: vi.fn(),
  onAmountChange: vi.fn(),
  onAmountManuallyEdited: vi.fn(),
  onAmountRestored: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Service section ───────────────────────────────────────────────────────────

describe('AppointmentServiceValueSection — service label', () => {
  it('renders the Serviço label', () => {
    render(<AppointmentServiceValueSection {...baseProps} />)
    expect(screen.getByText('Serviço')).toBeInTheDocument()
  })

  it('shows "Selecione um profissional primeiro" placeholder when noProfessionalHint', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        noProfessionalHint
      />,
    )
    // Placeholder text is inside the SelectValue — look for it in the DOM
    expect(screen.getByText(/Selecione um profissional primeiro/i)).toBeInTheDocument()
  })

  it('shows "Nenhum serviço cadastrado" placeholder when services is empty', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[]}
      />,
    )
    expect(screen.getByText(/Nenhum serviço cadastrado/i)).toBeInTheDocument()
  })

  it('shows loading placeholder when isLoading', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[makeService()]}
        isLoading
      />,
    )
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument()
  })
})

// ── Estimated amount section ──────────────────────────────────────────────────

describe('AppointmentServiceValueSection — estimated amount', () => {
  it('renders the estimated amount field by default', () => {
    render(<AppointmentServiceValueSection {...baseProps} />)
    expect(screen.getByLabelText(/Valor previsto/i)).toBeInTheDocument()
  })

  it('hides the estimated amount field when showEstimatedAmount is false', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        showEstimatedAmount={false}
      />,
    )
    expect(screen.queryByLabelText(/Valor previsto/i)).not.toBeInTheDocument()
  })

  it('calls onAmountChange and onAmountManuallyEdited when the amount is edited', async () => {
    const user = userEvent.setup()
    const onAmountChange = vi.fn()
    const onAmountManuallyEdited = vi.fn()
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        onAmountChange={onAmountChange}
        onAmountManuallyEdited={onAmountManuallyEdited}
      />,
    )
    await user.type(screen.getByLabelText(/Valor previsto/i), '1')
    expect(onAmountChange).toHaveBeenCalled()
    expect(onAmountManuallyEdited).toHaveBeenCalled()
  })
})

// ── Restore button ────────────────────────────────────────────────────────────

describe('AppointmentServiceValueSection — restore button', () => {
  const serviceWithPrice = makeService({ id: 'svc-1', priceFrom: 150 })

  it('shows restore button when estimateManuallyEdited, serviceId set, and service has priceFrom', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[serviceWithPrice]}
        serviceId="svc-1"
        estimateManuallyEdited
      />,
    )
    expect(screen.getByRole('button', { name: /Restaurar valor do serviço/i })).toBeInTheDocument()
  })

  it('does not show restore button when estimateManuallyEdited is false', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[serviceWithPrice]}
        serviceId="svc-1"
        estimateManuallyEdited={false}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Restaurar valor do serviço/i }),
    ).not.toBeInTheDocument()
  })

  it('does not show restore button when service has no priceFrom', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[makeService({ id: 'svc-1', priceFrom: null })]}
        serviceId="svc-1"
        estimateManuallyEdited
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Restaurar valor do serviço/i }),
    ).not.toBeInTheDocument()
  })

  it('calls onAmountChange and onAmountRestored when restore is clicked', async () => {
    const user = userEvent.setup()
    const onAmountChange = vi.fn()
    const onAmountRestored = vi.fn()
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[serviceWithPrice]}
        serviceId="svc-1"
        estimateManuallyEdited
        onAmountChange={onAmountChange}
        onAmountRestored={onAmountRestored}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Restaurar valor do serviço/i }))
    expect(onAmountChange).toHaveBeenCalledWith('150,00')
    expect(onAmountRestored).toHaveBeenCalledTimes(1)
  })

  it('shows the service price in the restore button label', () => {
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[makeService({ id: 'svc-1', priceFrom: 249.9 })]}
        serviceId="svc-1"
        estimateManuallyEdited
      />,
    )
    expect(screen.getByRole('button', { name: /249,90/i })).toBeInTheDocument()
  })
})

// ── showNoServiceOption ───────────────────────────────────────────────────────

describe('AppointmentServiceValueSection — showNoServiceOption', () => {
  it('displays "Sem serviço" in the trigger when showNoServiceOption is true and no service is selected', () => {
    // When showNoServiceOption=true and serviceId='', the sentinel value is used,
    // which renders "Sem serviço" as the displayed value in the SelectTrigger.
    render(
      <AppointmentServiceValueSection
        {...baseProps}
        services={[makeService()]}
        serviceId=""
        showNoServiceOption
      />,
    )
    expect(screen.getByText('Sem serviço')).toBeInTheDocument()
  })
})
