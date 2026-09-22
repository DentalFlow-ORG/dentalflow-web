import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { CLINIC_FILTER_DEFS } from '@/features/admin/constants/admin-display'
import { AdminClinicsPageContainer } from '@/features/admin/containers/AdminClinicsPageContainer'
import type { AdminClinic, ClinicHealthRow } from '@/features/admin/types/admin.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

const mockUseAdminClinicsPage = vi.fn()
vi.mock('@/features/admin/hooks/useAdminClinicsPage', () => ({
  useAdminClinicsPage: () => mockUseAdminClinicsPage(),
}))

const mockUseClinicsHealth = vi.fn()
vi.mock('@/features/admin/hooks/useClinicsHealth', () => ({
  useClinicsHealth: () => mockUseClinicsHealth(),
}))

vi.mock('@/features/admin/services/admin-clinics.service', () => ({
  createAdminClinic: vi.fn(),
  updateAdminClinic: vi.fn(),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeClinic(overrides: Partial<AdminClinic> = {}): AdminClinic {
  return {
    id: 'clinic-1',
    name: 'Clínica Demo',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeHealthRow(overrides: Partial<ClinicHealthRow> = {}): ClinicHealthRow {
  return {
    clinic: { id: 'clinic-1', name: 'Clínica Demo', isActive: true },
    subscription: { status: 'ACTIVE', planName: 'Profissional', trialEndsAt: null },
    counts: { dentists: 2, activeUsers: 3, totalAppointments: 50, recentAppointments: 5 },
    lastActivity: { timestamp: new Date().toISOString(), source: 'USER_LOGIN' },
    compliance: { fiscalSetupComplete: true },
    ...overrides,
  }
}

function makeDefaultHealthState(overrides = {}) {
  return {
    rows: [],
    isLoading: false,
    loadError: null,
    load: vi.fn(),
    ...overrides,
  }
}

function makeDefaultHookState(overrides = {}) {
  return {
    clinics: [],
    allClinics: [],
    isLoading: false,
    loadError: null,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeFilters: {},
    setFilter: vi.fn(),
    clearAll: vi.fn(),
    page: 1,
    setPage: vi.fn(),
    totalPages: 1,
    filteredCount: 0,
    pageSize: 10,
    setPageSize: vi.fn(),
    filterDefs: CLINIC_FILTER_DEFS,
    formatDate: (v?: string) => v ?? '—',
    createOpen: false,
    setCreateOpen: vi.fn(),
    editTarget: null,
    setEditTarget: vi.fn(),
    deleteTarget: null,
    setDeleteTarget: vi.fn(),
    isDeleting: false,
    load: vi.fn(),
    handleCreateSuccess: vi.fn(),
    handleEditSuccess: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseAdminClinicsPage.mockReturnValue(makeDefaultHookState())
  mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — header', () => {
  it('renders "Clínicas da plataforma" as the page heading', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('heading', { name: /clínicas da plataforma/i })).toBeInTheDocument()
  })

  it('renders the "Administração" eyebrow label', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('renders the "Nova clínica" action button', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByRole('button', { name: /nova clínica/i }).length).toBeGreaterThanOrEqual(
      1,
    )
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — KPI cards', () => {
  it('renders all three KPI labels', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Total clínicas')).toBeInTheDocument()
    expect(screen.getByText('Ativas')).toBeInTheDocument()
    expect(screen.getByText('Inativas')).toBeInTheDocument()
  })

  it('shows "0" for all counts when allClinics is empty', () => {
    render(<AdminClinicsPageContainer />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3)
  })

  it('counts total clinics correctly', () => {
    const clinic = makeClinic()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [clinic], clinics: [clinic], filteredCount: 1 }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })

  it('counts active clinics — undefined isActive treated as active', () => {
    const explicit = makeClinic({ id: 'c1', isActive: true })
    const implicit = makeClinic({ id: 'c2', isActive: undefined })
    const inactive = makeClinic({ id: 'c3', isActive: false })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        allClinics: [explicit, implicit, inactive],
        clinics: [explicit, implicit, inactive],
        filteredCount: 3,
      }),
    )
    render(<AdminClinicsPageContainer />)
    // Total=3, Ativas=2 (true + undefined), Inativas=1
    // "2" should appear as the Ativas KPI value
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
  })

  it('counts inactive clinics — only explicit false counts as inactive', () => {
    const active = makeClinic({ id: 'c1', isActive: true })
    const inactive = makeClinic({ id: 'c2', isActive: false })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        allClinics: [active, inactive],
        clinics: [active, inactive],
        filteredCount: 2,
      }),
    )
    render(<AdminClinicsPageContainer />)
    // Total=2, Ativas=1, Inativas=1 — "1" appears multiple times
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })
})

