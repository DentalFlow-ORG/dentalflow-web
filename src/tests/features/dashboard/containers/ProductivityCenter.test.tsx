import { render, screen, within } from '@/test-utils/render-utils'

import { ProductivityCenter } from '@/features/dashboard/containers/ProductivityCenter'
import type { ProductivitySummary } from '@/features/dashboard/types/productivity.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

// Prevent the chart component from rendering (uses recharts/canvas)
vi.mock('@/features/dashboard/components/TodayAppointmentsChart', () => ({
  TodayAppointmentsChart: () => null,
}))

const mockUseProductivitySummary = vi.fn()
vi.mock('@/features/dashboard/hooks/useProductivitySummary', () => ({
  useProductivitySummary: () => mockUseProductivitySummary(),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeProductivitySummary(
  overrides: Partial<ProductivitySummary> = {},
): ProductivitySummary {
  return {
    today: {
      date: '2026-06-04',
      appointmentsTotal: 5,
      appointmentsConfirmed: 3,
      appointmentsPending: 2,
      appointmentsCompleted: 0,
      appointmentsCanceledOrNoShow: 0,
      appointmentsCanceled: 0,
      appointmentsNoShow: 0,
      pendingPaymentsCount: 1,
      pendingPaymentsAmountCents: 55000,
    },
    upcomingToday: [],
    pendingPaymentAppointments: [],
    recentCanceled: [],
    inventory: { lowStockCount: 0, expiringSoonCount: 0, criticalProducts: [] },
    finance: { monthIncome: 1500, monthExpenses: 500, monthNet: 1000, pendingReceivables: 200 },
    patients: { withoutReturnCount: 0, examples: [] },
    actions: [],
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockUseProductivitySummary.mockReturnValue({ data: null, isLoading: false, error: null })
})

describe('ProductivityCenter — populated operational data', () => {
  function show(overrides: Partial<ProductivitySummary>) {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(overrides),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
  }

  it('links each recommended action and displays its priority', () => {
    show({
      actions: [
        {
          type: 'TODAY_SCHEDULE',
          title: 'Revisar agenda',
          description: 'Consultas de hoje',
          priority: 'HIGH',
          href: '/app/agendamentos',
        },
        {
          type: 'PENDING_PAYMENT',
          title: 'Revisar cobranças',
          description: 'Pagamentos pendentes',
          priority: 'MEDIUM',
          href: '/app/financeiro',
        },
        {
          type: 'NEW_ACTION',
          title: 'Revisar pacientes',
          description: 'Retornos',
          priority: 'LOW',
          href: '/app/pacientes',
        },
      ],
    })
    expect(screen.getByRole('link', { name: /Alta Revisar agenda/ })).toHaveAttribute(
      'href',
      '/app/agendamentos',
    )
    expect(screen.getByRole('link', { name: /Média Revisar cobranças/ })).toHaveAttribute(
      'href',
      '/app/financeiro',
    )
    expect(screen.getByRole('link', { name: /Baixa Revisar pacientes/ })).toHaveAttribute(
      'href',
      '/app/pacientes',
    )
  })

  it('renders upcoming appointments with and without service names', () => {
    const today = {
      ...makeProductivitySummary().today,
      appointmentsTotal: 1,
      appointmentsConfirmed: 1,
    }
    show({
      today,
      upcomingToday: [
        {
          id: '1',
          patientName: 'Ana agenda',
          startTime: '09:30',
          status: 'CONFIRMED',
          paymentStatus: null,
          profileName: 'Dra. Maria',
          serviceName: 'Limpeza agendada',
        },
        {
          id: '2',
          patientName: 'Bruno agenda',
          startTime: '10:30',
          status: 'PENDING',
          paymentStatus: null,
          profileName: 'Dr. João',
          serviceName: null,
        },
      ],
    })
    expect(screen.getByText(/1 consulta · 1 confirmada/)).toBeInTheDocument()
    const row = screen.getByText('Ana agenda').closest('li')
    expect(row).toHaveTextContent('Limpeza agendada')
    expect(row).toHaveTextContent('09:30')
    expect(row).toHaveTextContent('Dra. Maria')
    expect(screen.getByText('Bruno agenda')).toBeInTheDocument()
  })

  it.each([
    ['PAYMENT_PENDING', 'Pagamento pendente'],
    ['PARTIALLY_PAID', 'Parcialmente pago'],
    ['UNKNOWN', null],
  ])('displays %s payments with nullable amounts and profile names', (paymentStatus, label) => {
    show({
      pendingPaymentAppointments: [
        {
          id: '1',
          patientName: 'Ana cobrança',
          patientPhone: null,
          appointmentDate: '2026-06-04',
          startTime: '09:00',
          estimatedAmountCents: 12345,
          paidAmountCents: null,
          paymentStatus,
          profileName: 'Dra. Maria',
          serviceName: null,
        },
        {
          id: '2',
          patientName: 'Bruno cobrança',
          patientPhone: null,
          appointmentDate: '2026-06-04',
          startTime: '10:00',
          estimatedAmountCents: null,
          paidAmountCents: null,
          paymentStatus,
          profileName: '',
          serviceName: null,
        },
      ],
    })
    const row = screen.getByText('Ana cobrança').closest('li')
    expect(row).toHaveTextContent('R$ 123,45')
    expect(row).toHaveTextContent('04/06/2026 · Dra. Maria')
    if (label) expect(row).toHaveTextContent(label)
    else expect(row).not.toHaveTextContent('UNKNOWN')
    expect(screen.getByText('Bruno cobrança').closest('li')).not.toHaveTextContent('R$')
  })

  it.each([
    ['LOW', 'Estoque baixo'],
    ['EMPTY', 'Sem estoque'],
    ['EXPIRING', 'Vence em breve'],
    ['EXPIRED', 'Vencido'],
  ] as const)('shows %s inventory warnings', (status, label) => {
    show({
      inventory: {
        lowStockCount: 1,
        expiringSoonCount: 1,
        criticalProducts: [
          {
            id: '1',
            name: 'Luvas clínicas',
            currentQuantity: 0,
            minQuantity: 5,
            unit: 'CX',
            expiresAt: '2026-07-01',
            status,
            categoryName: 'Proteção',
          },
          {
            id: '2',
            name: 'Máscaras clínicas',
            currentQuantity: 1,
            minQuantity: 5,
            unit: 'CX',
            expiresAt: null,
            status,
            categoryName: null,
          },
        ],
      },
    })
    const row = screen.getByText('Luvas clínicas').closest('li')
    expect(row).toHaveTextContent(label)
    expect(row).toHaveTextContent('Proteção')
    expect(screen.getByText('Máscaras clínicas')).toBeInTheDocument()
    expect(screen.getByText('1 com estoque baixo · 1 com vencimento próximo')).toBeInTheDocument()
  })

  it('shows return examples and the remaining count without inventing a missing visit date', () => {
    show({
      patients: {
        withoutReturnCount: 4,
        examples: [
          { patientName: 'Ana retorno', patientPhone: null, lastVisit: '2026-03-01' },
          { patientName: 'Bruno retorno', patientPhone: null, lastVisit: null },
        ],
      },
    })
    expect(screen.getByText('Ana retorno').closest('li')).toHaveTextContent('Última: 01/03/2026')
    expect(screen.getByText('Bruno retorno').closest('li')).not.toHaveTextContent('Última:')
    expect(screen.getByText('+2 pacientes a mais')).toBeInTheDocument()
  })

  it('shows cancellation reasons only when the backend supplies one', () => {
    show({
      recentCanceled: [
        {
          id: '1',
          patientName: 'Ana cancelada',
          appointmentDate: '2026-06-04',
          startTime: '09:00',
          cancellationReason: 'Imprevisto',
          profileName: 'Dra. Maria',
        },
        {
          id: '2',
          patientName: 'Bruno cancelado',
          appointmentDate: '2026-06-04',
          startTime: '10:00',
          cancellationReason: null,
          profileName: 'Dr. João',
        },
      ],
    })
    expect(screen.getByText('Ana cancelada').closest('li')).toHaveTextContent('Imprevisto')
    expect(screen.getByText('Bruno cancelado')).toBeInTheDocument()
    expect(
      within(screen.getByText('Bruno cancelado').closest('li') as HTMLElement).queryByText(
        'Imprevisto',
      ),
    ).not.toBeInTheDocument()
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Header / title ────────────────────────────────────────────────────────────

describe('ProductivityCenter — header', () => {
  it('renders "Minha clínica" as the page heading', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByRole('heading', { name: /minha clínica/i })).toBeInTheDocument()
  })

  it('renders the "Início" eyebrow label', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByText('Início')).toBeInTheDocument()
  })

  it('does NOT render the old "Central de Produtividade" title', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.queryByText(/Central de Produtividade/i)).not.toBeInTheDocument()
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('ProductivityCenter — loading state', () => {
  it('shows the loading card when isLoading is true', () => {
    mockUseProductivitySummary.mockReturnValue({ data: null, isLoading: true, error: null })
    render(<ProductivityCenter />)
    expect(screen.getByText(/Carregando dados da clínica/i)).toBeInTheDocument()
  })

  it('does not render KPI cards while loading', () => {
    mockUseProductivitySummary.mockReturnValue({ data: null, isLoading: true, error: null })
    render(<ProductivityCenter />)
    expect(screen.queryByText('Consultas hoje')).not.toBeInTheDocument()
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('ProductivityCenter — error state', () => {
  it('shows the error message', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Não foi possível carregar os dados de produtividade. Tente recarregar.',
    })
    render(<ProductivityCenter />)
    expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('ProductivityCenter — KPI cards', () => {
  beforeEach(() => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
  })

  it('renders the "Consultas hoje" KPI card', () => {
    render(<ProductivityCenter />)
    expect(screen.getByText('Consultas hoje')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the "Pagamentos pendentes" KPI card', () => {
    render(<ProductivityCenter />)
    // Label appears in both the KPI card (<p>) and the section heading (<h2>)
    expect(screen.getAllByText('Pagamentos pendentes').length).toBeGreaterThanOrEqual(2)
    // The KPI value "1" is unique in this render
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders the "Receita do mês" KPI card with BRL value', () => {
    render(<ProductivityCenter />)
    expect(screen.getByText('Receita do mês')).toBeInTheDocument()
    // Multiple R$ values appear (KPI row + finance panel cards)
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0)
  })

  it('renders the "Alertas de estoque" KPI card', () => {
    render(<ProductivityCenter />)
    expect(screen.getByText('Alertas de estoque')).toBeInTheDocument()
  })
})

// ── Sections ──────────────────────────────────────────────────────────────────

describe('ProductivityCenter — sections', () => {
  it('renders the "Agenda de hoje" section heading', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByRole('heading', { name: /agenda de hoje/i })).toBeInTheDocument()
  })

  it('renders the "Pagamentos pendentes" section heading', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByRole('heading', { name: /pagamentos pendentes/i })).toBeInTheDocument()
  })

  it('renders the "Financeiro do mês" section heading', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByRole('heading', { name: /financeiro do mês/i })).toBeInTheDocument()
  })

  it('does NOT render RecentCanceledPanel when no cancellations exist', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary({ recentCanceled: [] }),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(
      screen.queryByRole('heading', { name: /cancelamentos recentes/i }),
    ).not.toBeInTheDocument()
  })

  it('renders RecentCanceledPanel when cancellations exist', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary({
        recentCanceled: [
          {
            id: 'c1',
            patientName: 'João da Silva',
            appointmentDate: '2026-06-01',
            startTime: '1970-01-01T09:00:00.000Z',
            cancellationReason: null,
            profileName: 'Dr. Lima',
          },
        ],
      }),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByRole('heading', { name: /cancelamentos recentes/i })).toBeInTheDocument()
    expect(screen.getByText('João da Silva')).toBeInTheDocument()
  })
})

