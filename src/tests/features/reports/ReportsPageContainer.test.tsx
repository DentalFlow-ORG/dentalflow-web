import { render, screen, userEvent, waitFor, within } from '@/test-utils/render-utils'

import { ReportsPageContainer } from '@/features/reports/containers/ReportsPageContainer'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import {
  makeAssistantUser,
  makeDentistUser,
  makeOwnerUser,
} from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'

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

const mockListAppointments = vi.fn()
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: () => mockListAppointments(),
}))

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockGetCachedBillingStatus.mockReturnValue({ planKey: 'professional' })
  mockListAppointments.mockResolvedValue([])
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
    expect(screen.queryByText(/disponível apenas para proprietários/i)).not.toBeInTheDocument()
  })
})

// ── Produção por dentista (OWNER only) ────────────────────────────────────────

describe('ReportsPageContainer — Produção por dentista', () => {
  const dentistA = { id: 'profile-a', displayName: 'Dr. Ana', userId: 'user-a' }
  const dentistB = { id: 'profile-b', displayName: 'Dr. Bruno', userId: 'user-b' }

  beforeEach(() => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  })

  it('renders the section heading for OWNER', async () => {
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Produção por dentista', level: 2 }),
      ).toBeInTheDocument()
    })
  })

  it('shows an empty state when there is no appointment data in the period', async () => {
    mockListAppointments.mockResolvedValue([])
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Nenhuma produção no período')).toBeInTheDocument()
    })
  })

  it('groups completed, no-show, and total counts by dentist', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({
        id: 'a1',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-20',
        status: 'COMPLETED',
        estimatedAmountCents: 10000,
      }),
      makeAppointment({
        id: 'a2',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-21',
        status: 'COMPLETED',
        estimatedAmountCents: 20000,
      }),
      makeAppointment({
        id: 'a3',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-22',
        status: 'NO_SHOW',
      }),
      makeAppointment({
        id: 'b1',
        profileId: 'profile-b',
        profile: dentistB,
        appointmentDate: '2026-05-23',
        status: 'PENDING',
        estimatedAmountCents: 99999,
      }),
    ])
    render(<ReportsPageContainer />)

    const rowA = await waitFor(() => {
      const row = screen.getByText('Dr. Ana').closest('tr')
      expect(row).not.toBeNull()
      return row as HTMLTableRowElement
    })
    // 2 completed, 1 no-show, 3 total, 67% completion rate
    expect(rowA).toHaveTextContent('2')
    expect(rowA).toHaveTextContent('1')
    expect(rowA).toHaveTextContent('3')
    expect(rowA).toHaveTextContent('67%')

    const rowB = screen.getByText('Dr. Bruno').closest('tr') as HTMLTableRowElement
    // 0 completed, 0 no-show, 1 total (PENDING only) — no production from a non-completed appointment
    expect(rowB).toHaveTextContent('0%')
  })

  it('sums estimated production only from completed appointments, formatted as BRL', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({
        id: 'a1',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-20',
        status: 'COMPLETED',
        estimatedAmountCents: 10000,
      }),
      makeAppointment({
        id: 'a2',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-21',
        status: 'COMPLETED',
        estimatedAmountCents: 20000,
      }),
      makeAppointment({
        id: 'a3',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-05-22',
        status: 'PENDING',
        estimatedAmountCents: 99999,
      }),
    ])
    render(<ReportsPageContainer />)

    const rowA = await waitFor(() => {
      const row = screen.getByText('Dr. Ana').closest('tr')
      expect(row).not.toBeNull()
      return row as HTMLTableRowElement
    })
    // Only the two COMPLETED appointments (R$100 + R$200) count toward production
    expect(rowA?.textContent).toMatch(/R\$\s*300,00/)
    expect(rowA?.textContent).toMatch(/R\$\s*150,00/)
  })

  it('excludes appointments outside the selected period', async () => {
    mockListAppointments.mockResolvedValue([
      makeAppointment({
        id: 'a1',
        profileId: 'profile-a',
        profile: dentistA,
        appointmentDate: '2026-01-01',
        status: 'COMPLETED',
        estimatedAmountCents: 50000,
      }),
    ])
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Nenhuma produção no período')).toBeInTheDocument()
    })
    expect(screen.queryByText('Dr. Ana')).not.toBeInTheDocument()
  })

  it('does not render the section for ASSISTANT', async () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Agendamentos', level: 2 })).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Produção por dentista' })).not.toBeInTheDocument()
  })

  it('does not fetch appointment data for ASSISTANT', async () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Agendamentos', level: 2 })).toBeInTheDocument()
    })
    expect(mockListAppointments).not.toHaveBeenCalled()
  })

  it('does not render the section for DENTIST', async () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Agendamentos', level: 2 })).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Produção por dentista' })).not.toBeInTheDocument()
  })

  it('does not change the existing Agendamentos report section', async () => {
    render(<ReportsPageContainer />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Relatório de agendamentos' })).toBeInTheDocument()
    })
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
    expect(screen.queryByRole('heading', { name: 'Relatório financeiro' })).not.toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Relatório de agendamentos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Relatório de estoque' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Relatório de notas fiscais' })).toBeInTheDocument()
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

// ── Preview + export click flows ──────────────────────────────────────────────

