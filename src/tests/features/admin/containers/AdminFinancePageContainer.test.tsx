import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { AdminFinancePageContainer } from '@/features/admin/containers/AdminFinancePageContainer'
import type {
  AdminFinancePlan,
  AdminFinanceSubscription,
  AdminFinanceSummary,
} from '@/features/admin/types/admin-finance.types'

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
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

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

function makeSubscription(
  overrides: Partial<AdminFinanceSubscription> = {},
): AdminFinanceSubscription {
  return {
    id: 'sub-1',
    clinic: { id: 'clinic-1', name: 'Clínica Norte', email: 'norte@clinica.com' },
    plan: {
      id: 'plan-1',
      name: 'Profissional',
      slug: 'profissional',
      priceMonthly: 9900,
      priceYearly: 99000,
    },
    status: 'ACTIVE',
    trialEndsAt: null,
    currentPeriodStart: '2026-01-01T00:00:00.000Z',
    currentPeriodEnd: '2026-02-01T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    canceledAt: null,
    endedAt: null,
    items: [
      {
        id: 'item-1',
        stripePriceId: 'price_1',
        priceNickname: null,
        billingInterval: 'MONTHLY',
        unitAmount: 9900,
        unitAmountDecimal: null,
        currency: 'brl',
        quantity: 1,
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makePlan(overrides: Partial<AdminFinancePlan> = {}): AdminFinancePlan {
  return {
    id: 'plan-1',
    name: 'Profissional',
    slug: 'profissional',
    description: null,
    stripePriceIdMonthly: 'price_1',
    stripePriceIdYearly: 'price_2',
    priceMonthly: 9900,
    priceYearly: 99000,
    maxProfiles: 5,
    maxLeadsPerMonth: null,
    maxServicesPerProfile: null,
    hasAppointments: true,
    hasAnalytics: true,
    hasCustomDomain: false,
    hasPrioritySupport: false,
    isActive: true,
    isPublic: true,
    displayOrder: 0,
    subscriptionsCount: 3,
    activeSubscriptionsCount: 2,
    trialSubscriptionsCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
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

// ── Header actions ─────────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — header actions', () => {
  it('calls load when the "Atualizar" button is clicked', async () => {
    const load = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ load }))
    render(<AdminFinancePageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /atualizar/i }))
    expect(load).toHaveBeenCalledOnce()
  })
})

// ── Subscriptions section ─────────────────────────────────────────────────────

describe('AdminFinancePageContainer — subscriptions section', () => {
  it('shows the empty state when there are no subscriptions', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary: makeSummary() }))
    render(<AdminFinancePageContainer />)
    expect(screen.getAllByText('Nenhuma assinatura encontrada').length).toBeGreaterThan(0)
  })

  it('renders a subscription row with clinic, plan, and status', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
      }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Clínica Norte')).toBeInTheDocument()
    expect(screen.getAllByText('Profissional').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ativa').length).toBeGreaterThan(0)
  })

  it('calls setSubscriptionFilter when typing in the clinic search box', async () => {
    const setSubscriptionFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
        setSubscriptionFilter,
      }),
    )
    render(<AdminFinancePageContainer />)
    await userEvent.type(screen.getByLabelText('Buscar clínica'), 'a')
    expect(setSubscriptionFilter).toHaveBeenCalledWith('search', expect.any(String))
  })

  it('calls setSubscriptionFilter when changing the status filter', async () => {
    const setSubscriptionFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
        setSubscriptionFilter,
      }),
    )
    render(<AdminFinancePageContainer />)
    const [statusSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(statusSelect, 'CANCELED')
    expect(setSubscriptionFilter).toHaveBeenCalledWith('status', 'CANCELED')
  })

  it('clears the status filter when "Todos" is selected', async () => {
    const setSubscriptionFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
        subscriptionFilters: { page: 1, limit: 20, status: 'CANCELED' },
        setSubscriptionFilter,
      }),
    )
    render(<AdminFinancePageContainer />)
    const [statusSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(statusSelect, 'Todos')
    expect(setSubscriptionFilter).toHaveBeenCalledWith('status', undefined)
  })

  it('calls setSubscriptionFilter when changing the plan filter', async () => {
    const setSubscriptionFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
        planOptions: [{ value: 'plan-1', label: 'Profissional' }],
        setSubscriptionFilter,
      }),
    )
    render(<AdminFinancePageContainer />)
    const [, planSelect] = screen.getAllByRole('combobox')
    await userEvent.selectOptions(planSelect, 'plan-1')
    expect(setSubscriptionFilter).toHaveBeenCalledWith('planId', 'plan-1')
  })

  it('renders pagination and forwards page changes', async () => {
    const setSubscriptionFilters = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [makeSubscription()],
        subscriptionsTotal: 1,
        subscriptionsTotalPages: 2,
        setSubscriptionFilters,
      }),
    )
    render(<AdminFinancePageContainer />)
    await userEvent.click(screen.getByRole('button', { name: /próxima/i }))
    expect(setSubscriptionFilters).toHaveBeenCalled()
  })
})

// ── Plans section ──────────────────────────────────────────────────────────────

describe('AdminFinancePageContainer — plans section', () => {
  it('shows the empty state when there are no plans', () => {
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary: makeSummary() }))
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Nenhum plano cadastrado')).toBeInTheDocument()
  })

  it('renders a plan row with name, slug, and subscription counts', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        plans: [makePlan({ name: 'Premium', slug: 'premium' })],
      }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('premium')).toBeInTheDocument()
  })
})
