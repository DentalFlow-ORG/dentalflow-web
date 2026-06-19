import { render, screen } from '@/test-utils/render-utils'

import { AppointmentNotificationSection } from '@/features/scheduling/components/appointments/AppointmentNotificationSection'
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

// Stub the notification component to avoid its internal hook dependencies
vi.mock('@/features/notifications/components/AppointmentNotificationActions', () => ({
  AppointmentNotificationActions: ({ patientPhone }: { patientPhone: string }) => (
    <div data-testid="notification-actions">{patientPhone}</div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthMocks()
})

const withPhone = makeAppointment({ patientPhone: '+5511999999999' })
const noPhone = makeAppointment({ patientPhone: null })

describe('AppointmentNotificationSection — role gate', () => {
  it('renders for OWNER when phone is present', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    render(<AppointmentNotificationSection appointment={withPhone} />)
    expect(screen.getByTestId('notification-actions')).toBeInTheDocument()
  })

  it('renders for ASSISTANT when phone is present', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    render(<AppointmentNotificationSection appointment={withPhone} />)
    expect(screen.getByTestId('notification-actions')).toBeInTheDocument()
  })

  it('renders nothing for DENTIST even when phone is present', () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    const { container } = render(<AppointmentNotificationSection appointment={withPhone} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for OWNER when phone is absent', () => {
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    const { container } = render(<AppointmentNotificationSection appointment={noPhone} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for ASSISTANT when phone is absent', () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    const { container } = render(<AppointmentNotificationSection appointment={noPhone} />)
    expect(container).toBeEmptyDOMElement()
  })
})
