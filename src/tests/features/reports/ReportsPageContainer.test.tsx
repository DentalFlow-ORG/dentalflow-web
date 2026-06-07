import { render, screen } from '@/test-utils/render-utils'

import { ReportsPageContainer } from '@/features/reports/containers/ReportsPageContainer'
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

const mockGetCachedBillingStatus = vi.fn()

vi.mock('@/features/billing/services/billing-status-cache', () => ({
  getCachedBillingStatus: () => mockGetCachedBillingStatus(),
}))

const mockPreviewData = {
  reportType: 'finance' as const,
  reportTitle: 'Relatório financeiro',
  clinic: { name: 'Clínica Teste', document: null },
  generatedAt: '2026-06-07T12:00:00.000Z',
  filters: [],
  period: null,
  recordCount: 5,
  maxRecords: 5000,
  isTruncated: false,
  exportFormat: 'CSV' as const,
  empty: false,
  previewNote: null,
}

vi.mock('@/features/reports/services/reports.service', () => ({
  exportFinanceReport: vi.fn(() => Promise.resolve()),
  exportAppointmentsReport: vi.fn(() => Promise.resolve()),
  exportInventoryReport: vi.fn(() => Promise.resolve()),
  exportInvoicesReport: vi.fn(() => Promise.resolve()),
  getFinanceReportPreview: vi.fn(() => Promise.resolve(mockPreviewData)),
  getAppointmentsReportPreview: vi.fn(() => Promise.resolve(mockPreviewData)),
  getInventoryReportPreview: vi.fn(() => Promise.resolve(mockPreviewData)),
  getInvoicesReportPreview: vi.fn(() => Promise.resolve(mockPreviewData)),
}))

vi.mock('@/lib/date-range-rules', () => ({
  defaultLast30DaysRange: () => ({ startDate: '2026-05-07', endDate: '2026-06-06' }),
  validateReportDateRange: vi.fn(() => null),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn(), dismissAlert: vi.fn() }),
}))

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockGetCachedBillingStatus.mockReturnValue({ planKey: 'professional' })
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('ReportsPageContainer — header', () => {
  it('renders "Relatórios" h1 heading', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Relatórios', level: 1 })).toBeInTheDocument()
  })

  it('renders "Dados e exportação" eyebrow', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/dados e exportação/i)).toBeInTheDocument()
  })

  it('renders updated page description', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/exporte dados financeiros/i)).toBeInTheDocument()
  })
})

// ── Reports count ─────────────────────────────────────────────────────────────

describe('ReportsPageContainer — available reports count', () => {
  it('shows "4 relatórios disponíveis" for OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    expect(screen.getByText('4 relatórios disponíveis')).toBeInTheDocument()
  })

  it('shows "3 relatórios disponíveis" for ASSISTANT', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    expect(screen.getByText('3 relatórios disponíveis')).toBeInTheDocument()
  })
})

// ── LGPD notice ───────────────────────────────────────────────────────────────

describe('ReportsPageContainer — LGPD notice', () => {
  it('renders LGPD notice', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/lgpd/i)).toBeInTheDocument()
  })

  it('renders LGPD copy about sharing with authorized persons', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/pessoas autorizadas/i)).toBeInTheDocument()
  })
})

// ── Footer notice ─────────────────────────────────────────────────────────────

describe('ReportsPageContainer — footer notice', () => {
  it('renders 5.000-record limit notice', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/5\.000/)).toBeInTheDocument()
  })
})

// ── OWNER view ────────────────────────────────────────────────────────────────

describe('ReportsPageContainer — OWNER', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  })

  it('renders "Financeiro" section label as h2', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Financeiro', level: 2 })).toBeInTheDocument()
  })

  it('renders Finance report card with title', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Relatório financeiro' })).toBeInTheDocument()
  })

  it('renders all 4 section labels', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Financeiro', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Agendamentos', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Estoque', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notas fiscais', level: 2 })).toBeInTheDocument()
  })

  it('does not render the ASSISTANT finance explainer', () => {
    render(<ReportsPageContainer />)
    expect(
      screen.queryByText(/disponível apenas para proprietários/i),
    ).not.toBeInTheDocument()
  })
})

// ── ASSISTANT view ────────────────────────────────────────────────────────────

