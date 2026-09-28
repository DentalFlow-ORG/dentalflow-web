import { fireEvent, render, screen, waitFor, within } from '@/test-utils/render-utils'

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
const mockHistory = vi.fn()
const mockAvatar = vi.fn()
const mockUpdateAvatar = vi.fn()
const mockShowAlert = vi.fn()
vi.mock('@/features/patients/components/AvatarCropModal', () => ({
  AvatarCropModal: ({ open, onConfirm }: { open: boolean; onConfirm: (value: string) => void }) =>
    open ? (
      <button type="button" onClick={() => onConfirm('cropped-photo')}>
        Confirmar recorte
      </button>
    ) : null,
}))
vi.mock('@/features/patients/hooks/usePatientHistory', () => ({
  usePatientHistory: () => mockHistory(),
}))
vi.mock('@/features/clinical-records/hooks/usePatientClinicalTimeline', () => ({
  usePatientClinicalTimeline: () => ({ records: [], isLoading: false }),
}))
vi.mock('@/features/patients/hooks/usePatientAvatar', () => ({
  usePatientAvatar: () => mockAvatar(),
  setCachedPatientAvatar: vi.fn(),
}))
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makePatient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    patientId: null,
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
  mockHistory.mockReturnValue({ appointments: [], isLoading: false })
  mockUpdateAvatar.mockReset().mockResolvedValue(undefined)
  mockAvatar.mockReturnValue({ avatarUrl: null, isSaving: false, update: mockUpdateAvatar })
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

  it('uses the singular form for a patient with one appointment and one cancellation', () => {
    const patient = makePatient({ totalAppointments: 1, canceledAppointments: 1 })
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getByText('1 consulta')).toBeInTheDocument()
    expect(screen.getByText('1 cancelada')).toBeInTheDocument()
  })

  it('uses the plural form for a patient with several appointments and cancellations', () => {
    const patient = makePatient({ totalAppointments: 4, canceledAppointments: 2 })
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [patient],
        filteredPatients: [patient],
        paginatedPatients: [patient],
      }),
    )
    render(<PatientsPageContainer />)
    expect(screen.getByText('4 consultas')).toBeInTheDocument()
    expect(screen.getByText('2 canceladas')).toBeInTheDocument()
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

