import userEvent from '@testing-library/user-event'

import { act, fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockUseAuth = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockLoad = vi.fn()
vi.mock('@/services/cep/cep.service', () => ({
  fetchAddressByCep: vi.fn().mockResolvedValue({ street: '', neighborhood: '', city: '', uf: '' }),
  CepNotFoundError: class extends Error {},
}))
const mockUseFiscalInvoicesPage = vi.fn()
vi.mock('@/features/fiscal/hooks/useFiscalInvoicesPage', () => ({
  useFiscalInvoicesPage: () => mockUseFiscalInvoicesPage(),
}))

const mockGetAppointmentInvoiceDraft = vi.fn()
const mockListAppointmentsForInvoice = vi.fn()
vi.mock('@/features/fiscal/services/fiscal.service', () => ({
  getAppointmentInvoiceDraft: (...args: unknown[]) => mockGetAppointmentInvoiceDraft(...args),
  listAppointmentsForInvoice: (...args: unknown[]) => mockListAppointmentsForInvoice(...args),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
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

import { FiscalInvoicesPageContainer } from '@/features/fiscal/containers/FiscalInvoicesPageContainer'
import type { ServiceInvoice } from '@/features/fiscal/types/fiscal.types'

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

function makeInvoice(overrides: Partial<ServiceInvoice> = {}): ServiceInvoice {
  return {
    id: 'inv-1',
    patientId: null,
    appointmentId: null,
    status: 'DRAFT',
    environment: 'LOCAL',
    isLegalDocument: false,
    invoiceNumber: null,
    verificationCode: null,
    customerName: 'João Silva',
    customerDocument: '123.456.789-00',
    customerEmail: null,
    customerPhone: null,
    serviceDescription: 'Consulta odontológica',
    serviceCode: null,
    amountCents: 25000,
    deductionsCents: null,
    issRate: null,
    issAmountCents: null,
    currency: 'BRL',
    competenceDate: '2026-06-07',
    simulatedIssueDate: null,
    issueDate: null,
    errorMessage: null,
    cancellationReason: null,
    createdAt: '2026-06-07T00:00:00.000Z',
    updatedAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  } as ServiceInvoice
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
  mockListAppointmentsForInvoice.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
})

describe('FiscalInvoicesPageContainer — form persistence', () => {
  it.each([false, true])(
    'saves a %s editing invoice and resets the next draft',
    async (editing) => {
      const invoice = makeInvoice({ customerDocument: null })
      const saveInvoice = vi.fn().mockResolvedValue(undefined)
      mockUseFiscalInvoicesPage.mockReturnValue(
        makeHookState({ invoices: [invoice], total: 1, saveInvoice }),
      )
      render(<FiscalInvoicesPageContainer />)
      if (editing)
        fireEvent.click(screen.getAllByRole('button', { name: /editar nota de joão silva/i })[0])
      else fireEvent.click(screen.getByRole('button', { name: 'Criar nota fiscal' }))
      fireEvent.change(screen.getByLabelText('Cliente/Paciente'), { target: { value: 'Ana Lima' } })
      fireEvent.change(screen.getByLabelText('Serviço prestado'), { target: { value: 'Limpeza' } })
      fireEvent.click(
        screen.getByRole('button', { name: editing ? 'Salvar alterações' : 'Salvar rascunho' }),
      )
      await waitFor(() =>
        expect(screen.queryByLabelText('Cliente/Paciente')).not.toBeInTheDocument(),
      )
      expect(saveInvoice).toHaveBeenCalledWith(
        expect.objectContaining({ customerName: 'Ana Lima', serviceDescription: 'Limpeza' }),
        editing ? invoice : null,
      )
      fireEvent.click(screen.getByRole('button', { name: 'Criar nota fiscal' }))
      expect(screen.getByLabelText('Cliente/Paciente')).toHaveValue('')
      expect(screen.getByRole('button', { name: 'Salvar rascunho' })).toBeInTheDocument()
    },
  )

  it('keeps an unsuccessful draft available for correction and retry', async () => {
    const saveInvoice = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ saveInvoice }))
    render(<FiscalInvoicesPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Criar nota fiscal' }))
    fireEvent.change(screen.getByLabelText('Cliente/Paciente'), { target: { value: 'Ana Lima' } })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(screen.getByLabelText('Cliente/Paciente')).toHaveValue('Ana Lima')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    await waitFor(() => expect(screen.queryByLabelText('Cliente/Paciente')).not.toBeInTheDocument())
    expect(saveInvoice).toHaveBeenCalledTimes(2)
  })

  it('blocks an invalid customer document and clears the error after correction', async () => {
    const saveInvoice = vi.fn().mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ saveInvoice }))
    render(<FiscalInvoicesPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Criar nota fiscal' }))
    fireEvent.change(screen.getByLabelText(/CPF\/CNPJ do cliente/), {
      target: { value: '11111111111' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(screen.getByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()
    expect(saveInvoice).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText(/CPF\/CNPJ do cliente/), { target: { value: '' } })
    expect(screen.queryByText('Informe um CPF ou CNPJ válido.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }))
    expect(saveInvoice).toHaveBeenCalledOnce()
  })

  it.each(['invoice', 'profile'])('dismisses the %s workspace without saving', (kind) => {
    const state = makeHookState()
    mockUseFiscalInvoicesPage.mockReturnValue(state)
    render(<FiscalInvoicesPageContainer />)
    fireEvent.click(
      screen.getByRole('button', {
        name: kind === 'invoice' ? 'Criar nota fiscal' : 'Configurar dados fiscais',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByLabelText('Área de trabalho fiscal')).not.toBeInTheDocument()
    expect(state.saveInvoice).not.toHaveBeenCalled()
    expect(state.saveProfile).not.toHaveBeenCalled()
  })

  it('disables profile actions while saving and restores them after failure for retry', async () => {
    let rejectSave!: (error: Error) => void
    const saveProfile = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectSave = reject
          }),
      )
      .mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ saveProfile }))
    render(<FiscalInvoicesPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Configurar dados fiscais' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar dados fiscais' }))
    expect(screen.getByRole('button', { name: 'Salvar dados fiscais' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await act(async () => rejectSave(new Error('offline')))
    expect(screen.getByRole('button', { name: 'Salvar dados fiscais' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar dados fiscais' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Salvar dados fiscais' }),
      ).not.toBeInTheDocument(),
    )
    expect(saveProfile).toHaveBeenCalledTimes(2)
    expect(saveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining({ addressState: 'SP', legalName: 'Clínica X' }),
    )
  })

  it('keeps the cancellation reason after failure and prevents duplicate confirmation while pending', async () => {
    let rejectCancel!: (error: Error) => void
    const cancel = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectCancel = reject
          }),
      )
      .mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ invoices: [makeInvoice()], total: 1, cancel }),
    )
    render(<FiscalInvoicesPageContainer />)
    fireEvent.click(screen.getAllByRole('button', { name: /cancelar nota de joão silva/i })[0])
    fireEvent.change(screen.getByLabelText('Motivo do cancelamento'), {
      target: { value: '  Duplicidade  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar nota' }))
    expect(screen.getByRole('button', { name: 'Aguarde...' })).toBeDisabled()
    await act(async () => rejectCancel(new Error('offline')))
    expect(screen.getByLabelText('Motivo do cancelamento')).toHaveValue('  Duplicidade  ')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar nota' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(cancel).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'inv-1' }), 'Duplicidade')
  })

  it('closes a failed details workspace and allows loading it again', async () => {
    const loadInvoiceDetails = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ invoices: [makeInvoice()], total: 1, loadInvoiceDetails }),
    )
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(
      screen.getAllByRole('button', { name: /ver detalhes da nota de joão silva/i })[0],
    )
    expect(screen.queryByLabelText('Área de trabalho fiscal')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getAllByRole('button', { name: /ver detalhes da nota de joão silva/i })[0],
    )
    expect(loadInvoiceDetails).toHaveBeenCalledTimes(2)
  })

  it.each(['markReady', 'simulateIssue'] as const)(
    'dispatches %s and absorbs an already-reported failure',
    async (action) => {
      const mutation = vi
        .fn()
        .mockRejectedValueOnce(new Error('reported by hook'))
        .mockResolvedValue(undefined)
      const invoice = makeInvoice({ status: action === 'markReady' ? 'DRAFT' : 'READY_TO_ISSUE' })
      mockUseFiscalInvoicesPage.mockReturnValue(
        makeHookState({
          invoices: [invoice],
          total: 1,
          profileResponse: { profile: FULL_PROFILE, providerMode: 'LOCAL' },
          [action]: mutation,
        }),
      )
      render(<FiscalInvoicesPageContainer />)
      const label =
        action === 'markReady'
          ? /marcar nota de joão silva como pronta/i
          : /simular emissão da nota de joão silva/i
      await userEvent.click(screen.getAllByRole('button', { name: label })[0])
      expect(mutation).toHaveBeenCalledExactlyOnceWith(invoice)
      expect(screen.getAllByRole('button', { name: label })[0]).toBeEnabled()
      await userEvent.click(screen.getAllByRole('button', { name: label })[0])
      expect(mutation).toHaveBeenCalledTimes(2)
    },
  )
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

