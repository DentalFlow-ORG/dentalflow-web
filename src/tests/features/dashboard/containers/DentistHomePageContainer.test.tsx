import { render, screen, waitFor } from '@/test-utils/render-utils'

import { DentistHomePageContainer } from '@/features/dashboard/containers/DentistHomePageContainer'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeDentistUser } from '@/test-utils/factories/user.factory'
import { setMockAuthState, resetAuthMocks } from '@/test-utils/mocks/auth'
import type { ProfileListItem } from '@/features/scheduling/types/profile.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

const mockListProfiles = vi.fn()
const mockListAppointments = vi.fn()

vi.mock('@/features/scheduling/services/profiles.service', () => ({
  listProfiles: () => mockListProfiles(),
}))

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: () => mockListAppointments(),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeProfile(overrides?: Partial<ProfileListItem>): ProfileListItem {
  return {
    id: 'profile-dr-silva',
    clinicId: 'clinic-1',
    userId: 'user-dentist-1',
    slug: 'dr-silva',
    displayName: 'Dr. Silva',
    avatarUrl: null,
    isPublished: true,
    viewsCount: 0,
    city: null,
    state: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

const DENTIST_USER = makeDentistUser({ id: 'user-dentist-1' })
const OWN_PROFILE = makeProfile({ userId: 'user-dentist-1' })
const OTHER_PROFILE = makeProfile({ id: 'profile-other', userId: 'user-other-dentist', displayName: 'Dra. Lima' })

const OWN_APPT = makeAppointment({ profileId: 'profile-dr-silva', patientName: 'Paciente Próprio' })
const OTHER_APPT = makeAppointment({ id: 'appt-other', profileId: 'profile-other', patientName: 'Paciente de Outro' })

beforeEach(() => {
  // No fake timers — waitFor uses setTimeout internally and hangs under fake timers.
  // This component does not require timer-controlled date logic for these tests.
  setMockAuthState({ user: DENTIST_USER, isAuthenticated: true })
  mockListProfiles.mockResolvedValue([OWN_PROFILE, OTHER_PROFILE])
  mockListAppointments.mockResolvedValue([OWN_APPT, OTHER_APPT])
})

afterEach(() => {
  resetAuthMocks()
  vi.clearAllMocks()
})

// ── Appointment scoping ───────────────────────────────────────────────────────

describe('DentistHomePageContainer — appointment scoping', () => {
  it('shows only appointments belonging to the dentist\'s own profile', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Paciente Próprio')).toBeInTheDocument()
    })
    expect(screen.queryByText('Paciente de Outro')).not.toBeInTheDocument()
  })

  it('does not count another dentist\'s appointments in the metric cards', async () => {
    render(<DentistHomePageContainer />)
    // Wait for data to load — OWN_APPT has status PENDING so pending count should be 1
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    // Total should be 1 (own), not 2 (all clinic)
    const metricValues = screen.getAllByText('1')
    expect(metricValues.length).toBeGreaterThan(0)
    // Should NOT show 2 (which would be the total if unfiltered)
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('shows empty state when dentist has no linked profile', async () => {
    // Return profiles where none match the dentist's userId
    mockListProfiles.mockResolvedValue([OTHER_PROFILE])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText('Nenhuma consulta pendente para hoje.')).toBeInTheDocument()
    })
  })

  it('shows zero appointments when own profile is not found', async () => {
    mockListProfiles.mockResolvedValue([OTHER_PROFILE])
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    // All 4 metric cards (total, confirmed, pending, completed) should show 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(4)
  })

  it('shows error state when the API call fails', async () => {
    mockListAppointments.mockRejectedValue(new Error('Network error'))
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
    })
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — loading state', () => {
  it('shows a loading spinner initially', () => {
    // Don't resolve the promise immediately
    mockListProfiles.mockReturnValue(new Promise(() => {}))
    render(<DentistHomePageContainer />)
    // The spinner renders while loading
    const spinner = document.querySelector('[class*="animate-spin"]')
    expect(spinner).toBeTruthy()
  })
})

// ── Quick actions ─────────────────────────────────────────────────────────────

describe('DentistHomePageContainer — quick actions', () => {
  it('renders a Minha agenda quick action link', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /minha agenda/i })).toHaveAttribute('href', '/app/agenda')
  })

  it('renders a Prontuários quick action link (DENTIST is allowed)', async () => {
    render(<DentistHomePageContainer />)
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /prontuários/i })).toHaveAttribute('href', '/app/prontuario')
  })
})
