import { render, screen } from '@/test-utils/render-utils'

import { AdminFinancePageContainer } from '@/features/admin/containers/AdminFinancePageContainer'
import type { AdminFinanceSummary } from '@/features/admin/types/admin-finance.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BarChart: () => null,
  Bar: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

const mockUseAdminFinancePage = vi.fn()
vi.mock('@/features/admin/hooks/useAdminFinancePage', () => ({
  useAdminFinancePage: () => mockUseAdminFinancePage(),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeSummary(kpiOverrides: Partial<AdminFinanceSummary['kpis']> = {}): AdminFinanceSummary {
  return {
    kpis: {
      totalPlans: 0,
      activePlans: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      canceledSubscriptions: 0,
      pastDueSubscriptions: 0,
      estimatedMrr: 0,
      estimatedArr: 0,
      currency: 'BRL',
      stripeEventsTotal: 0,
      stripeEventsProcessed: 0,
      stripeEventsFailed: 0,
      ...kpiOverrides,
    },
    revenueByCurrency: [],
    statusDistribution: [],
    subscriptionsByPlan: [],
    revenueByPrice: [],
    recentlyCreatedSubscriptions: [],
    recentlyCanceledSubscriptions: [],
  }
}

function makeDefaultHookState(overrides = {}) {
  return {
    summary: null,
    plans: [],
    subscriptions: [],
    subscriptionsTotal: 0,
    events: [],
    eventsTotal: 0,
    isLoading: false,
    loadError: null,
    subscriptionFilters: { page: 1, limit: 20 },
    setSubscriptionFilters: vi.fn(),
    eventFilters: { page: 1, limit: 20 },
    setEventFilters: vi.fn(),
    subscriptionsTotalPages: 1,
    eventsTotalPages: 1,
    planOptions: [],
    load: vi.fn(),
    setSubscriptionFilter: vi.fn(),
    setEventFilter: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState())
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — header', () => {
  it('renders "Gestão financeira" as the page heading', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /gestão financeira/i })).toBeInTheDocument()
  })

  it('renders the "Administração" eyebrow label', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Administração')).toBeInTheDocument()
  })

  it('renders the "Atualizar" action button', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — KPI cards', () => {
  it('renders all eight KPI labels when summary is loaded', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary: makeSummary() }))
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Assinaturas ativas')).toBeInTheDocument()
    expect(screen.getByText('Receita mensal')).toBeInTheDocument()
    expect(screen.getByText('Receita anual')).toBeInTheDocument()
    expect(screen.getByText('Em teste')).toBeInTheDocument()
    expect(screen.getByText('Canceladas')).toBeInTheDocument()
    expect(screen.getByText('Pgtos. pendentes')).toBeInTheDocument()
    expect(screen.getByText('Planos cadastrados')).toBeInTheDocument()
    expect(screen.getByText('Erros Stripe')).toBeInTheDocument()
  })

  it('does not render KPI cards when summary is null', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.queryByText('Assinaturas ativas')).not.toBeInTheDocument()
  })

  it('renders activeSubscriptions value from summary.kpis', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ summary: makeSummary({ activeSubscriptions: 7 }) }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1)
  })

  it('renders trialSubscriptions value from summary.kpis', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ summary: makeSummary({ trialSubscriptions: 3 }) }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)
  })

  it('renders stripeEventsFailed value from summary.kpis', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ summary: makeSummary({ stripeEventsFailed: 2 }) }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
  })

  it('renders MRR and ARR description "Calculado no backend"', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary: makeSummary() }))
    render(<AdminFinancePageContainer />)
    expect(screen.getAllByText('Calculado no backend').length).toBe(2)
  })
})

// ── Section headings ──────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — section headings', () => {
  beforeEach(() => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary: makeSummary() }))
  })

  it('renders the "Receita por preço" section heading', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /receita por preço/i })).toBeInTheDocument()
  })

  it('renders the "Assinaturas" section heading', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /^assinaturas$/i })).toBeInTheDocument()
  })

  it('renders the "Planos" section heading', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /^planos$/i })).toBeInTheDocument()
  })

  it('renders the "Eventos Stripe" section heading', () => {
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /eventos stripe/i })).toBeInTheDocument()
  })

  it('does not render section headings when summary is null', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState())
    render(<AdminFinancePageContainer />)
    expect(screen.queryByRole('heading', { name: /assinaturas/i })).not.toBeInTheDocument()
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — error state', () => {
  it('shows error message when load fails', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ loadError: 'Não foi possível carregar os dados financeiros.' }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Não foi possível carregar os dados financeiros.')).toBeInTheDocument()
  })

  it('renders the page heading even when load fails', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ loadError: 'Erro de conexão.' }))
    render(<AdminFinancePageContainer />)
    expect(screen.getByRole('heading', { name: /gestão financeira/i })).toBeInTheDocument()
  })
})