describe('PatientsPageContainer — detail interactions', () => {
  function preparePatient(overrides: Partial<PatientSummary> = {}, open = true) {
    const patient = makePatient(overrides)
    const state = makeDefaultHookState({
      patients: [patient],
      filteredPatients: [patient],
      paginatedPatients: [patient],
      selectedPatient: open ? patient : null,
    })
    mockUsePatientsPage.mockReturnValue(state)
    return { patient, state }
  }

  it.each(['Enter', ' '])('opens patient details with the %s key on a focused row', (key) => {
    const { patient, state } = preparePatient({}, false)
    render(<PatientsPageContainer />)
    const row = within(screen.getByRole('table')).getByRole('button', {
      name: 'Ver detalhes de Ana Souza',
    })
    row.focus()
    expect(row).toHaveFocus()
    fireEvent.keyDown(row, { key })
    expect(state.setSelectedPatient).toHaveBeenCalledExactlyOnceWith(patient)
  })

  it('ignores navigation keys and keyboard events bubbling from row descendants', () => {
    const { state } = preparePatient({}, false)
    render(<PatientsPageContainer />)
    const row = within(screen.getByRole('table')).getByRole('button')
    fireEvent.keyDown(row, { key: 'ArrowDown' })
    fireEvent.keyDown(within(row).getByText('Ana Souza'), { key: 'Enter' })
    expect(state.setSelectedPatient).not.toHaveBeenCalled()
    fireEvent.click(row)
    expect(state.setSelectedPatient).toHaveBeenCalledOnce()
  })

  it('renders appointment service, dentist, schedule, notes and nullable detail fallbacks', () => {
    preparePatient()
    const appointment = {
      id: 'a1',
      appointmentDate: '2026-06-01',
      startTime: '09:00',
      endTime: '09:30',
      status: 'COMPLETED',
      patientName: 'Ana Souza',
      patientEmail: null,
      patientPhone: null,
      notes: 'Retorno em seis meses',
      service: { id: 's1', name: 'Limpeza preventiva' },
      profile: { id: 'p1', displayName: 'Dra. Beatriz' },
    }
    mockHistory.mockReturnValue({
      appointments: [
        appointment,
        { ...appointment, id: 'a2', service: null, profile: null, notes: null },
      ],
      isLoading: false,
    })
    render(<PatientsPageContainer />)
    const panel = within(screen.getByRole('tabpanel'))
    expect(panel.getByText('Limpeza preventiva')).toBeInTheDocument()
    expect(panel.getByText('Dra. Beatriz')).toBeInTheDocument()
    expect(panel.getByText('Retorno em seis meses')).toBeInTheDocument()
    expect(panel.getByText('Consulta')).toBeInTheDocument()
    expect(panel.getAllByText(/01\/06\/2026 · 09:00–09:30/)).toHaveLength(2)
    expect(panel.getAllByText('Concluído')).toHaveLength(2)
  })

  it('handles a patient without contacts, visits or appointments', () => {
    preparePatient({
      patientEmail: null,
      patientPhone: null,
      lastVisit: null,
      totalAppointments: 0,
      completedAppointments: 0,
      canceledAppointments: 0,
    })
    render(<PatientsPageContainer />)
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByRole('link', { name: 'Ligar' })).not.toBeInTheDocument()
    expect(dialog.queryByRole('link', { name: 'E-mail' })).not.toBeInTheDocument()
    expect(dialog.getByText('Nenhuma consulta encontrada.')).toBeInTheDocument()
    expect(dialog.getByText('—')).toBeInTheDocument()
  })

  it('retries a failed patient list request through Atualizar', () => {
    const state = makeDefaultHookState({ error: 'Serviço indisponível' })
    mockUsePatientsPage.mockReturnValue(state)
    const { rerender } = render(<PatientsPageContainer />)
    expect(screen.getByText('Serviço indisponível')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }))
    expect(state.handleRefresh).toHaveBeenCalledOnce()
    preparePatient({}, false)
    rerender(<PatientsPageContainer />)
    expect(screen.queryByText('Serviço indisponível')).not.toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveTextContent('Ana Souza')
  })

  it('passes the entered patient search to the list hook', () => {
    const { state } = preparePatient({}, false)
    render(<PatientsPageContainer />)
    fireEvent.change(screen.getByLabelText('Buscar paciente'), { target: { value: 'Ana' } })
    expect(state.handleSearchChange).toHaveBeenCalledWith('Ana')
  })

  it('limits the patient search to the API maximum of 100 characters', () => {
    preparePatient({}, false)
    render(<PatientsPageContainer />)
    expect(screen.getByLabelText('Buscar paciente')).toHaveAttribute('maxLength', '100')
  })

  it('shows the clinical empty state for an authorized owner and returns to appointments', () => {
    preparePatient()
    render(<PatientsPageContainer />)
    fireEvent.click(screen.getByRole('tab', { name: 'Prontuários' }))
    expect(screen.getByText('Nenhum prontuário encontrado.')).toBeInTheDocument()
    expect(screen.queryByText(/Informações clínicas restritas/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Consultas' }))
    expect(screen.getByText('Nenhuma consulta encontrada.')).toBeInTheDocument()
  })

  it.each(['close button', 'Escape'])('dismisses details using %s', (method) => {
    const { state } = preparePatient()
    render(<PatientsPageContainer />)
    if (method === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    else fireEvent.click(screen.getByRole('button', { name: 'Fechar painel do paciente' }))
    expect(state.setSelectedPatient).toHaveBeenCalledWith(null)
  })

  it('reports successful avatar removal', async () => {
    preparePatient()
    mockAvatar.mockReturnValue({ avatarUrl: 'photo', isSaving: false, update: mockUpdateAvatar })
    render(<PatientsPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Alterar foto do paciente' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remover foto' }))
    // Removing a stored photo is confirmed first.
    expect(mockUpdateAvatar).not.toHaveBeenCalled()
    const dialog = await screen.findByRole('dialog', { name: 'Remover foto do paciente?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover foto' }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Foto removida.',
        description: 'A foto do paciente foi removida.',
        tone: 'success',
      }),
    )
    expect(mockUpdateAvatar).toHaveBeenCalledExactlyOnceWith(null)
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Remover foto do paciente?' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps the stored photo when the removal confirmation is dismissed', async () => {
    preparePatient()
    mockAvatar.mockReturnValue({ avatarUrl: 'photo', isSaving: false, update: mockUpdateAvatar })
    render(<PatientsPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Alterar foto do paciente' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remover foto' }))
    const dialog = await screen.findByRole('dialog', { name: 'Remover foto do paciente?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Remover foto do paciente?' }),
      ).not.toBeInTheDocument(),
    )
    expect(mockUpdateAvatar).not.toHaveBeenCalled()
  })

  it('reports avatar persistence failure and allows another attempt', async () => {
    preparePatient()
    mockUpdateAvatar.mockRejectedValueOnce(new Error('offline'))
    mockAvatar.mockReturnValue({ avatarUrl: 'photo', isSaving: false, update: mockUpdateAvatar })
    render(<PatientsPageContainer />)
    fireEvent.click(screen.getByRole('button', { name: 'Alterar foto do paciente' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remover foto' }))
    const dialog = await screen.findByRole('dialog', { name: 'Remover foto do paciente?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover foto' }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Não foi possível salvar a foto.',
        tone: 'error',
      }),
    )
    // The confirmation stays open after a failure so the removal can be retried.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover foto' }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Foto removida.',
          tone: 'success',
        }),
      ),
    )
    expect(mockUpdateAvatar).toHaveBeenCalledTimes(2)
  })

  it('reports invalid image input without persisting it', () => {
    preparePatient()
    render(<PatientsPageContainer />)
    const input = screen.getByRole('dialog').querySelector('input[type="file"]')
    if (!input) throw new Error('Missing avatar file input')
    fireEvent.change(input, {
      target: { files: [new File(['text'], 'photo.txt', { type: 'text/plain' })] },
    })
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Foto inválida',
      description: 'Formato inválido. Envie apenas JPEG, PNG ou WebP.',
      tone: 'error',
    })
    expect(mockUpdateAvatar).not.toHaveBeenCalled()
  })

  it('saves a confirmed avatar crop and reports success', async () => {
    preparePatient()
    render(<PatientsPageContainer />)
    const input = screen.getByRole('dialog').querySelector('input[type="file"]')
    if (!input) throw new Error('Missing avatar file input')
    fireEvent.change(input, {
      target: { files: [new File(['photo'], 'photo.png', { type: 'image/png' })] },
    })
    expect(mockUpdateAvatar).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar recorte' }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Foto atualizada.',
        description: 'A foto do paciente foi salva.',
        tone: 'success',
      }),
    )
    expect(mockUpdateAvatar).toHaveBeenCalledExactlyOnceWith('cropped-photo')
  })
})

// ── Two patients sharing one contact identifier ───────────────────────────────

describe('PatientsPageContainer — household sharing an email address', () => {
  it('renders both patients as separate rows', () => {
    // Regression: rows were keyed on the contact identifier, which a household
    // shares, so React saw duplicate keys and could reconcile a row onto the
    // wrong patient. Identity is the key now.
    const marta = makePatient({
      patientId: 'patient-a',
      identifier: 'familia@email.com',
      patientName: 'Marta Lima',
    })
    const pedro = makePatient({
      patientId: 'patient-b',
      identifier: 'familia@email.com',
      patientName: 'Pedro Lima',
    })
    mockUsePatientsPage.mockReturnValue(
      makeDefaultHookState({
        patients: [marta, pedro],
        filteredPatients: [marta, pedro],
        paginatedPatients: [marta, pedro],
      }),
    )

    render(<PatientsPageContainer />)

    expect(screen.getAllByText('Marta Lima').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pedro Lima').length).toBeGreaterThan(0)
  })
})
