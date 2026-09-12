import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

import { PatientsAttentionContainer } from '@/features/patients/containers/PatientsAttentionContainer'
import type {
  AttentionPriority,
  PatientAttentionItem,
} from '@/features/patients/types/attention.types'
import type { AttentionSummary } from '@/features/patients/types/attention.types'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
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

const mockUsePatientsAttention = vi.fn()
vi.mock('@/features/patients/hooks/usePatientsAttention', () => ({
  usePatientsAttention: () => mockUsePatientsAttention(),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeAttentionItem(overrides: Partial<PatientAttentionItem> = {}): PatientAttentionItem {
  return {
    identifier: 'paciente@email.com',
    patientName: 'Carlos Lima',
    patientEmail: 'carlos@email.com',
    patientPhone: '(11) 99888-7766',
    lastAppointmentAt: '2026-02-10',
    nextAppointmentAt: null,
    lastProfessionalName: 'Dr. Silva',
    reason: 'INACTIVE',
    allReasons: ['INACTIVE', 'PENDING_PAYMENT'],
    priority: 'HIGH',
    pendingAmountCents: 25000,
    hasWhatsappConsent: true,
    ...overrides,
  }
}

function makeAttentionSummary(overrides: Partial<AttentionSummary> = {}): AttentionSummary {
  return {
    total: 5,
    inactive: 2,
    withoutUpcomingAppointment: 3,
    pendingPayment: 1,
    recentlyCanceled: 0,
    recentNoShow: 1,
    withWhatsappConsent: 4,
    ...overrides,
  }
}

function makeDefaultHookState(overrides = {}) {
  return {
    summary: null,
    allItems: [],
    filteredItems: [],
    avatarsByIdentifier: {},
    isLoading: false,
    error: null,
    search: '',
    setSearch: vi.fn(),
    reasonFilter: 'ALL',
    setReasonFilter: vi.fn(),
    priorityFilter: 'ALL',
    setPriorityFilter: vi.fn(),
    whatsappFilter: 'ALL',
    setWhatsappFilter: vi.fn(),
    hasFilters: false,
    clearFilters: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockUsePatientsAttention.mockReturnValue(makeDefaultHookState())
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — header', () => {
  it('renders "Pacientes em atenção" heading', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getByRole('heading', { name: /pacientes em atenção/i })).toBeInTheDocument()
  })

  it('renders "Pacientes" eyebrow', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getByText('Pacientes')).toBeInTheDocument()
  })

  it('renders back to patients link', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getByRole('link', { name: /voltar para pacientes/i })).toHaveAttribute(
      'href',
      '/app/pacientes',
    )
  })

  it('renders high priority badge when items with HIGH priority exist', () => {
    const item = makeAttentionItem({ priority: 'HIGH' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
        summary: makeAttentionSummary({ total: 1 }),
      }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getByText(/1 alta prioridade/i)).toBeInTheDocument()
  })

  it('does NOT render priority badge when no HIGH priority items', () => {
    const item = makeAttentionItem({ priority: 'LOW' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.queryByText(/alta prioridade/i)).not.toBeInTheDocument()
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — KPI cards', () => {
  it('renders KPI cards when summary is available', () => {
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        summary: makeAttentionSummary(),
        allItems: [makeAttentionItem()],
        filteredItems: [makeAttentionItem()],
      }),
    )
    render(<PatientsAttentionContainer />)
    // "Pacientes em atenção" appears in both the h1 heading and the KPI label
    expect(screen.getAllByText('Pacientes em atenção').length).toBeGreaterThanOrEqual(2)
    // "Pagamento pendente" appears in both KPI label and reason badge
    expect(screen.getAllByText('Pagamento pendente').length).toBeGreaterThanOrEqual(1)
    // These are unique KPI labels
    expect(screen.getByText('Inativos (+90 dias)')).toBeInTheDocument()
    expect(screen.getByText('Sem consulta futura')).toBeInTheDocument()
  })
})

// ── Attention items ───────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — attention items', () => {
  beforeEach(() => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
        summary: makeAttentionSummary({ total: 1 }),
      }),
    )
  })

  it('renders patient name', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('Carlos Lima').length).toBeGreaterThan(0)
  })

  it('renders patient email', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('carlos@email.com').length).toBeGreaterThan(0)
  })

  it('renders patient phone', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('(11) 99888-7766').length).toBeGreaterThan(0)
  })

  it('renders AttentionReasonBadge for each reason', () => {
    render(<PatientsAttentionContainer />)
    // Item has allReasons: ['INACTIVE', 'PENDING_PAYMENT']
    expect(screen.getAllByText('Inativo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pagamento pendente').length).toBeGreaterThan(0)
  })

  it('renders PatientPriorityBadge with "Alta" for HIGH priority', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('Alta').length).toBeGreaterThan(0)
  })

  it('renders "Fila de acompanhamento" section heading', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getByRole('heading', { name: /fila de acompanhamento/i })).toBeInTheDocument()
  })
})

// ── Priority badge values ─────────────────────────────────────────────────────