// ── Empty states ──────────────────────────────────────────────────────────────

describe('ProductivityCenter — empty states', () => {
  it('shows empty state in schedule panel when no appointments', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary({ upcomingToday: [] }),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByText('Nenhuma consulta pendente para hoje.')).toBeInTheDocument()
  })

  it('shows empty state in payments panel when no pending payments', () => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary({ pendingPaymentAppointments: [] }),
      isLoading: false,
      error: null,
    })
    render(<ProductivityCenter />)
    expect(screen.getByText('Nenhum pagamento pendente.')).toBeInTheDocument()
  })
})

// ── Quick action shortcuts ────────────────────────────────────────────────────

describe('ProductivityCenter — quick actions', () => {
  beforeEach(() => {
    mockUseProductivitySummary.mockReturnValue({
      data: makeProductivitySummary(),
      isLoading: false,
      error: null,
    })
  })

  it('renders the Agendamentos quick action link', () => {
    render(<ProductivityCenter />)
    const links = screen.getAllByRole('link', { name: /agendamentos/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[links.length - 1]).toHaveAttribute('href', '/app/agendamentos')
  })

  it('renders the Financeiro quick action link', () => {
    render(<ProductivityCenter />)
    const links = screen.getAllByRole('link', { name: /financeiro/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders the Pacientes quick action link', () => {
    render(<ProductivityCenter />)
    const links = screen.getAllByRole('link', { name: /pacientes/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders the Estoque quick action link', () => {
    render(<ProductivityCenter />)
    const links = screen.getAllByRole('link', { name: /estoque/i })
    expect(links.length).toBeGreaterThan(0)
  })
})
