import { render, screen } from '@/test-utils/render-utils'

import { DashboardPageContainer } from '@/features/dashboard/containers/DashboardPageContainer'
import { makeAppointment, DEFAULT_APPT_DATE } from '@/test-utils/factories/appointment.factory'
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

const mockUseDashboardPage = vi.fn()
vi.mock('@/features/dashboard/hooks/useDashboardPage', () => ({
  useDashboardPage: () => mockUseDashboardPage(),
}))

// Prevent ProductivityCenter from mounting and firing requests for OWNER tests
vi.mock('@/features/dashboard/containers/ProductivityCenter', () => ({
  ProductivityCenter: () => <div data-testid="productivity-center" />,
}))

// ── Default mock values ───────────────────────────────────────────────────────

function makeDefaultDashboard(overrides = {}) {
  return {
    today: '2026-06-04',
    appointments: [],
    statusCounts: { total: 0, confirmed: 0, pending: 0, completed: 0, canceledOrNoShow: 0 },
    upcomingAppointments: [],
    activeDentists: [],
    financeTodaySummary: null,
    isLoading: false,
    error: null,
    drawerAppointment: null,
    setDrawerAppointment: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-04T15:00:00.000Z'))
  setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
  mockUseDashboardPage.mockReturnValue(makeDefaultDashboard())
})

afterEach(() => {
  vi.useRealTimers()
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── ASSISTANT dashboard — header ──────────────────────────────────────────────

describe('DashboardPageContainer — ASSISTANT header', () => {
  it('renders "Central de atendimento" heading', () => {
    render(<DashboardPageContainer />)
    expect(
      screen.getByRole('heading', { name: /central de atendimento/i }),
    ).toBeInTheDocument()
  })

  it('does NOT render the old "Visão geral" heading', () => {
    render(<DashboardPageContainer />)
    expect(screen.queryByRole('heading', { name: /visão geral/i })).not.toBeInTheDocument()
  })

  it('renders the "Operação" eyebrow', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByText('Operação')).toBeInTheDocument()
  })

  it('shows a pending-confirmation badge when pending > 0', () => {
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({ statusCounts: { total: 3, confirmed: 1, pending: 2, completed: 0, canceledOrNoShow: 0 } }),
    )
    render(<DashboardPageContainer />)
    expect(screen.getByText(/2 a confirmar/i)).toBeInTheDocument()
  })
})

// ── ASSISTANT dashboard — quick actions ───────────────────────────────────────

describe('DashboardPageContainer — ASSISTANT quick actions', () => {
  it('does NOT render a link to /app/prontuario', () => {
    render(<DashboardPageContainer />)
    expect(screen.queryByRole('link', { name: /prontuários/i })).not.toBeInTheDocument()
    expect(document.querySelector('a[href="/app/prontuario"]')).toBeNull()
  })

  it('does NOT render a link to /app/financeiro', () => {
    render(<DashboardPageContainer />)
    expect(document.querySelector('a[href="/app/financeiro"]')).toBeNull()
  })

  it('renders an Agendamentos quick action link', () => {
    render(<DashboardPageContainer />)
    const links = screen.getAllByRole('link', { name: /agendamentos/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders a "Pacientes em atenção" quick action link', () => {
    render(<DashboardPageContainer />)
    const attLink = screen.getByRole('link', { name: /pacientes em atenção/i })
    expect(attLink).toBeInTheDocument()
    expect(attLink).toHaveAttribute('href', '/app/pacientes/atencao')
  })

  it('does NOT render a Leads quick action link', () => {
    render(<DashboardPageContainer />)
    expect(document.querySelector('a[href="/app/leads"]')).toBeNull()
  })

  it('renders a Pacientes quick action link', () => {
    render(<DashboardPageContainer />)
    // Use exact name to avoid matching "Pacientes em atenção"
    expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveAttribute('href', '/app/pacientes')
  })

  it('renders an Estoque quick action link', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByRole('link', { name: /estoque/i })).toHaveAttribute('href', '/app/estoque')
  })
})

// ── ASSISTANT dashboard — KPI cards ───────────────────────────────────────────

describe('DashboardPageContainer — ASSISTANT KPI cards', () => {
  it('renders "Consultas hoje" KPI', () => {
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({ statusCounts: { total: 8, confirmed: 5, pending: 3, completed: 0, canceledOrNoShow: 0 } }),
    )
    render(<DashboardPageContainer />)
    expect(screen.getByText('Consultas hoje')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders "A confirmar" KPI', () => {
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({ statusCounts: { total: 5, confirmed: 2, pending: 3, completed: 0, canceledOrNoShow: 0 } }),
    )
    render(<DashboardPageContainer />)
    // "A confirmar" appears in both the KPI card label (<p>) and the section heading (<h2>)
    expect(screen.getAllByText('A confirmar').length).toBeGreaterThanOrEqual(2)
  })

  it('renders "Confirmadas" KPI', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByText('Confirmadas')).toBeInTheDocument()
  })

  it('does NOT render "Leads ativos" KPI card', () => {
    render(<DashboardPageContainer />)
    expect(screen.queryByText('Leads ativos')).not.toBeInTheDocument()
  })
})