describe('ReportsPageContainer — ASSISTANT', () => {
  beforeEach(() => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
  })

  it('renders "Financeiro" section label as h2', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Financeiro', level: 2 })).toBeInTheDocument()
  })

  it('does NOT render Finance report card', () => {
    render(<ReportsPageContainer />)
    expect(
      screen.queryByRole('heading', { name: 'Relatório financeiro' }),
    ).not.toBeInTheDocument()
  })

  it('renders ASSISTANT finance unavailability explainer', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByText(/disponível apenas para proprietários/i)).toBeInTheDocument()
  })

  it('renders the other 3 report section labels', () => {
    render(<ReportsPageContainer />)
    expect(screen.getByRole('heading', { name: 'Agendamentos', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Estoque', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notas fiscais', level: 2 })).toBeInTheDocument()
  })

  it('renders the other 3 report cards', () => {
    render(<ReportsPageContainer />)
    expect(
      screen.getByRole('heading', { name: 'Relatório de agendamentos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Relatório de estoque' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Relatório de notas fiscais' }),
    ).toBeInTheDocument()
  })
})

// ── Plan-blocked state ────────────────────────────────────────────────────────

describe('ReportsPageContainer — plan-blocked state', () => {
  it('renders PlanUpgradeNotice for OWNER on starter plan', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    mockGetCachedBillingStatus.mockReturnValue({ planKey: 'starter' })
    render(<ReportsPageContainer />)
    expect(screen.getByText(/ver planos e fazer upgrade/i)).toBeInTheDocument()
  })

  it('does not render report cards in plan-blocked state', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    mockGetCachedBillingStatus.mockReturnValue({ planKey: 'starter' })
    render(<ReportsPageContainer />)
    expect(screen.queryByText(/exportar csv/i)).not.toBeInTheDocument()
  })

  it('renders PlanUpgradeNotice for ASSISTANT on starter plan', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    mockGetCachedBillingStatus.mockReturnValue({ planKey: 'starter' })
    render(<ReportsPageContainer />)
    expect(screen.getByText(/ver planos e fazer upgrade/i)).toBeInTheDocument()
  })
})

// ── No API calls on mount ─────────────────────────────────────────────────────

describe('ReportsPageContainer — no API calls on mount', () => {
  it('does not call any export service on initial render', async () => {
    const service = await import('@/features/reports/services/reports.service')
    render(<ReportsPageContainer />)
    expect(service.exportFinanceReport).not.toHaveBeenCalled()
    expect(service.exportAppointmentsReport).not.toHaveBeenCalled()
    expect(service.exportInventoryReport).not.toHaveBeenCalled()
    expect(service.exportInvoicesReport).not.toHaveBeenCalled()
  })
})

// ── Filter grid columns ───────────────────────────────────────────────────────

describe('ReportsPageContainer — filter grid columns', () => {
  it('Finance filter grid uses lg:grid-cols-4', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    const heading = screen.getByRole('heading', { name: 'Relatório financeiro' })
    const section = heading.closest('section')
    expect(section?.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument()
  })

  it('Appointments filter grid uses lg:grid-cols-3', () => {
    render(<ReportsPageContainer />)
    const heading = screen.getByRole('heading', { name: 'Relatório de agendamentos' })
    const section = heading.closest('section')
    expect(section?.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument()
  })

  it('Fiscal filter grid uses lg:grid-cols-3', () => {
    render(<ReportsPageContainer />)
    const heading = screen.getByRole('heading', { name: 'Relatório de notas fiscais' })
    const section = heading.closest('section')
    expect(section?.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument()
  })
})

// ── Active filter chips ───────────────────────────────────────────────────────

describe('ReportsPageContainer — active filter chips', () => {
  it('does not render any "Limpar filtros" button on initial load', () => {
    render(<ReportsPageContainer />)
    expect(screen.queryAllByRole('button', { name: /limpar filtros/i })).toHaveLength(0)
  })
})

// ── Preview buttons wired ─────────────────────────────────────────────────────

describe('ReportsPageContainer — preview buttons', () => {
  it('renders "Pré-visualizar relatório" buttons for all 4 reports as OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    const previewButtons = screen.getAllByRole('button', { name: /pré-visualizar relatório/i })
    // Finance, Appointments, Inventory, Notas fiscais = 4 cards with preview
    expect(previewButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('does not render any "Exportar CSV" button on initial render', () => {
    render(<ReportsPageContainer />)
    expect(screen.queryByRole('button', { name: /exportar csv/i })).not.toBeInTheDocument()
  })
})