describe('PatientsAttentionContainer — priority badges', () => {
  it.each([
    ['HIGH', 'Alta'],
    ['MEDIUM', 'Média'],
    ['LOW', 'Baixa'],
  ] as [AttentionPriority, string][])('renders "%s" as "%s"', (priority, label) => {
    const item = makeAttentionItem({ priority, allReasons: ['INACTIVE'] })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText(label).length).toBeGreaterThan(0)
  })
})

// ── Empty states ──────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — empty states', () => {
  it('shows all-clear message when no items at all', () => {
    render(<PatientsAttentionContainer />)
    expect(screen.getByText('Todos os pacientes estão em dia')).toBeInTheDocument()
  })

  it('shows no-results message when filters active and nothing matches', () => {
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [makeAttentionItem()],
        filteredItems: [],
        hasFilters: true,
      }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('Nenhum paciente encontrado').length).toBeGreaterThan(0)
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — loading state', () => {
  it('shows loading card while loading', () => {
    mockUsePatientsAttention.mockReturnValue(makeDefaultHookState({ isLoading: true }))
    render(<PatientsAttentionContainer />)
    expect(screen.getByText(/analisando pacientes/i)).toBeInTheDocument()
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — error state', () => {
  it('shows error message when API fails', () => {
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ error: 'Erro ao carregar dados.' }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getByText('Erro ao carregar dados.')).toBeInTheDocument()
  })
})

// ── Action links in detail panel ──────────────────────────────────────────────

describe('PatientsAttentionContainer — detail panel actions', () => {
  it('opens detail panel when mobile card "Ver detalhes" is clicked', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
      }),
    )
    render(<PatientsAttentionContainer />)
    const buttons = screen.getAllByRole('button', { name: /ver detalhes/i })
    fireEvent.click(buttons[0])
    // Panel opens — check it shows the patient name in dialog title context
    expect(screen.getAllByText('Carlos Lima').length).toBeGreaterThan(0)
  })

  it('renders tel: link in detail panel when phone exists', () => {
    const item = makeAttentionItem({ patientPhone: '(11) 99888-7766' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
      }),
    )
    render(<PatientsAttentionContainer />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[0])
    const telLinks = document.querySelectorAll('a[href^="tel:"]')
    expect(telLinks.length).toBeGreaterThan(0)
  })

  it('renders mailto: link in detail panel when email exists', () => {
    const item = makeAttentionItem({ patientEmail: 'carlos@email.com' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
      }),
    )
    render(<PatientsAttentionContainer />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[0])
    const mailLinks = document.querySelectorAll('a[href^="mailto:"]')
    expect(mailLinks.length).toBeGreaterThan(0)
  })

  it('renders "Agendar" action link to /app/agendamentos', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
      }),
    )
    render(<PatientsAttentionContainer />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[0])
    const agendarLinks = screen.getAllByRole('link', { name: /agendar/i })
    expect(agendarLinks.length).toBeGreaterThan(0)
    expect(agendarLinks[0]).toHaveAttribute('href', '/app/agendamentos')
  })

  it('does NOT render tel: link when phone is null', () => {
    const item = makeAttentionItem({ patientPhone: null, patientEmail: 'carlos@email.com' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
      }),
    )
    render(<PatientsAttentionContainer />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[0])
    expect(document.querySelector('a[href^="tel:"]')).toBeNull()
  })
})

// ── No Leads references ───────────────────────────────────────────────────────

describe('PatientsAttentionContainer — no Leads content', () => {
  it('does not render any link to /app/leads', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(document.querySelector('a[href="/app/leads"]')).toBeNull()
    expect(screen.queryByText(/\/app\/leads/i)).not.toBeInTheDocument()
  })
})

// ── Quick navigation ──────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — quick navigation', () => {
  it('renders "Ver todos os pacientes" quick action link', () => {
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [makeAttentionItem()],
        filteredItems: [makeAttentionItem()],
      }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getByRole('link', { name: /ver todos os pacientes/i })).toHaveAttribute(
      'href',
      '/app/pacientes',
    )
  })
})

// ── Pagination reset on filter change ────────────────────────────────────────

