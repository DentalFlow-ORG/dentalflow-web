import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, within } from '@/test-utils/render-utils'

import { AdminFinancePageContainer } from '@/features/admin/containers/AdminFinancePageContainer'
import type {
  AdminFinancePlan,
  AdminFinanceStripeEvent,
  AdminFinanceSubscription,
  AdminFinanceSubscriptionPreview,
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

describe('AdminFinancePageContainer — populated billing data', () => {
  const events: AdminFinanceStripeEvent[] = [
    {
      id: 'evt-ok',
      type: 'invoice.paid',
      processed: true,
      processedAt: '2026-06-10T12:00:00Z',
      errorMessage: null,
      createdAt: '2026-06-10T12:00:00Z',
      receivedAt: '2026-06-10T12:00:00Z',
    },
    {
      id: 'evt-error',
      type: 'invoice.payment_failed',
      processed: false,
      processedAt: null,
      errorMessage: 'Falha na sincronização',
      createdAt: '2026-06-10T12:00:00Z',
      receivedAt: '2026-06-10T12:00:00Z',
    },
  ]

  it('renders processed and failed Stripe events with the appropriate error details', () => {
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ summary: makeSummary(), events, eventsTotal: 2 }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('evt-ok').closest('tr')).toHaveTextContent('Processado')
    expect(screen.getByText('evt-error').closest('tr')).toHaveTextContent('Pendente')
    expect(screen.getByText('evt-error').closest('tr')).toHaveTextContent('Falha na sincronização')
    expect(screen.getByText('evt-ok').closest('tr')).not.toHaveTextContent('Falha na sincronização')
  })

  it('filters Stripe events by type, processing status, and date', async () => {
    const setEventFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({ summary: makeSummary(), events, eventsTotal: 2, setEventFilter }),
    )
    render(<AdminFinancePageContainer />)
    fireEvent.change(screen.getByLabelText('Tipo do evento'), { target: { value: 'invoice.paid' } })
    expect(setEventFilter).toHaveBeenCalledWith('type', 'invoice.paid')
    const select = screen
      .getAllByRole('combobox')
      .find((element) => within(element).queryByRole('option', { name: 'Pendente/erro' }))
    if (!select) throw new Error('Expected processing status filter')
    await userEvent.selectOptions(select, 'false')
    expect(setEventFilter).toHaveBeenCalledWith('processed', 'false')
    await userEvent.selectOptions(select, 'Todos')
    expect(setEventFilter).toHaveBeenCalledWith('processed', undefined)
    fireEvent.change(screen.getByLabelText('Recebido até'), { target: { value: '10/06/2026' } })
    fireEvent.blur(screen.getByLabelText('Recebido até'))
    expect(setEventFilter).toHaveBeenCalledWith('to', '2026-06-10')
  })

  it.each(['subscriptions', 'events'] as const)(
    'preserves %s filters while paging and resets the page when resizing',
    async (kind) => {
      let filters = { page: 2, limit: 20, to: '2026-06-10' }
      const updateFilters = vi.fn((update: (current: typeof filters) => typeof filters) => {
        filters = update(filters)
      })
      const data =
        kind === 'subscriptions'
          ? {
              subscriptions: [makeSubscription()],
              subscriptionsTotal: 100,
              subscriptionsTotalPages: 5,
              subscriptionFilters: filters,
              setSubscriptionFilters: updateFilters,
            }
          : {
              events,
              eventsTotal: 100,
              eventsTotalPages: 5,
              eventFilters: filters,
              setEventFilters: updateFilters,
            }
      mockUseAdminFinancePage.mockReturnValue(
        makeDefaultHookState({ summary: makeSummary(), ...data }),
      )
      render(<AdminFinancePageContainer />)
      await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
      expect(filters).toEqual({ page: 3, limit: 20, to: '2026-06-10' })
      const select = screen
        .getAllByRole('combobox')
        .find((element) => within(element).queryByRole('option', { name: '50' }))
      if (!select) throw new Error('Expected page size control')
      await userEvent.selectOptions(select, '50')
      expect(filters).toEqual({ page: 1, limit: 50, to: '2026-06-10' })
    },
  )

  it('displays recent subscriptions with clinic identity fallback and cancellation dates', () => {
    const recent: AdminFinanceSubscriptionPreview = {
      id: 'recent',
      clinic: { id: 'clinic-missing-email', name: 'Clínica Recente', email: null },
      plan: { id: 'plan', name: 'Professional', slug: 'professional' },
      status: 'CANCELED',
      billingInterval: 'MONTHLY',
      currency: 'BRL',
      createdAt: '2026-06-01T12:00:00Z',
      currentPeriodEnd: null,
      canceledAt: '2026-06-10T12:00:00Z',
      endedAt: null,
    }
    const summary = {
      ...makeSummary(),
      recentlyCreatedSubscriptions: [recent],
      recentlyCanceledSubscriptions: [
        {
          ...recent,
          id: 'ended',
          clinic: { ...recent.clinic, name: 'Clínica Encerrada', email: 'contato@clinica.test' },
          canceledAt: null,
          endedAt: '2026-06-09T12:00:00Z',
        },
      ],
    }
    mockUseAdminFinancePage.mockReturnValue(makeDefaultHookState({ summary }))
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('Clínica Recente').closest('tr')).toHaveTextContent(
      'clinic-missing-email',
    )
    expect(screen.getByText('Clínica Recente').closest('tr')).toHaveTextContent('10/06/2026')
    expect(screen.getByText('Clínica Encerrada').closest('tr')).toHaveTextContent(
      'contato@clinica.test',
    )
    expect(screen.getByText('Clínica Encerrada').closest('tr')).toHaveTextContent('09/06/2026')
  })

  it('formats price breakdowns from cents with explicit and default currencies', () => {
    const row: AdminFinanceSummary['revenueByPrice'][number] = {
      stripePriceId: 'price-monthly',
      priceNickname: 'Mensal original',
      planId: 'plan',
      planName: 'Professional',
      currency: 'BRL',
      billingInterval: 'MONTHLY',
      estimatedMrr: 12345,
      estimatedArr: 148140,
      subscriberCount: 2,
    }
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: {
          ...makeSummary(),
          revenueByPrice: [
            row,
            {
              ...row,
              stripePriceId: 'price-yearly',
              priceNickname: null,
              currency: '',
              billingInterval: 'YEARLY',
            },
          ],
        },
      }),
    )
    render(<AdminFinancePageContainer />)
    expect(screen.getByText('price-monthly').closest('tr')).toHaveTextContent('Mensal original')
    expect(screen.getByText('price-monthly').closest('tr')).toHaveTextContent('R$ 123,45')
    expect(screen.getByText('price-yearly').closest('tr')).toHaveTextContent('Anual')
    expect(screen.getByText('price-yearly').closest('tr')).toHaveTextContent('R$ 123,45')
  })
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

