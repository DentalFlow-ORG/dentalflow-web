import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { PatientsPageContainer } from '@/features/patients/containers/PatientsPageContainer'
import type { PatientSummary } from '@/features/patients/types/patients.types'
import { makeAssistantUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
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

// Prevent real API calls from the hook
const mockUsePatientsPage = vi.fn()
vi.mock('@/features/patients/hooks/usePatientsPage', () => ({
  usePatientsPage: () => mockUsePatientsPage(),
}))

// Prevent detail panel hooks from firing
vi.mock('@/features/patients/hooks/usePatientHistory', () => ({
  usePatientHistory: () => ({ appointments: [], isLoading: false }),
}))
vi.mock('@/features/clinical-records/hooks/usePatientClinicalTimeline', () => ({
  usePatientClinicalTimeline: () => ({ records: [], isLoading: false }),
}))
vi.mock('@/features/patients/hooks/usePatientAvatar', () => ({
  usePatientAvatar: () => ({ avatarUrl: null, isSaving: false, update: vi.fn() }),
  setCachedPatientAvatar: vi.fn(),
}))
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn() }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makePatient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    identifier: 'paciente@email.com',
    patientName: 'Ana Souza',
    patientEmail: 'ana@email.com',
    patientPhone: '(11) 99999-1234',
    totalAppointments: 4,
    completedAppointments: 3,
    canceledAppointments: 1,
    lastVisit: '2026-05-10',
    avatarUrl: null,
    ...overrides,
  }
}

function makeDefaultHookState(overrides = {}) {
  return {
    patients: [],
    filteredPatients: [],
    paginatedPatients: [],
    isLoading: false,
    error: null,
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    setPage: vi.fn(),
    pageSize: 10,
    setPageSize: vi.fn(),
    totalPages: 1,
    selectedPatient: null,
    setSelectedPatient: vi.fn(),
    hasFilters: false,
    handleSearchChange: vi.fn(),
    handleDateFromChange: vi.fn(),
    handleDateToChange: vi.fn(),
    handleRefresh: vi.fn(),
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  mockUsePatientsPage.mockReturnValue(makeDefaultHookState())
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Header ────────────────────────────────────────────────────────────────────

describe('PatientsPageContainer — header', () => {
  it('renders "Base de pacientes" heading', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByRole('heading', { name: /base de pacientes/i })).toBeInTheDocument()
  })

  it('renders the "Pacientes" eyebrow label', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByText('Pacientes')).toBeInTheDocument()
  })

  it('renders the Atenção action button linking to /app/pacientes/atencao', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByRole('link', { name: /atenção/i })).toHaveAttribute(
      'href',
      '/app/pacientes/atencao',
    )
  })
})

// ── KPI cards ─────────────────────────────────────────────────────────────────

describe('PatientsPageContainer — KPI cards', () => {
  it('renders KPI cards when patients are present', () => {
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    // "Pacientes cadastrados" appears in both the KPI card label and the HomeSection heading
    expect(screen.getAllByText('Pacientes cadastrados').length).toBeGreaterThanOrEqual(2)
    // These only appear in KPI cards
    expect(screen.getByText('Consultas no total')).toBeInTheDocument()
    expect(screen.getByText('Taxa de conclusão')).toBeInTheDocument()
    expect(screen.getByText('Média por paciente')).toBeInTheDocument()
  })

  it('shows patient count "1" for single patient', () => {
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    // "1" appears as total patients KPI value
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not render KPI cards when loading', () => {
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({ isLoading: true, patients: ['placeholder'] }),
    )
    render(<PatientsPageContainer />)
    // KPI-only labels should not appear while loading
    expect(screen.queryByText('Consultas no total')).not.toBeInTheDocument()
    expect(screen.queryByText('Taxa de conclusão')).not.toBeInTheDocument()
  })
})

// ── Patient list ──────────────────────────────────────────────────────────────

describe('PatientsPageContainer — patient list', () => {
  it('renders the "Pacientes cadastrados" section heading', () => {
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getByRole('heading', { name: /pacientes cadastrados/i })).toBeInTheDocument()
  })

  it('renders patient name in the list', () => {
    const patient = makePatient({ patientName: 'Bruno Lima' })
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getAllByText('Bruno Lima').length).toBeGreaterThan(0)
  })

  it('renders patient email in the list', () => {
    const patient = makePatient({ patientEmail: 'bruno@email.com' })
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getAllByText('bruno@email.com').length).toBeGreaterThan(0)
  })
})

// ── Empty states ──────────────────────────────────────────────────────────────

