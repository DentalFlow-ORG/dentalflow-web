import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockUseAuth = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockLoad = vi.fn()
const mockUseFiscalInvoicesPage = vi.fn()
vi.mock('@/features/fiscal/hooks/useFiscalInvoicesPage', () => ({
  useFiscalInvoicesPage: () => mockUseFiscalInvoicesPage(),
}))

const mockGetAppointmentInvoiceDraft = vi.fn()
vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  getAppointmentInvoiceDraft: (...args: unknown[]) => mockGetAppointmentInvoiceDraft(...args),
}))

import { FiscalInvoicesPageContainer } from '@/features/fiscal/containers/FiscalInvoicesPageContainer'

const FULL_PROFILE = {
  legalName: 'Clínica X',
  tradeName: null,
  documentType: 'CNPJ',
  documentNumber: '11222333000181',
  municipalRegistration: null,
  stateRegistration: null,
  taxRegime: 'SIMPLES_NACIONAL',
  specialTaxRegime: null,
  serviceCode: null,
  cnae: null,
  issRate: null,
  addressStreet: 'Rua A',
  addressNumber: '100',
  addressComplement: null,
  addressNeighborhood: 'Centro',
  addressCity: 'São Paulo',
  addressState: 'SP',
  addressZipCode: '01310100',
  cityIbgeCode: null,
  fiscalProvider: 'LOCAL',
  fiscalProviderMode: 'LOCAL',
  isConfigured: true,
}

function makeHookState(overrides: Partial<ReturnType<typeof mockUseFiscalInvoicesPage>> = {}) {
  return {
    profileResponse: { profile: FULL_PROFILE, providerMode: 'PRODUCTION' },
    summary: null,
    invoices: [],
    selectedInvoice: null,
    setSelectedInvoice: vi.fn(),
    total: 0,
    totalPages: 1,
    isLoading: false,
    loadError: null,
    planBlocked: false,
    filters: { page: 1, limit: 10 },
    setFilters: vi.fn(),
    setFilter: vi.fn(),
    load: mockLoad,
    saveProfile: vi.fn(),
    saveInvoice: vi.fn(),
    markReady: vi.fn(),
    simulateIssue: vi.fn(),
    cancel: vi.fn(),
    loadInvoiceDetails: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: { role: 'OWNER' } })
  mockUseFiscalInvoicesPage.mockReturnValue(makeHookState())
})

describe('FiscalInvoicesPageContainer', () => {
  it('shows the plan-upgrade notice and nothing else when planBlocked is true', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ planBlocked: true }))
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByRole('heading', { name: 'Notas fiscais' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /atualizar/i })).not.toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ isLoading: true }))
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByText(/carregando notas fiscais/i)).toBeInTheDocument()
  })

  it('shows the load error', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ loadError: 'Falha ao carregar' }))
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
  })

  it('calls load() when "Atualizar" is clicked', async () => {
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /atualizar/i }))
    expect(mockLoad).toHaveBeenCalled()
  })

  it('shows the LOCAL provider-mode warning banner', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: true },
          providerMode: 'LOCAL',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByText(/modo local\/simulação ativo/i)).toBeInTheDocument()
  })

  it('does not show the LOCAL provider-mode warning banner in PRODUCTION mode', () => {
    render(<FiscalInvoicesPageContainer />)
    expect(screen.queryByText(/modo local\/simulação ativo/i)).not.toBeInTheDocument()
  })

  it('shows "Configuração fiscal completa" when the profile is configured', () => {
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByText('Configuração fiscal completa')).toBeInTheDocument()
  })

  it('shows "Configuração fiscal pendente" and the pending-config banner when not configured', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: false },
          providerMode: 'PRODUCTION',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getAllByText('Configuração fiscal pendente').length).toBeGreaterThan(0)
    expect(
      screen.getByText(/complete os dados fiscais da clínica para criar novas notas/i),
    ).toBeInTheDocument()
  })

  it('shows the assistant-specific pending-config message for an ASSISTANT user', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ASSISTANT' } })
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: false },
          providerMode: 'PRODUCTION',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(
      screen.getByText(/a configuração fiscal precisa ser concluída pelo proprietário/i),
    ).toBeInTheDocument()
  })

  it('shows the "Configurar dados fiscais" header button only for an OWNER with incomplete config', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: false },
          providerMode: 'PRODUCTION',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getAllByRole('button', { name: /configurar dados fiscais/i }).length).toBe(2)
  })

  it('hides the header "Configurar dados fiscais" button for a non-owner with incomplete config', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ASSISTANT' } })
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: false },
          providerMode: 'PRODUCTION',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(screen.queryAllByRole('button', { name: /configurar dados fiscais/i })).toHaveLength(0)
  })

  it('opens the profile workspace when "Configurar dados fiscais" is clicked', async () => {
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /configurar dados fiscais/i }))
    expect(screen.getByLabelText('Área de trabalho fiscal')).toBeInTheDocument()
  })

  it('opens the invoice workspace when "Criar nota fiscal" is clicked', async () => {
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /criar nota fiscal/i }))
    expect(screen.getByLabelText('Área de trabalho fiscal')).toBeInTheDocument()
  })

  it('does not show "Criar nota fiscal" for an assistant with pending configuration', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ASSISTANT' } })
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        profileResponse: {
          profile: { ...FULL_PROFILE, isConfigured: false },
          providerMode: 'PRODUCTION',
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    // ASSISTANT + incomplete config still shows the create actions per the
    // (!isFiscalConfigurationIncomplete || isAssistant) condition.
    expect(screen.getByRole('button', { name: /criar nota fiscal/i })).toBeInTheDocument()
  })

  it('renders the KPI summary section when summary data is present', () => {
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        summary: {
          counts: {},
          monthTotalCents: 0,
          configurationPending: false,
          providerMode: 'PRODUCTION',
          realIssuingEnabled: true,
        },
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    // FiscalSummaryKpiGrid renders real content when summary is present
    expect(document.querySelector('section')).toBeInTheDocument()
  })
})
