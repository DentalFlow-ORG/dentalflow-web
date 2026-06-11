import { render, screen } from '@/test-utils/render-utils'

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

vi.mock('@/features/clinical-records/hooks/useClinicalRecord', () => ({
  useClinicalRecordByAppointment: () => ({ record: null, isLoading: false }),
}))

vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  createClinicalRecord: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: vi.fn(), dismissAlert: vi.fn() }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthMocks()
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