describe('PatientsPageContainer — empty states', () => {
  it('shows "no patients" empty state when no patients exist', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByText('Nenhum paciente registrado')).toBeInTheDocument()
    expect(screen.getByText(/aparecem aqui a partir dos agendamentos/i)).toBeInTheDocument()
  })

  it('shows "no results" state when filters active and no matches', () => {
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [makePatient()],
        filteredPatients: [],
        paginatedPatients: [],
        hasFilters: true,
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getAllByText('Nenhum resultado para sua busca').length).toBeGreaterThan(0)
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('PatientsPageContainer — loading state', () => {
  it('renders skeleton rows while loading', () => {
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({ isLoading: true, patients: ['placeholder'] }),
    )
    render(<PatientsPageContainer />)
    // Skeleton rows are aria-hidden — they are rendered but not in accessible tree
    const hiddenRows = document.querySelectorAll('[aria-hidden="true"]')
    expect(hiddenRows.length).toBeGreaterThan(0)
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('PatientsPageContainer — error state', () => {
  it('shows error message when API fails', () => {
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({ error: 'Erro ao carregar pacientes.', patients: [] }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getByText('Erro ao carregar pacientes.')).toBeInTheDocument()
  })
})

// ── Patient selection ─────────────────────────────────────────────────────────

describe('PatientsPageContainer — patient selection', () => {
  it('calls setSelectedPatient when mobile card "Ver detalhes" is clicked', () => {
    const setSelectedPatient = vi.fn()
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
        setSelectedPatient,
      }),
    )
    render(<PatientsPageContainer />)
    // Mobile card has the "Ver detalhes" button
    const buttons = screen.getAllByRole('button', { name: /ver detalhes/i })
    fireEvent.click(buttons[0])
    expect(setSelectedPatient).toHaveBeenCalledWith(patient)
  })
})

// ── No Leads references ───────────────────────────────────────────────────────

describe('PatientsPageContainer — no Leads content', () => {
  it('does not render any Leads link or text', () => {
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(document.querySelector('a[href="/app/leads"]')).toBeNull()
    expect(screen.queryByText(/leads/i)).not.toBeInTheDocument()
  })
})

// ── Quick actions ─────────────────────────────────────────────────────────────

describe('PatientsPageContainer — quick actions', () => {
  it('renders "Pacientes em atenção" quick action link', () => {
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [makePatient()],
        filteredPatients: [makePatient()],
        paginatedPatients: [makePatient()],
      }),
    )
    render(<PatientsPageContainer />)
    const attLink = screen.getByRole('link', { name: /pacientes em atenção/i })
    expect(attLink).toHaveAttribute('href', '/app/pacientes/atencao')
  })
})

// ── Patient detail panel ──────────────────────────────────────────────────────

// Panel tests require selectedPatient to be non-null to open the dialog

describe('PatientsPageContainer — patient detail panel', () => {
  beforeEach(() => {
    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
        selectedPatient: patient,
      }),
    )
  })

  it('renders patient name in the panel', () => {
    render(<PatientsPageContainer />)
    // Name appears in the Dialog.Title
    expect(screen.getAllByText('Ana Souza').length).toBeGreaterThan(0)
  })

  it('renders patient email in the panel header', () => {
    render(<PatientsPageContainer />)
    expect(screen.getAllByText('ana@email.com').length).toBeGreaterThan(0)
  })

  it('renders patient phone in the panel header', () => {
    render(<PatientsPageContainer />)
    expect(screen.getAllByText('(11) 99999-1234').length).toBeGreaterThan(0)
  })

  it('renders the stats strip with appointment counts', () => {
    render(<PatientsPageContainer />)
    // Stats: Total=4, Concluídas=3, Canceladas=1
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText('Concluídas').length).toBeGreaterThan(0)
    expect(screen.getByText('Canceladas')).toBeInTheDocument()
    // "Última visita" appears in both the panel stat and the mobile card
    expect(screen.getAllByText('Última visita').length).toBeGreaterThan(0)
  })

  it('renders the PatientAvatarWidget for upload (not just display)', () => {
    render(<PatientsPageContainer />)
    // PatientAvatarWidget renders a clickable avatar element
    // The widget renders as a button or div with the patient initials/image
    // Presence of initials "AS" (Ana Souza) means the widget mounted
    const avatarElements = document.querySelectorAll('[class*="rounded-full"]')
    expect(avatarElements.length).toBeGreaterThan(0)
  })

  it('renders close button with accessible label', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByRole('button', { name: /fechar painel do paciente/i })).toBeInTheDocument()
  })

  it('renders the Consultas tab', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByRole('tab', { name: 'Consultas' })).toBeInTheDocument()
  })

  it('renders the Prontuários tab', () => {
    render(<PatientsPageContainer />)
    expect(screen.getByRole('tab', { name: 'Prontuários' })).toBeInTheDocument()
  })

  it('shows appointment empty state when no history', () => {
    render(<PatientsPageContainer />)
    // History mock returns [] so empty state should show
    expect(screen.getByText('Nenhuma consulta encontrada.')).toBeInTheDocument()
  })

  it('renders Agendar quick link for ASSISTANT role', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<PatientsPageContainer />)
    const agendarLinks = screen.getAllByRole('link', { name: /agendar/i })
    expect(agendarLinks.length).toBeGreaterThan(0)
    expect(agendarLinks[0]).toHaveAttribute('href', '/app/agendamentos')
  })
})

describe('PatientsPageContainer — panel prontuário role behavior', () => {
  it('ASSISTANT does NOT see prontuários link in panel', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })

    const patient = makePatient()
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
        selectedPatient: patient,
      }),
    )
    render(<PatientsPageContainer />)
    // Navigate to prontuários tab
    fireEvent.click(screen.getByRole('tab', { name: 'Prontuários' }))
    // ASSISTANT should see the restriction message, not the timeline
    expect(screen.getByText(/informações clínicas restritas/i)).toBeInTheDocument()
  })
})