// ── ASSISTANT dashboard — confirmations section ───────────────────────────────

describe('DashboardPageContainer — ASSISTANT confirmations section', () => {
  it('renders the "A confirmar" section heading', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByRole('heading', { name: /^a confirmar$/i })).toBeInTheDocument()
  })

  it('renders pending appointments in the confirmations section', () => {
    const pending = makeAppointment({
      appointmentDate: DEFAULT_APPT_DATE,
      status: 'PENDING',
      patientName: 'Paciente Pendente',
    })
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({
        appointments: [pending],
        statusCounts: { total: 1, confirmed: 0, pending: 1, completed: 0, canceledOrNoShow: 0 },
      }),
    )
    render(<DashboardPageContainer />)
    expect(screen.getByText('Paciente Pendente')).toBeInTheDocument()
  })

  it('shows empty state when no pending confirmations', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByText('Nenhuma confirmação pendente.')).toBeInTheDocument()
    expect(screen.getByText('As consultas do dia estão sob controle.')).toBeInTheDocument()
  })

  it('does not show CONFIRMED appointments in the confirmations section', () => {
    const confirmed = makeAppointment({
      appointmentDate: DEFAULT_APPT_DATE,
      status: 'CONFIRMED',
      patientName: 'Paciente Confirmado',
    })
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({
        appointments: [confirmed],
        statusCounts: { total: 1, confirmed: 1, pending: 0, completed: 0, canceledOrNoShow: 0 },
      }),
    )
    render(<DashboardPageContainer />)
    // Empty state should show since no PENDING appointments
    expect(screen.getByText('Nenhuma confirmação pendente.')).toBeInTheDocument()
    // The confirmed patient name should NOT appear in the confirmations section (only in today schedule)
  })
})

// ── ASSISTANT dashboard — pending payments section ────────────────────────────

describe('DashboardPageContainer — ASSISTANT pending payments section', () => {
  it('renders the "Pagamentos pendentes" section heading', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByRole('heading', { name: /pagamentos pendentes/i })).toBeInTheDocument()
  })

  it('shows empty state when no pending payments', () => {
    render(<DashboardPageContainer />)
    expect(screen.getByText('Nenhum pagamento pendente.')).toBeInTheDocument()
  })

  it('does NOT link to /app/financeiro in the pending payments section', () => {
    render(<DashboardPageContainer />)
    expect(document.querySelector('a[href="/app/financeiro"]')).toBeNull()
  })

  it('links to /app/agendamentos from the pending payments section', () => {
    render(<DashboardPageContainer />)
    const agendamentosLinks = screen.getAllByRole('link', { name: /agendamentos/i })
    // At least one link points to agendamentos
    const hrefs = agendamentosLinks.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/app/agendamentos')
  })

  it('renders pending payment appointments when present', () => {
    const appt = makeAppointment({
      appointmentDate: DEFAULT_APPT_DATE,
      status: 'COMPLETED',
      paymentStatus: 'PAYMENT_PENDING',
      patientName: 'Paciente Devedor',
      estimatedAmountCents: 25000,
    })
    mockUseDashboardPage.mockReturnValue(
      makeDefaultDashboard({ appointments: [appt] }),
    )
    render(<DashboardPageContainer />)
    expect(screen.getByText('Paciente Devedor')).toBeInTheDocument()
  })
})

// ── ASSISTANT dashboard — loading state ───────────────────────────────────────

describe('DashboardPageContainer — ASSISTANT loading state', () => {
  it('shows loading card while data loads', () => {
    mockUseDashboardPage.mockReturnValue(makeDefaultDashboard({ isLoading: true }))
    render(<DashboardPageContainer />)
    expect(screen.getByText(/Carregando dados do dia/i)).toBeInTheDocument()
  })
})

// ── OWNER dashboard — unaffected ──────────────────────────────────────────────

describe('DashboardPageContainer — OWNER', () => {
  it('renders ProductivityCenter for OWNER role', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<DashboardPageContainer />)
    expect(screen.getByTestId('productivity-center')).toBeInTheDocument()
  })

  it('does NOT render AssistantDashboard heading for OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<DashboardPageContainer />)
    expect(
      screen.queryByRole('heading', { name: /central de atendimento/i }),
    ).not.toBeInTheDocument()
  })
})
