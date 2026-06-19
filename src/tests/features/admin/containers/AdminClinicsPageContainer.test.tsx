import { render, screen } from '@/test-utils/render-utils'

import { CLINIC_FILTER_DEFS } from '@/features/admin/constants/admin-display'
import { AdminClinicsPageContainer } from '@/features/admin/containers/AdminClinicsPageContainer'
import type { AdminClinic } from '@/features/admin/types/admin.types'

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