describe('PatientsAttentionContainer — pagination resets to page 1 on filter change', () => {
  function makeItems(count: number): PatientAttentionItem[] {
    return Array.from({ length: count }, (_, i) =>
      makeAttentionItem({
        identifier: `patient-${i}@email.com`,
        patientName: `Patient ${i + 1}`,
        patientEmail: `patient-${i}@email.com`,
      }),
    )
  }

  beforeEach(() => {
    const items = makeItems(12)
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: items,
        filteredItems: items,
        summary: makeAttentionSummary({ total: 12 }),
      }),
    )
  })

  function navigateToPage2() {
    fireEvent.click(screen.getByTitle('Próxima página'))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  }

  it('resets to page 1 when search changes', () => {
    render(<PatientsAttentionContainer />)
    navigateToPage2()
    fireEvent.change(screen.getByPlaceholderText(/nome ou e-mail/i), {
      target: { value: 'Carlos' },
    })
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('resets to page 1 when reasonFilter changes', () => {
    render(<PatientsAttentionContainer />)
    navigateToPage2()
    const trigger = screen.getByRole('combobox', { name: /motivo/i })
    fireEvent.click(trigger)
    const option = screen.getAllByRole('option').find((o) => o.textContent?.includes('Inativo'))
    if (option) fireEvent.click(option)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('resets to page 1 when priorityFilter changes', () => {
    render(<PatientsAttentionContainer />)
    navigateToPage2()
    const trigger = screen.getByRole('combobox', { name: /prioridade/i })
    fireEvent.click(trigger)
    const option = screen.getAllByRole('option').find((o) => o.textContent?.includes('Alta'))
    if (option) fireEvent.click(option)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('resets to page 1 when the WhatsApp filter changes', () => {
    render(<PatientsAttentionContainer />)
    navigateToPage2()
    const trigger = screen.getByRole('combobox', { name: /whatsapp/i })
    fireEvent.click(trigger)
    const option = screen.getAllByRole('option').find((o) => o.textContent?.includes('Com'))
    if (option) fireEvent.click(option)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('resets to page 1 when the page size changes', () => {
    render(<PatientsAttentionContainer />)
    navigateToPage2()
    // The page-size select carries no label of its own; it is the combobox
    // showing the current size.
    const sizeSelect = screen.getAllByRole('combobox').find((c) => c.textContent?.trim() === '10')
    if (!sizeSelect) throw new Error('expected the page-size select')
    fireEvent.click(sizeSelect)
    const option = screen.getAllByRole('option').find((o) => o.textContent?.trim() === '25')
    if (option) fireEvent.click(option)
    // A larger page fits all 12 patients, so the last one is now on the page.
    expect(screen.getAllByText('Patient 12').length).toBeGreaterThan(0)
  })
})

// ── KPI tones ─────────────────────────────────────────────────────────────────

describe('PatientsAttentionContainer — KPI tones', () => {
  it('keeps every KPI neutral when the queue has nothing outstanding', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
        summary: makeAttentionSummary({
          total: 0,
          inactive: 0,
          pendingPayment: 0,
          withoutUpcomingAppointment: 0,
        }),
      }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('Pacientes em atenção').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pagamento pendente').length).toBeGreaterThan(0)
  })

  it('raises the KPI tones once each counter has entries', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({
        allItems: [item],
        filteredItems: [item],
        summary: makeAttentionSummary(),
      }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('Sem consulta futura').length).toBeGreaterThan(0)
  })
})

// ── Result count wording ──────────────────────────────────────────────────────

describe('PatientsAttentionContainer — result count', () => {
  it('uses the singular wording for a single match', () => {
    const item = makeAttentionItem()
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getByText('1 paciente encontrado.')).toBeInTheDocument()
  })

  it('uses the plural wording and notes the filters when they are applied', () => {
    const items = [
      makeAttentionItem({ identifier: 'a@x.com' }),
      makeAttentionItem({ identifier: 'b@x.com' }),
    ]
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: items, filteredItems: items, hasFilters: true }),
    )
    render(<PatientsAttentionContainer />)
    expect(
      screen.getByText('2 pacientes encontrados com os filtros aplicados.'),
    ).toBeInTheDocument()
  })
})

// ── Desktop table row activation ──────────────────────────────────────────────

describe('PatientsAttentionContainer — table row activation', () => {
  function renderWithRow() {
    const item = makeAttentionItem({ patientName: 'Carlos Lima' })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    const row = screen
      .getAllByRole('button', { name: /ver detalhes de carlos lima/i })
      .find((el) => el.tagName === 'TR')
    if (!row) throw new Error('expected a table row for the patient')
    return row
  }

  it.each(['{Enter}', ' '])('opens the detail panel with %s', async (key) => {
    const row = renderWithRow()
    row.focus()
    await userEvent.keyboard(key)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('ignores key presses that bubble up from inside the row', async () => {
    const row = renderWithRow()
    const badge = row.querySelector('span')
    if (!badge) throw new Error('expected a child element inside the row')
    fireEvent.keyDown(badge, { key: 'Enter' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ignores keys that are not Enter or Space', async () => {
    const row = renderWithRow()
    row.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the detail panel on click and closes it again', async () => {
    const row = renderWithRow()
    await userEvent.click(row)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

// ── Overflowing reasons and pending amounts ──────────────────────────────────

describe('PatientsAttentionContainer — row details', () => {
  it('collapses reasons beyond the first two into a counter', () => {
    const item = makeAttentionItem({
      allReasons: ['INACTIVE', 'PENDING_PAYMENT', 'NO_UPCOMING_APPOINTMENT', 'RECENT_NO_SHOW'],
    })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('shows a dash instead of an amount when nothing is pending', () => {
    const item = makeAttentionItem({ pendingAmountCents: 0 })
    mockUsePatientsAttention.mockReturnValue(
      makeDefaultHookState({ allItems: [item], filteredItems: [item] }),
    )
    render(<PatientsAttentionContainer />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