const chartTheme = vi.hoisted(() => ({ value: 'light' }))
vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: chartTheme.value }),
}))

// Recharts owns pointer geometry. This double delivers its public tooltip
// contract on hover while retaining the application's data and formatters.
vi.mock('recharts', async () => {
  const { cloneElement, createContext, useContext, useState } = await import('react')
  type Datum = { label: string; value: number }
  const Chart = createContext<{ data: Datum[]; active: Datum | null }>({ data: [], active: null })
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    BarChart: ({ data, children }: { data: Datum[]; children: React.ReactNode }) => {
      const [active, setActive] = useState<Datum | null>(null)
      return (
        <Chart.Provider value={{ data, active }}>
          <div role="group" aria-label="Gráfico financeiro">
            {data.map((item) => (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setActive(item)}
                onMouseLeave={() => setActive(null)}
              >
                {item.label}
              </button>
            ))}
            {children}
          </div>
        </Chart.Provider>
      )
    },
    Bar: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: ({ tickFormatter }: { tickFormatter: (value: number) => string }) => (
      <div aria-label="Escala">
        {useContext(Chart).data.map((item) => (
          <span key={item.label}>{tickFormatter(item.value)}</span>
        ))}
      </div>
    ),
    Tooltip: ({
      content,
    }: {
      content: React.ReactElement<{
        active: boolean
        label?: string
        payload?: { value: number }[]
      }>
    }) => {
      const { active } = useContext(Chart)
      return (
        <div role="tooltip">
          {cloneElement(content, {
            active: !!active,
            label: active?.label,
            payload: active ? [{ value: active.value }] : undefined,
          })}
        </div>
      )
    },
  }
})

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