describe('ReportsPageContainer — preview and export click flows', () => {
  function cardSection(headingName: string) {
    return screen.getByRole('heading', { name: headingName }).closest('section') as HTMLElement
  }

  it('calls getFinanceReportPreview with current filters when the Finance preview button is clicked', async () => {
    const { getFinanceReportPreview } = await import('@/features/reports/services/reports.service')
    render(<ReportsPageContainer />)
    const section = cardSection('Relatório financeiro')
    await userEvent.click(
      within(section).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    await waitFor(() =>
      expect(getFinanceReportPreview).toHaveBeenCalledWith({
        startDate: '2026-05-07',
        endDate: '2026-06-06',
      }),
    )
  })

  it('calls exportFinanceReport after previewing and clicking "Baixar CSV"', async () => {
    const { exportFinanceReport } = await import('@/features/reports/services/reports.service')
    render(<ReportsPageContainer />)
    const section = cardSection('Relatório financeiro')
    await userEvent.click(
      within(section).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    const downloadButton = await within(section).findByRole('button', { name: /baixar csv/i })
    await userEvent.click(downloadButton)
    await waitFor(() => expect(exportFinanceReport).toHaveBeenCalled())
  })

  it('calls getAppointmentsReportPreview when the Appointments preview button is clicked', async () => {
    const { getAppointmentsReportPreview } = await import(
      '@/features/reports/services/reports.service'
    )
    render(<ReportsPageContainer />)
    const section = cardSection('Relatório de agendamentos')
    await userEvent.click(
      within(section).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    await waitFor(() => expect(getAppointmentsReportPreview).toHaveBeenCalled())
  })

  it('calls getInventoryReportPreview when the Inventory preview button is clicked', async () => {
    const { getInventoryReportPreview } = await import(
      '@/features/reports/services/reports.service'
    )
    render(<ReportsPageContainer />)
    const section = cardSection('Relatório de estoque')
    await userEvent.click(
      within(section).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    await waitFor(() => expect(getInventoryReportPreview).toHaveBeenCalledWith({}))
  })

  it('calls getInvoicesReportPreview when the Notas fiscais preview button is clicked', async () => {
    const { getInvoicesReportPreview } = await import('@/features/reports/services/reports.service')
    render(<ReportsPageContainer />)
    const section = cardSection('Relatório de notas fiscais')
    await userEvent.click(
      within(section).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    await waitFor(() => expect(getInvoicesReportPreview).toHaveBeenCalled())
  })
})

// ── Filter interactions ───────────────────────────────────────────────────────

describe('ReportsPageContainer — filter interactions', () => {
  it('updates the finance type filter via the Select and reflects it in the export call', async () => {
    const { exportFinanceReport } = await import('@/features/reports/services/reports.service')
    render(<ReportsPageContainer />)
    const financeSection = screen
      .getByRole('heading', { name: 'Relatório financeiro' })
      .closest('section') as HTMLElement

    await userEvent.click(within(financeSection).getByRole('combobox', { name: /^tipo$/i }))
    await userEvent.click(await screen.findByRole('option', { name: 'Receita' }))

    await userEvent.click(
      within(financeSection).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    const downloadButton = await within(financeSection).findByRole('button', {
      name: /baixar csv/i,
    })
    await userEvent.click(downloadButton)

    await waitFor(() =>
      expect(exportFinanceReport).toHaveBeenCalledWith(expect.objectContaining({ type: 'INCOME' })),
    )
  })

  it('changing the finance start date updates the input value', async () => {
    render(<ReportsPageContainer />)
    const startInput = document.getElementById('fin-start') as HTMLInputElement
    await userEvent.clear(startInput)
    await userEvent.type(startInput, '01012026')
    await waitFor(() => expect(startInput).toHaveValue('01/01/2026'))
  })

  it('clearing finance filters resets the date inputs to the default range', async () => {
    render(<ReportsPageContainer />)
    const startInput = document.getElementById('fin-start') as HTMLInputElement
    await userEvent.clear(startInput)
    await userEvent.type(startInput, '01012026')
    await waitFor(() => expect(startInput).toHaveValue('01/01/2026'))

    const clearButtons = await screen.findAllByRole('button', { name: /limpar filtros/i })
    await userEvent.click(clearButtons[0])
    await waitFor(() => expect(startInput).toHaveValue('07/05/2026'))
  })

  it('updating the inventory category select changes the inventory preview call', async () => {
    const { getInventoryReportPreview } = await import(
      '@/features/reports/services/reports.service'
    )
    render(<ReportsPageContainer />)
    const invSection = screen
      .getByRole('heading', { name: 'Relatório de estoque' })
      .closest('section') as HTMLElement

    await userEvent.click(within(invSection).getByRole('combobox', { name: /^status$/i }))
    const options = await screen.findAllByRole('option')
    await userEvent.click(options[options.length - 1])

    await userEvent.click(
      within(invSection).getByRole('button', { name: /pré-visualizar relatório/i }),
    )
    await waitFor(() => expect(getInventoryReportPreview).toHaveBeenCalled())
    const [callArgs] = vi.mocked(getInventoryReportPreview).mock.calls.at(-1) as [
      { status?: string },
    ]
    expect(callArgs.status).toBeDefined()
  })
})
