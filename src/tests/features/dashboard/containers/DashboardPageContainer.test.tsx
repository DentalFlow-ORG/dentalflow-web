import { render, screen } from '@/test-utils/render-utils'

import { DashboardPageContainer } from '@/features/dashboard/containers/DashboardPageContainer'
import { makeAssistantUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { setMockAuthState, resetAuthMocks } from '@/test-utils/mocks/auth'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

// Prevent actual API calls from the dashboard hook
vi.mock('@/features/dashboard/hooks/useDashboardPage', () => ({
  useDashboardPage: () => ({
    today: '2026-06-04',
    statusCounts: { total: 0, confirmed: 0, pending: 0, completed: 0, canceledOrNoShow: 0 },
    upcomingAppointments: [],
    activeDentists: [],
    financeTodaySummary: null,
    isLoading: false,
    error: null,
    drawerAppointment: null,
    setDrawerAppointment: vi.fn(),
  }),
}))

// Prevent ProductivityCenter from mounting and firing requests for OWNER tests
vi.mock('@/features/dashboard/containers/ProductivityCenter', () => ({
  ProductivityCenter: () => <div data-testid="productivity-center" />,
}))

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-04T15:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
  resetAuthMocks()
})

// ── ASSISTANT dashboard — quick actions ───────────────────────────────────────

describe('DashboardPageContainer — ASSISTANT quick actions', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
  })

  it('does NOT render a link to /app/prontuario', () => {
    render(<DashboardPageContainer />)
    expect(screen.queryByRole('link', { name: /prontuários/i })).not.toBeInTheDocument()
    // Also check that no element has the prontuario href
    expect(document.querySelector('a[href="/app/prontuario"]')).toBeNull()
  })

  it('renders a Leads quick action link', () => {
    render(<DashboardPageContainer />)
    const leadsLink = screen.getByRole('link', { name: /leads/i })
    expect(leadsLink).toBeInTheDocument()
    expect(leadsLink).toHaveAttribute('href', '/app/leads')
  })

  it('renders Agendamentos, Estoque, and Notas Fiscais quick actions', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByRole('link', { name: /agendamentos/i })).toHaveAttribute('href', '/app/agendamentos')
    expect(screen.getByRole('link', { name: /estoque/i })).toHaveAttribute('href', '/app/estoque')
    expect(screen.getByRole('link', { name: /notas fiscais/i })).toHaveAttribute('href', '/app/notas-fiscais')
  })
})

// ── OWNER dashboard — renders ProductivityCenter ──────────────────────────────

describe('DashboardPageContainer — OWNER', () => {
  it('renders ProductivityCenter for OWNER role', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<DashboardPageContainer />)
    expect(screen.getByTestId('productivity-center')).toBeInTheDocument()
  })

  it('does NOT render AssistantDashboard for OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<DashboardPageContainer />)
    // The ASSISTANT-only "Visão geral" heading should not be present
    expect(screen.queryByRole('heading', { name: /visão geral/i })).not.toBeInTheDocument()
  })
})
