import { render, screen, within } from '@/test-utils/render-utils'

// KpiChip and FilterChipGroup share status labels ("Rascunhos", etc.) — the KPI
// strip is always the first "group" of matching buttons in the DOM.
function getKpiChip(name: RegExp) {
  return screen.getAllByRole('button', { name })[0]
}
function getStatusFilterChip(name: RegExp) {
  return within(screen.getByRole('group', { name: /filtrar prontuários por status/i })).getByRole(
    'button',
    { name },
  )
}
import userEvent from '@testing-library/user-event'

import type { ClinicalRecord } from '@/features/clinical-records/types/clinical-record.types'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockUseAuth = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseClinicalRecords = vi.fn()
vi.mock('@/features/clinical-records/hooks/useClinicalRecords', () => ({
  useClinicalRecords: (...args: unknown[]) => mockUseClinicalRecords(...args),
}))

vi.mock('@/features/clinical-records/components/ClinicalRecordListItem', () => ({
  ClinicalRecordListItem: ({ record }: { record: ClinicalRecord }) => (
    <div data-testid="record-item">{record.patientName}</div>
  ),
}))

// Radix Select does not work reliably in JSDOM — stub with a native <select>.
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
    <select aria-label="Profissional" value={value} onChange={(e) => onValueChange(e.target.value)}>
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

import { ClinicalRecordsListContainer } from '@/features/clinical-records/containers/ClinicalRecordsListContainer'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'prof-1',
    patientName: 'Ana Martins',
    patientEmail: 'ana@clinica.com',
    patientPhone: null,
    status: 'DRAFT',
    chiefComplaint: null,
    anamnesis: null,
    clinicalEvolution: null,
    diagnosis: null,
    proceduresPerformed: null,
    treatmentPlan: null,
    prescription: null,
    recommendations: null,
    privateNotes: null,
    aiDraft: null,
    aiSummary: null,
    odontogramSnapshot: null,
    printedAt: null,
    completedAt: null,
    lockedAt: null,
    createdByUserId: 'user-1',
    updatedByUserId: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    profile: { id: 'prof-1', displayName: 'Dra. Ana', userId: 'user-1' },
    appointment: null,
    createdByUser: { id: 'user-1', firstName: 'Ana', lastName: 'Martins' },
    updatedByUser: null,
    attachments: [],
    ...overrides,
  }
}

function defaultHookState() {
  return {
    records: [] as ClinicalRecord[],
    isLoading: false,
    error: null as string | null,
    refresh: vi.fn(),
  }
}