// ── Section ───────────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — section', () => {
  it('renders the "Clínicas cadastradas" section heading', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('heading', { name: /clínicas cadastradas/i })).toBeInTheDocument()
  })
})

// ── Empty state ───────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — empty state', () => {
  it('renders "Nenhuma clínica encontrada" when allClinics is empty', () => {
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Nenhuma clínica encontrada')).toBeInTheDocument()
  })

  it('renders a "Nova clínica" button inside the empty state', () => {
    render(<AdminClinicsPageContainer />)
    const buttons = screen.getAllByRole('button', { name: /nova clínica/i })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Clinic list ───────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — clinic list', () => {
  it('renders clinic name when clinics are present', () => {
    const clinic = makeClinic({ name: 'Clínica Odonto Plus' })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [clinic], clinics: [clinic], filteredCount: 1 }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Clínica Odonto Plus').length).toBeGreaterThan(0)
  })

  it('renders "Ativa" status badge for active clinic', () => {
    const clinic = makeClinic({ isActive: true })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [clinic], clinics: [clinic], filteredCount: 1 }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0)
  })

  it('renders "Inativa" status badge for inactive clinic', () => {
    const clinic = makeClinic({ isActive: false })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [clinic], clinics: [clinic], filteredCount: 1 }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Inativa').length).toBeGreaterThan(0)
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — error state', () => {
  it('shows error message when load fails', () => {
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ loadError: 'Não foi possível carregar as clínicas.' }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Não foi possível carregar as clínicas.')).toBeInTheDocument()
  })
})

// ── Saúde das clínicas ────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — Saúde das clínicas', () => {
  it.each([null, {}])(
    'shows missing subscription information for %j on desktop and mobile',
    (subscription) => {
      mockUseClinicsHealth.mockReturnValue(
        makeDefaultHealthState({ rows: [makeHealthRow({ subscription })] }),
      )
      render(<AdminClinicsPageContainer />)
      expect(screen.getAllByText('Sem assinatura')).toHaveLength(2)
    },
  )

  it('shows the last trial day in singular on desktop and mobile', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [
          makeHealthRow({
            subscription: {
              status: 'TRIALING',
              trialEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            },
          }),
        ],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('1 dia restante de trial')).toHaveLength(2)
  })

  it('renders the section heading and fetched clinic health rows', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ clinic: { id: 'c1', name: 'Clínica X' } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('heading', { name: /saúde das clínicas/i })).toBeInTheDocument()
    expect(screen.getAllByText('Clínica X').length).toBeGreaterThan(0)
  })

  it('shows the loading state while health data is loading', () => {
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState({ isLoading: true }))
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText(/carregando saúde das clínicas/i)).toBeInTheDocument()
  })

  it('shows the error state when the health fetch fails', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({ loadError: 'Não foi possível carregar a saúde das clínicas.' }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Não foi possível carregar a saúde das clínicas.')).toBeInTheDocument()
  })

  it('shows the empty state when there are no health rows', () => {
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState({ rows: [] }))
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Nenhum dado de saúde disponível')).toBeInTheDocument()
  })

  it('renders the payment issue flag for a PAST_DUE subscription', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ subscription: { status: 'PAST_DUE', trialEndsAt: null } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Pagamento em atraso').length).toBeGreaterThan(0)
  })

  it('renders the payment issue flag for an UNPAID subscription', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ subscription: { status: 'UNPAID', trialEndsAt: null } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Pagamento em atraso').length).toBeGreaterThan(0)
  })

  it('renders the trial-ending-soon flag when the trial ends within 7 days', () => {
    const soon = new Date(Date.now() + 3 * 86_400_000).toISOString()
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ subscription: { status: 'TRIALING', trialEndsAt: soon } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Trial acabando').length).toBeGreaterThan(0)
  })

  it('renders the no-dentists flag when dentists count is zero', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [
          makeHealthRow({
            counts: { dentists: 0, activeUsers: 1, totalAppointments: 5, recentAppointments: 1 },
          }),
        ],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Sem dentistas').length).toBeGreaterThan(0)
  })

  it('renders the no-recent-appointments flag when recentAppointments is zero', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [
          makeHealthRow({
            counts: { dentists: 1, activeUsers: 1, totalAppointments: 5, recentAppointments: 0 },
          }),
        ],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Sem consultas recentes').length).toBeGreaterThan(0)
  })

  it('renders the incomplete-fiscal-setup flag when fiscalSetupComplete is false', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ compliance: { fiscalSetupComplete: false } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Configuração fiscal incompleta').length).toBeGreaterThan(0)
  })

  it('renders the incomplete-fiscal-setup flag when fiscalSetupComplete is null', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ compliance: { fiscalSetupComplete: null } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Configuração fiscal incompleta').length).toBeGreaterThan(0)
  })

  it('renders the no-recent-activity flag when there is no last activity', () => {
    mockUseClinicsHealth.mockReturnValue(
      makeDefaultHealthState({
        rows: [makeHealthRow({ lastActivity: { timestamp: null, source: null } })],
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Sem atividade recente').length).toBeGreaterThan(0)
  })

  it('shows "Sem sinais de risco" for a healthy clinic with no flags', () => {
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState({ rows: [makeHealthRow()] }))
    render(<AdminClinicsPageContainer />)
    expect(screen.getAllByText('Sem sinais de risco').length).toBeGreaterThan(0)
  })

  it('does not show any patient, appointment-detail, or clinical record data', () => {
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState({ rows: [makeHealthRow()] }))
    render(<AdminClinicsPageContainer />)
    expect(screen.queryByText(/paciente/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/prontuário/i)).not.toBeInTheDocument()
  })

  it('does not change the existing clinics list rendering', () => {
    const clinic = makeClinic({ name: 'Clínica Existente' })
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [clinic], clinics: [clinic], filteredCount: 1 }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('heading', { name: /clínicas cadastradas/i })).toBeInTheDocument()
    expect(screen.getAllByText('Clínica Existente').length).toBeGreaterThan(0)
  })
})

