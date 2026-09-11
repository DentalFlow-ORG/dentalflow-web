import { createClinicalRecord } from '@/features/clinical-records/services/clinical-records.service'
import { act, render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import { AppointmentClinicalSection } from '@/features/scheduling/components/appointments/AppointmentClinicalSection'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import {
  makeAssistantUser,
  makeDentistUser,
  makeOwnerUser,
} from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

const { mockLookup, mockNavigate, mockAlert } = vi.hoisted(() => ({
  mockLookup: vi.fn(),
  mockNavigate: vi.fn(),
  mockAlert: vi.fn(),
}))
vi.mock('@/features/clinical-records/hooks/useClinicalRecord', () => ({
  useClinicalRecordByAppointment: mockLookup,
}))

vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  createClinicalRecord: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockAlert, dismissAlert: vi.fn() }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthMocks()
  mockLookup.mockReturnValue({ record: null, isLoading: false })
})

const appointment = makeAppointment()

describe('AppointmentClinicalSection — role gate', () => {
  it('renders the Prontuário section for OWNER', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<AppointmentClinicalSection appointment={appointment} onClose={vi.fn()} />)
    expect(screen.getByText('Prontuário')).toBeInTheDocument()
  })

  it('renders the Prontuário section for DENTIST', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    render(<AppointmentClinicalSection appointment={appointment} onClose={vi.fn()} />)
    expect(screen.getByText('Prontuário')).toBeInTheDocument()
  })

  it('renders nothing for ASSISTANT', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    const { container } = render(
      <AppointmentClinicalSection appointment={appointment} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('AppointmentClinicalSection — no record state', () => {
  it('shows "Criar prontuário" when no record exists', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<AppointmentClinicalSection appointment={appointment} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Criar prontuário clínico/i })).toBeInTheDocument()
  })
})

describe('AppointmentClinicalSection — clinical workflow', () => {
  beforeEach(() => setMockAuthState({ user: makeDentistUser(), isAuthenticated: true }))

  it('does not load clinical data without an authenticated user', () => {
    setMockAuthState({ user: null, isAuthenticated: false })
    render(<AppointmentClinicalSection appointment={appointment} onClose={vi.fn()} />)
    expect(mockLookup).not.toHaveBeenCalled()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('waits for the lookup before allowing creation and opens an existing record', async () => {
    mockLookup.mockReturnValue({ record: null, isLoading: true })
    const onClose = vi.fn()
    const { rerender } = render(
      <AppointmentClinicalSection appointment={appointment} onClose={onClose} />,
    )
    expect(screen.getByText('Verificando prontuário...')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    mockLookup.mockReturnValue({ record: { id: 'record-existing' }, isLoading: false })
    rerender(<AppointmentClinicalSection appointment={appointment} onClose={onClose} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Abrir prontuário clínico' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/app/prontuario/$clinicalRecordId',
      params: { clinicalRecordId: 'record-existing' },
    })
    expect(createClinicalRecord).not.toHaveBeenCalled()
  })

  it.each([false, true])('creates a record with nullable contacts: %s', async (nullable) => {
    const appt = makeAppointment(
      nullable ? { profile: undefined, patientEmail: null, patientPhone: null } : {},
    )
    let resolve!: (value: Awaited<ReturnType<typeof createClinicalRecord>>) => void
    vi.mocked(createClinicalRecord).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    const onClose = vi.fn()
    render(<AppointmentClinicalSection appointment={appt} onClose={onClose} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Criar prontuário clínico' }))
    expect(screen.getByRole('button', { name: 'Criando prontuário' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Criando prontuário' }))
    expect(createClinicalRecord).toHaveBeenCalledExactlyOnceWith({
      appointmentId: appt.id,
      profileId: appt.profile?.id ?? appt.profileId,
      patientName: appt.patientName,
      patientEmail: appt.patientEmail ?? undefined,
      patientPhone: appt.patientPhone ?? undefined,
    })
    expect(onClose).not.toHaveBeenCalled()
    await act(async () =>
      resolve({ id: 'record-created' } as Awaited<ReturnType<typeof createClinicalRecord>>),
    )
    expect(onClose).toHaveBeenCalledOnce()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/app/prontuario/$clinicalRecordId',
      params: { clinicalRecordId: 'record-created' },
    })
  })

  it('keeps the drawer open on failure and permits creation retry', async () => {
    vi.mocked(createClinicalRecord)
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce({ id: 'retried' } as Awaited<ReturnType<typeof createClinicalRecord>>)
    const onClose = vi.fn()
    render(<AppointmentClinicalSection appointment={appointment} onClose={onClose} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Criar prontuário clínico' }))
    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Não foi possível criar o prontuário.',
        tone: 'error',
      }),
    )
    expect(onClose).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Criar prontuário clínico' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(createClinicalRecord).toHaveBeenCalledTimes(2)
  })
})