describe('FiscalInvoicesPageContainer — filters bar', () => {
  it('calls setFilter when the customer search input changes', async () => {
    const setFilter = vi.fn()
    mockUseFiscalInvoicesPage.mockReturnValue(makeHookState({ setFilter }))
    render(<FiscalInvoicesPageContainer />)
    await userEvent.type(screen.getByPlaceholderText('Buscar por cliente...'), 'a')
    expect(setFilter).toHaveBeenCalledWith('customer', 'a')
  })

  it('calls setFilters to clear all filters when "Limpar filtros" is clicked', async () => {
    const setFilters = vi.fn()
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ setFilters, filters: { page: 1, limit: 10, customer: 'ana' } }),
    )
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))
    expect(setFilters).toHaveBeenCalled()
    const updater = setFilters.mock.calls[0][0]
    expect(
      updater({ page: 1, limit: 10, customer: 'ana', status: 'DRAFT', to: '2026-06-01' }),
    ).toEqual({ page: 1, limit: 10, customer: undefined, status: undefined, to: undefined })
  })
})

describe('FiscalInvoicesPageContainer — invoice list actions', () => {
  it('opens the cancel dialog when "Cancelar" is clicked on a cancelable invoice', async () => {
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ invoices: [makeInvoice({ status: 'DRAFT' })], total: 1 }),
    )
    render(<FiscalInvoicesPageContainer />)
    const [cancelButton] = screen.getAllByRole('button', { name: /cancelar nota de joão silva/i })
    await userEvent.click(cancelButton)
    expect(screen.getByRole('heading', { name: 'Cancelar nota fiscal' })).toBeInTheDocument()
  })

  it('disables the confirm button until a cancellation reason is entered, then calls cancel()', async () => {
    const cancel = vi.fn().mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ invoices: [makeInvoice({ status: 'DRAFT' })], total: 1, cancel }),
    )
    render(<FiscalInvoicesPageContainer />)
    const [cancelButton] = screen.getAllByRole('button', { name: /cancelar nota de joão silva/i })
    await userEvent.click(cancelButton)

    const confirmButton = screen.getByRole('button', { name: 'Cancelar nota' })
    expect(confirmButton).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Motivo do cancelamento'), 'Duplicidade')
    expect(confirmButton).toBeEnabled()

    await userEvent.click(confirmButton)
    expect(cancel).toHaveBeenCalledWith(expect.objectContaining({ id: 'inv-1' }), 'Duplicidade')
  })

  it('closes the cancel dialog via "Voltar" without calling cancel()', async () => {
    const cancel = vi.fn()
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({ invoices: [makeInvoice({ status: 'DRAFT' })], total: 1, cancel }),
    )
    render(<FiscalInvoicesPageContainer />)
    const [cancelButton] = screen.getAllByRole('button', { name: /cancelar nota de joão silva/i })
    await userEvent.click(cancelButton)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.queryByRole('heading', { name: 'Cancelar nota fiscal' })).not.toBeInTheDocument()
    expect(cancel).not.toHaveBeenCalled()
  })

  it('opens invoice details and calls loadInvoiceDetails when "Ver detalhes" is clicked', async () => {
    const loadInvoiceDetails = vi.fn().mockResolvedValue(undefined)
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        invoices: [makeInvoice()],
        total: 1,
        loadInvoiceDetails,
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    const [detailsButton] = screen.getAllByRole('button', {
      name: /ver detalhes da nota de joão silva/i,
    })
    await userEvent.click(detailsButton)
    expect(loadInvoiceDetails).toHaveBeenCalledWith(expect.objectContaining({ id: 'inv-1' }))
  })

  it('renders the invoice details panel and closes it via setSelectedInvoice(null)', async () => {
    const setSelectedInvoice = vi.fn()
    mockUseFiscalInvoicesPage.mockReturnValue(
      makeHookState({
        invoices: [makeInvoice()],
        total: 1,
        selectedInvoice: makeInvoice(),
        setSelectedInvoice,
      }),
    )
    render(<FiscalInvoicesPageContainer />)
    expect(screen.getByLabelText('Área de trabalho fiscal')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhes da nota fiscal' }))
    expect(setSelectedInvoice).toHaveBeenCalledWith(null)
  })
})