// ── Filtered empty state ────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — filtered empty state', () => {
  it('shows the filtered empty state and calls clearAll', async () => {
    const clearAll = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ allClinics: [makeClinic()], clinics: [], filteredCount: 0, clearAll }),
    )
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(clearAll).toHaveBeenCalledOnce()
  })
})

// ── Row interactions ─────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — row interactions', () => {
  function renderWithClinic(overrides: Partial<AdminClinic> = {}) {
    const clinic = makeClinic({ name: 'Clínica Norte', ...overrides })
    const setEditTarget = vi.fn()
    const setDeleteTarget = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        allClinics: [clinic],
        clinics: [clinic],
        filteredCount: 1,
        setEditTarget,
        setDeleteTarget,
      }),
    )
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
    render(<AdminClinicsPageContainer />)
    return { clinic, setEditTarget, setDeleteTarget }
  }

  it('keeps unsupported clinic mutations unavailable', async () => {
    const { setEditTarget, setDeleteTarget } = renderWithClinic()
    for (const button of screen.getAllByRole('button', { name: /editar|excluir|nova clínica/i })) {
      expect(button).toBeDisabled()
    }
    expect(setEditTarget).not.toHaveBeenCalled()
    expect(setDeleteTarget).not.toHaveBeenCalled()
  })

  it('keeps a table row read-only for pointer and keyboard interactions', async () => {
    const { setEditTarget } = renderWithClinic()
    const row = screen.getByRole('row', { name: /Clínica Norte/ })
    await userEvent.click(row)
    row.focus()
    await userEvent.keyboard('{Enter} ')
    expect(setEditTarget).not.toHaveBeenCalled()
  })

  it('shows "Inativa" status for a clinic with isActive false', () => {
    renderWithClinic({ isActive: false })
    expect(screen.getAllByText('Inativa').length).toBeGreaterThan(0)
  })

  it('renders mobile-card actions that mirror the desktop row actions', async () => {
    const { setEditTarget, setDeleteTarget } = renderWithClinic()
    await userEvent.click(screen.getAllByRole('button', { name: /^editar$/i })[0])
    expect(setEditTarget).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /^excluir$/i }))
    expect(setDeleteTarget).not.toHaveBeenCalled()
  })
})