describe('AdminFinancePageContainer — chart interactions', () => {
  it('shows subscription identity/date fallbacks and inactive plans', () => {
    const subscription = makeSubscription({
      clinic: { id: 'clinic-no-email', name: 'Clínica sem email', email: null },
      currentPeriodStart: null,
      createdAt: '2026-06-12T12:00:00Z',
    })
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        subscriptions: [subscription],
        subscriptionsTotal: 1,
        plans: [makePlan({ isActive: false })],
      }),
    )
    render(<AdminFinancePageContainer />)
    const row = screen.getByText('Clínica sem email').closest('tr')
    expect(row).toHaveTextContent('clinic-no-email')
    expect(row).toHaveTextContent('12/06/2026')
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('clears the plan filter and forwards the subscription end date', async () => {
    const setSubscriptionFilter = vi.fn()
    mockUseAdminFinancePage.mockReturnValue(
      makeDefaultHookState({
        summary: makeSummary(),
        setSubscriptionFilter,
        subscriptionFilters: { page: 1, limit: 20, planId: 'plan-1' },
        planOptions: [{ value: 'plan-1', label: 'Profissional' }],
      }),
    )
    render(<AdminFinancePageContainer />)
    const plan = screen
      .getAllByRole('combobox')
      .find((select) => within(select).queryByRole('option', { name: 'Profissional' }))
    if (!plan) throw new Error('Missing plan filter')
    await userEvent.selectOptions(plan, 'Todos')
    expect(setSubscriptionFilter).toHaveBeenCalledWith('planId', undefined)
    fireEvent.change(screen.getByLabelText('Criada até'), { target: { value: '12/06/2026' } })
    fireEvent.blur(screen.getByLabelText('Criada até'))
    expect(setSubscriptionFilter).toHaveBeenCalledWith('to', '2026-06-12')
  })
  afterEach(() => {
    chartTheme.value = 'light'
  })

  it.each(['light', 'dark'])(
    'formats revenue and subscription tooltips in %s mode and dismisses on mouse leave',
    async (theme) => {
      chartTheme.value = theme
      const plan: AdminFinanceSummary['subscriptionsByPlan'][number] = {
        planId: 'pro',
        planName: 'Profissional',
        activeSubscriptions: 2,
        trialSubscriptions: 0,
        canceledSubscriptions: 0,
        pastDueSubscriptions: 0,
        totalSubscriptions: 2,
        subscriberCount: 2,
        estimatedMrr: 12345,
        estimatedArr: 148140,
        currency: 'BRL',
      }
      mockUseAdminFinancePage.mockReturnValue(
        makeDefaultHookState({
          summary: {
            ...makeSummary(),
            subscriptionsByPlan: [
              plan,
              { ...plan, planId: 'empty', planName: 'Sem receita', estimatedMrr: 0 },
            ],
            statusDistribution: [
              { status: 'ACTIVE', count: 2 },
              { status: 'CANCELED', count: 0 },
            ],
          },
        }),
      )
      render(<AdminFinancePageContainer />)
      const [revenue, status] = screen.getAllByRole('group', { name: 'Gráfico financeiro' })
      expect(within(revenue).queryByRole('button', { name: 'Sem receita' })).not.toBeInTheDocument()
      expect(within(revenue).getByLabelText('Escala')).toHaveTextContent('R$ 123,45')
      expect(within(revenue).getByRole('tooltip')).toBeEmptyDOMElement()
      await userEvent.hover(within(revenue).getByRole('button', { name: 'Profissional' }))
      expect(within(revenue).getByRole('tooltip')).toHaveTextContent('ReceitaR$ 123,45')
      await userEvent.unhover(within(revenue).getByRole('button', { name: 'Profissional' }))
      expect(within(revenue).getByRole('tooltip')).toBeEmptyDOMElement()
      await userEvent.hover(within(status).getByRole('button'))
      expect(within(status).getByRole('tooltip')).toHaveTextContent('Assinaturas2')
      expect(within(status).getByLabelText('Escala')).toHaveTextContent('2')
    },
  )
})

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
