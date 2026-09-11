import { useAppointmentsPage } from '@/features/scheduling/hooks/useAppointmentsPage'
import { useSchedulePage } from '@/features/scheduling/hooks/useSchedulePage'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks, setMockSearch } from '@/test-utils/mocks/router'
import { renderHook, waitFor } from '@/test-utils/render-utils'
import { act } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  alert: vi.fn(),
  status: vi.fn(),
  connect: vi.fn(),
  sync: vi.fn(),
  disconnect: vi.fn(),
}))
vi.mock('@tanstack/react-router', async () =>
  (await import('@/test-utils/mocks/router')).createRouterMock(),
)
vi.mock('@/features/auth/hooks/useAuth', async () =>
  (await import('@/test-utils/mocks/auth')).createUseAuthMock(),
)
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mocks.alert }),
}))
vi.mock('@/features/scheduling/services/profiles.service', () => ({
  listProfiles: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: vi.fn().mockResolvedValue([]),
  listAvailability: vi.fn().mockResolvedValue([]),
  listAvailabilityExceptions: vi.fn().mockResolvedValue([]),
  cancelAppointment: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}))
vi.mock('@/features/scheduling/services/calendar-integrations.service', () => ({
  getGoogleCalendarStatus: mocks.status,
  createGoogleCalendarConnectUrl: mocks.connect,
  syncGoogleCalendar: mocks.sync,
  disconnectGoogleCalendar: mocks.disconnect,
}))

const disconnected = {
  connected: false,
  calendarSummary: null,
  connectedAt: null,
  lastSyncedAt: null,
}

describe.each([
  {
    name: 'appointments',
    usePage: useAppointmentsPage,
    user: makeOwnerUser(),
    deniedUser: makeDentistUser(),
    route: '/app/agendamentos',
  },
  {
    name: 'schedule',
    usePage: useSchedulePage,
    user: makeDentistUser(),
    deniedUser: makeOwnerUser(),
    route: '/app/agenda',
  },
])('$name calendar recovery', ({ usePage, user, deniedUser, route }) => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const mock of Object.values(mocks)) mock.mockReset()
    resetAuthMocks()
    resetRouterMocks()
    setMockAuthState({ user, isAuthenticated: true })
    mocks.status.mockResolvedValue(disconnected)
  })

  it('does not fetch calendar status for an unauthorized OAuth return', async () => {
    setMockAuthState({ user: deniedUser, isAuthenticated: true })
    setMockSearch({ googleCalendar: 'connected' })
    const { result } = renderHook(() => usePage())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: route, replace: true }))
    expect(result.current.canManageGoogleCalendar).toBe(false)
    expect(mocks.status).not.toHaveBeenCalled()
  })

  it('retains loaded status when the OAuth refresh fails', async () => {
    mocks.status
      .mockResolvedValueOnce(disconnected)
      .mockRejectedValueOnce(new Error('refresh failed'))
    setMockSearch({ googleCalendar: 'connected' })
    const { result } = renderHook(() => usePage())
    await waitFor(() => expect(result.current.googleCalendar).toEqual(disconnected))
    expect(mocks.status).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledWith({ to: route, replace: true })
  })

  it.each(['connect', 'sync', 'disconnect'] as const)(
    'recovers loading after a non-Error %s failure',
    async (action) => {
      const { result } = renderHook(() => usePage())
      await waitFor(() => expect(result.current.googleCalendar).toEqual(disconnected))
      mocks[action].mockRejectedValueOnce(null)
      if (action === 'disconnect') mocks.status.mockRejectedValueOnce(new Error('refresh failed'))
      await act(async () => {
        if (action === 'connect') await result.current.handleConnectGoogleCalendar()
        if (action === 'sync') await result.current.handleSyncGoogleCalendar()
        if (action === 'disconnect') await result.current.handleDisconnectGoogleCalendar()
      })
      expect(result.current.isCalendarActionLoading).toBe(false)
      expect(result.current.googleCalendar).toEqual(disconnected)
      expect(mocks.alert).toHaveBeenLastCalledWith(
        expect.objectContaining({ tone: 'error', description: undefined }),
      )
    },
  )
})