// ── Toolbar / pagination wiring ───────────────────────────────────────────────

describe('AdminClinicsPageContainer — toolbar and pagination wiring', () => {
  it('calls setSearchQuery when typing in the search box', async () => {
    const setSearchQuery = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        allClinics: [makeClinic()],
        clinics: [makeClinic()],
        filteredCount: 1,
        setSearchQuery,
      }),
    )
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
    render(<AdminClinicsPageContainer />)
    await userEvent.type(screen.getByPlaceholderText(/pesquisar por nome da clínica/i), 'a')
    expect(setSearchQuery).toHaveBeenCalled()
  })

  it('renders pagination and forwards page changes', async () => {
    const setPage = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        allClinics: [makeClinic()],
        clinics: [makeClinic()],
        filteredCount: 1,
        totalPages: 2,
        page: 1,
        setPage,
      }),
    )
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
    render(<AdminClinicsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /próxima/i }))
    expect(setPage).toHaveBeenCalledWith(2)
  })
})

// ── Modal wiring ─────────────────────────────────────────────────────────────────

describe('AdminClinicsPageContainer — modal wiring', () => {
  beforeEach(() => {
    mockUseClinicsHealth.mockReturnValue(makeDefaultHealthState())
  })

  it('does not open unsupported creation from the header', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(makeDefaultHookState({ setCreateOpen }))
    render(<AdminClinicsPageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: /nova clínica/i })[0])
    expect(setCreateOpen).not.toHaveBeenCalled()
  })

  it('does not open unsupported creation from the empty state', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(makeDefaultHookState({ setCreateOpen }))
    render(<AdminClinicsPageContainer />)
    const buttons = screen.getAllByRole('button', { name: /nova clínica/i })
    await userEvent.click(buttons[buttons.length - 1])
    expect(setCreateOpen).not.toHaveBeenCalled()
  })

  it('renders the create modal dialog when createOpen is true', () => {
    mockUseAdminClinicsPage.mockReturnValue(makeDefaultHookState({ createOpen: true }))
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome da clínica')).toBeInTheDocument()
  })

  it('calls setCreateOpen(false) when the create modal is dismissed', async () => {
    const setCreateOpen = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ createOpen: true, setCreateOpen }),
    )
    render(<AdminClinicsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setCreateOpen).toHaveBeenCalledWith(false)
  })

  it('opens the edit modal pre-filled when editTarget is set', () => {
    const clinic = makeClinic({ name: 'Clínica Alvo' })
    mockUseAdminClinicsPage.mockReturnValue(makeDefaultHookState({ editTarget: clinic }))
    render(<AdminClinicsPageContainer />)
    expect(screen.getByLabelText('Nome da clínica')).toHaveValue('Clínica Alvo')
  })

  it('calls setEditTarget(null) when the edit modal is dismissed', async () => {
    const setEditTarget = vi.fn()
    const clinic = makeClinic()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({ editTarget: clinic, setEditTarget }),
    )
    render(<AdminClinicsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setEditTarget).toHaveBeenCalledWith(null)
  })

  it('shows the delete confirm dialog with the target name and calls handleDeleteConfirm', async () => {
    const handleDeleteConfirm = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'clinic-1', name: 'Clínica Alvo' },
        handleDeleteConfirm,
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByText('Excluir clínica?')).toBeInTheDocument()
    expect(screen.getByText('Clínica Alvo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(handleDeleteConfirm).toHaveBeenCalledOnce()
  })

  it('calls setDeleteTarget(null) when the delete dialog is cancelled', async () => {
    const setDeleteTarget = vi.fn()
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'clinic-1', name: 'Clínica Alvo' },
        setDeleteTarget,
      }),
    )
    render(<AdminClinicsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(setDeleteTarget).toHaveBeenCalledWith(null)
  })

  it('disables the confirm button while isDeleting', () => {
    mockUseAdminClinicsPage.mockReturnValue(
      makeDefaultHookState({
        deleteTarget: { id: 'clinic-1', name: 'Clínica Alvo' },
        isDeleting: true,
      }),
    )
    render(<AdminClinicsPageContainer />)
    expect(screen.getByRole('button', { name: /aguarde/i })).toBeDisabled()
  })
})