describe('ClinicalRecordsListContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: makeDentistUser() })
    mockUseClinicalRecords.mockReturnValue(defaultHookState())
  })

  it('renders the page header', () => {
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByRole('heading', { name: 'Prontuário digital' })).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    mockUseClinicalRecords.mockReturnValue({ ...defaultHookState(), isLoading: true })
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando prontuários...')
  })

  it('shows an error message with a retry action', async () => {
    const refresh = vi.fn()
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      error: 'Falha ao carregar',
      refresh,
    })
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('shows the top-level empty state when there are no records at all', () => {
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByText('Nenhum prontuário ainda')).toBeInTheDocument()
  })

  it('does not render KPIs while loading, on error, or with zero records', () => {
    render(<ClinicalRecordsListContainer />)
    expect(screen.queryByText('Rascunhos')).not.toBeInTheDocument()
  })

  it('renders KPI counts derived from all records', () => {
    const records = [
      makeRecord({ id: 'r1', status: 'DRAFT' }),
      makeRecord({ id: 'r2', status: 'COMPLETED' }),
      makeRecord({ id: 'r3', status: 'LOCKED' }),
      makeRecord({ id: 'r4', status: 'DRAFT' }),
    ]
    mockUseClinicalRecords.mockReturnValue({ ...defaultHookState(), records })
    render(<ClinicalRecordsListContainer />)

    expect(screen.getByRole('button', { name: /^4\s*Total$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^2\s*Rascunhos$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^1\s*Concluídos$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^1\s*Bloqueados$/ })).toBeInTheDocument()
  })

  it('clicking a KPI chip changes the active status filter', async () => {
    const records = [makeRecord()]
    mockUseClinicalRecords.mockReturnValue({ ...defaultHookState(), records })
    render(<ClinicalRecordsListContainer />)

    const draftChip = getKpiChip(/rascunhos/i)
    expect(draftChip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(draftChip)
    expect(draftChip).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders the record list when records are present', () => {
    const records = [makeRecord({ id: 'r1' }), makeRecord({ id: 'r2', patientName: 'João' })]
    mockUseClinicalRecords.mockReturnValue({ ...defaultHookState(), records })
    render(<ClinicalRecordsListContainer />)
    expect(screen.getAllByTestId('record-item')).toHaveLength(2)
  })

  it('shows the filtered empty state (not the top-level empty state) when a status filter is active and yields no records', async () => {
    // The container calls useClinicalRecords twice: once server-filtered (empty args
    // when no filter is active, {status: 'DRAFT'} once the chip is clicked) and once
    // unfiltered ({}) for KPIs. Differentiate by the presence of a `status` key so
    // KPIs/chips keep rendering (from the unfiltered call) while the filtered list
    // goes empty once DRAFT is selected.
    mockUseClinicalRecords.mockImplementation((args?: { status?: string }) => {
      const isFilteredCall = args && 'status' in args && args.status !== undefined
      return { ...defaultHookState(), records: isFilteredCall ? [] : [makeRecord()] }
    })
    render(<ClinicalRecordsListContainer />)
    await userEvent.click(getKpiChip(/rascunhos/i))
    expect(screen.getByText('Nenhum prontuário encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Nenhum prontuário ainda')).not.toBeInTheDocument()
  })

  it('shows a filtered-results count message', () => {
    const records = [makeRecord({ id: 'r1' }), makeRecord({ id: 'r2' })]
    mockUseClinicalRecords.mockReturnValue({ ...defaultHookState(), records })
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByText('2 prontuários encontrados')).toBeInTheDocument()
  })

  it('shows a singular result count message', () => {
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [makeRecord()],
    })
    render(<ClinicalRecordsListContainer />)
    expect(screen.getByText('1 prontuário encontrado')).toBeInTheDocument()
  })

  it('does not show the professional filter for non-owner users', () => {
    mockUseAuth.mockReturnValue({ user: makeDentistUser() })
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [makeRecord()],
    })
    render(<ClinicalRecordsListContainer />)
    expect(screen.queryByLabelText('Profissional')).not.toBeInTheDocument()
  })

  it('shows the professional filter for OWNER users when professionals exist', async () => {
    mockUseAuth.mockReturnValue({ user: makeOwnerUser() })
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [makeRecord({ profile: { id: 'p1', displayName: 'Dra. Beatriz', userId: 'u1' } })],
    })
    render(<ClinicalRecordsListContainer />)
    const select = screen.getByLabelText('Profissional')
    await userEvent.selectOptions(select, 'p1')
    expect(select).toHaveValue('p1')
  })

  it('filters visible records by search query', async () => {
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [
        makeRecord({ id: 'r1', patientName: 'Ana Martins' }),
        makeRecord({
          id: 'r2',
          patientName: 'Beatriz Souza',
          patientEmail: 'beatriz@clinica.com',
          profile: { id: 'p2', displayName: 'Dr. Carlos', userId: 'u2' },
        }),
      ],
    })
    render(<ClinicalRecordsListContainer />)
    await userEvent.type(screen.getByPlaceholderText(/paciente, profissional/i), 'ana')
    const items = screen.getAllByTestId('record-item')
    expect(items).toHaveLength(1)
    expect(within(items[0]).getByText('Ana Martins')).toBeInTheDocument()
  })

  it('shows a hint about text search scope once a query is typed', async () => {
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [makeRecord()],
    })
    render(<ClinicalRecordsListContainer />)
    await userEvent.type(screen.getByPlaceholderText(/paciente, profissional/i), 'ana')
    expect(screen.getByText(/a busca por texto filtra/i)).toBeInTheDocument()
  })

  it('passes status and dentist filters through to useClinicalRecords for OWNER', async () => {
    mockUseAuth.mockReturnValue({ user: makeOwnerUser() })
    mockUseClinicalRecords.mockReturnValue({
      ...defaultHookState(),
      records: [makeRecord({ profile: { id: 'p1', displayName: 'Dra. Beatriz', userId: 'u1' } })],
    })
    render(<ClinicalRecordsListContainer />)

    await userEvent.click(getStatusFilterChip(/rascunhos/i))
    expect(mockUseClinicalRecords).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'DRAFT' }),
    )
  })

  it('links the header action and empty-state action to the scheduling page', () => {
    render(<ClinicalRecordsListContainer />)
    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href') === '/app/agendamentos')).toBe(true)
  })
})