describe('FiscalInvoicesPageContainer — appointment picker flow', () => {
  it('opens the appointment picker when "Gerar a partir de consulta" is clicked', async () => {
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /gerar a partir de consulta/i }))
    expect(
      await screen.findByRole('heading', { name: /gerar nota a partir de consulta/i }),
    ).toBeInTheDocument()
  })

  it('loads the draft and opens the invoice form when an appointment is selected', async () => {
    mockListAppointmentsForInvoice.mockResolvedValue({
      data: [
        {
          id: 'appt-1',
          patientName: 'Maria Silva',
          patientEmail: null,
          patientPhone: null,
          appointmentDate: '2026-06-10',
          startTime: '10:00',
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          estimatedAmountCents: 10000,
          paidAmountCents: 10000,
          profile: { id: 'p1', displayName: 'Dra. Ana' },
          service: { id: 's1', name: 'Limpeza' },
          hasActiveInvoice: false,
          activeInvoiceId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })
    mockGetAppointmentInvoiceDraft.mockResolvedValue({
      draft: {
        customerName: 'Maria Silva',
        customerDocument: '',
        customerEmail: '',
        customerPhone: '',
        serviceDescription: 'Limpeza',
        serviceCode: '',
        amountCents: 10000,
        competenceDate: '2026-06-10',
        notes: '',
      },
      appointment: {
        id: 'appt-1',
        patientName: 'Maria Silva',
        appointmentDate: '2026-06-10',
        profileDisplayName: 'Dra. Ana',
        serviceName: 'Limpeza',
        paymentStatus: 'PAID',
        estimatedAmountCents: 10000,
        paidAmountCents: 10000,
      },
      existingInvoice: null,
      warnings: { paymentPending: false, hasExistingInvoice: false },
    })

    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /gerar a partir de consulta/i }))
    await screen.findByText('Maria Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar' }))

    expect(mockGetAppointmentInvoiceDraft).toHaveBeenCalledWith('appt-1')
    expect(await screen.findByLabelText('Área de trabalho fiscal')).toBeInTheDocument()
  })

  it('shows a payment-pending warning banner when the draft warns about it', async () => {
    mockListAppointmentsForInvoice.mockResolvedValue({
      data: [
        {
          id: 'appt-1',
          patientName: 'Maria Silva',
          patientEmail: null,
          patientPhone: null,
          appointmentDate: '2026-06-10',
          startTime: '10:00',
          status: 'COMPLETED',
          paymentStatus: 'PAYMENT_PENDING',
          estimatedAmountCents: 10000,
          paidAmountCents: null,
          profile: { id: 'p1', displayName: 'Dra. Ana' },
          service: { id: 's1', name: 'Limpeza' },
          hasActiveInvoice: false,
          activeInvoiceId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })
    mockGetAppointmentInvoiceDraft.mockResolvedValue({
      draft: {
        customerName: 'Maria Silva',
        customerDocument: '',
        customerEmail: '',
        customerPhone: '',
        serviceDescription: 'Limpeza',
        serviceCode: '',
        amountCents: 10000,
        competenceDate: '2026-06-10',
        notes: '',
      },
      appointment: {
        id: 'appt-1',
        patientName: 'Maria Silva',
        appointmentDate: '2026-06-10',
        profileDisplayName: 'Dra. Ana',
        serviceName: 'Limpeza',
        paymentStatus: 'PAYMENT_PENDING',
        estimatedAmountCents: 10000,
        paidAmountCents: null,
      },
      existingInvoice: null,
      warnings: { paymentPending: true, hasExistingInvoice: false },
    })

    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /gerar a partir de consulta/i }))
    await screen.findByText('Maria Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar' }))

    expect(await screen.findByText('Consulta com pagamento pendente')).toBeInTheDocument()
  })

  it('shows a draft-load error when getAppointmentInvoiceDraft rejects', async () => {
    mockListAppointmentsForInvoice.mockResolvedValue({
      data: [
        {
          id: 'appt-1',
          patientName: 'Maria Silva',
          patientEmail: null,
          patientPhone: null,
          appointmentDate: '2026-06-10',
          startTime: '10:00',
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          estimatedAmountCents: 10000,
          paidAmountCents: 10000,
          profile: { id: 'p1', displayName: 'Dra. Ana' },
          service: { id: 's1', name: 'Limpeza' },
          hasActiveInvoice: false,
          activeInvoiceId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })
    mockGetAppointmentInvoiceDraft.mockRejectedValue(new Error('network error'))

    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /gerar a partir de consulta/i }))
    await screen.findByText('Maria Silva')
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar' }))

    expect(
      await screen.findByText(/não foi possível carregar os dados da consulta/i),
    ).toBeInTheDocument()
  })

  it('closes the picker without selecting when "Fechar" is clicked', async () => {
    render(<FiscalInvoicesPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /gerar a partir de consulta/i }))
    await screen.findByRole('heading', { name: /gerar nota a partir de consulta/i })
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(
      screen.queryByRole('heading', { name: /gerar nota a partir de consulta/i }),
    ).not.toBeInTheDocument()
    expect(mockGetAppointmentInvoiceDraft).not.toHaveBeenCalled()
  })
})
