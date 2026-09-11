import { act } from '@testing-library/react'

import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeDentistUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { resetRouterMocks } from '@/test-utils/mocks/router'
import { renderHook, waitFor } from '@/test-utils/render-utils'

import { useSchedulePage } from '@/features/scheduling/hooks/useSchedulePage'
import type { ProfileListItem } from '@/features/scheduling/types/profile.types'

const mockShowAlert = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const m = await import('@/test-utils/mocks/auth')
  return m.createUseAuthMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockListAppointments = vi.fn()
const mockListAvailability = vi.fn()
const mockListAvailabilityExceptions = vi.fn()
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: (...args: unknown[]) => mockListAppointments(...args),
  listAvailability: (...args: unknown[]) => mockListAvailability(...args),
  listAvailabilityExceptions: (...args: unknown[]) => mockListAvailabilityExceptions(...args),
  cancelAppointment: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}))

const mockListProfiles = vi.fn()
vi.mock('@/features/scheduling/services/profiles.service', () => ({
  listProfiles: (...args: unknown[]) => mockListProfiles(...args),
}))

const mockCreateGoogleCalendarConnectUrl = vi.fn()
const mockDisconnectGoogleCalendar = vi.fn()
const mockGetGoogleCalendarStatus = vi.fn()
const mockSyncGoogleCalendar = vi.fn()
vi.mock('@/features/scheduling/services/calendar-integrations.service', () => ({
  createGoogleCalendarConnectUrl: (...args: unknown[]) =>
    mockCreateGoogleCalendarConnectUrl(...args),
  disconnectGoogleCalendar: (...args: unknown[]) => mockDisconnectGoogleCalendar(...args),
  getGoogleCalendarStatus: (...args: unknown[]) => mockGetGoogleCalendarStatus(...args),
  syncGoogleCalendar: (...args: unknown[]) => mockSyncGoogleCalendar(...args),
}))

vi.mock('@/lib/brazil-timezone', () => ({
  brazilTodayIso: vi.fn().mockReturnValue('2026-06-27'),
}))

const DENTIST = makeDentistUser({ id: 'user-1' })

function makeProfile(overrides: Partial<ProfileListItem> = {}): ProfileListItem {
  return {
    id: 'prof-1',
    clinicId: 'clinic-1',
    userId: 'user-1',
    slug: 'dr-ana',
    displayName: 'Dra. Ana',
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

describe('useSchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMocks()
    resetAuthMocks()
    setMockAuthState({ user: DENTIST, isAuthenticated: true })
    mockListAppointments.mockResolvedValue([])
    mockListProfiles.mockResolvedValue([])
    mockListAvailability.mockResolvedValue([])
    mockListAvailabilityExceptions.mockResolvedValue([])
    mockGetGoogleCalendarStatus.mockResolvedValue({
      connected: false,
      calendarSummary: null,
      connectedAt: null,
      lastSyncedAt: null,
    })
  })

  it('finds the own profile, filters appointments to it, and loads availability/exceptions', async () => {
    const profile = makeProfile({ userId: 'user-1' })
    const mine = makeAppointment({ id: 'a1', profileId: 'prof-1' })
    const other = makeAppointment({ id: 'a2', profileId: 'prof-2' })
    mockListProfiles.mockResolvedValue([profile])
    mockListAppointments.mockResolvedValue([mine, other])
    mockListAvailability.mockResolvedValue([{ id: 'av-1' }])
    mockListAvailabilityExceptions.mockResolvedValue([{ id: 'ex-1' }])

    const { result } = renderHook(() => useSchedulePage())
    expect(result.current.isBootstrapping).toBe(true)

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.ownProfile).toEqual(profile)
    expect(result.current.appointments.map((a) => a.id)).toEqual(['a1'])
    expect(result.current.availability).toEqual([{ id: 'av-1' }])
    expect(result.current.exceptions).toEqual([{ id: 'ex-1' }])
  })

  it('leaves appointments empty and skips availability/exceptions when there is no matching profile', async () => {
    mockListProfiles.mockResolvedValue([makeProfile({ userId: 'someone-else' })])
    mockListAppointments.mockResolvedValue([makeAppointment()])

    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    expect(result.current.ownProfile).toBeNull()
    expect(result.current.appointments).toEqual([])
    expect(mockListAvailability).not.toHaveBeenCalled()
    expect(mockListAvailabilityExceptions).not.toHaveBeenCalled()
  })

  it('sets an error and shows an alert when loading fails', async () => {
    mockListProfiles.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    expect(result.current.error).toBe('network down')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar agenda', tone: 'error' }),
    )
  })

  it('shows a generic error message for a non-Error rejection', async () => {
    mockListProfiles.mockRejectedValue('boom')
    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.error).toBe('Erro ao carregar agenda.')
  })

  it('does not fetch Google Calendar status for a non-DENTIST user', async () => {
    setMockAuthState({ user: { ...DENTIST, role: 'OWNER' }, isAuthenticated: true })
    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    expect(result.current.canManageGoogleCalendar).toBe(false)
    expect(mockGetGoogleCalendarStatus).not.toHaveBeenCalled()
  })

  describe('Google Calendar actions', () => {
    it('reports a single synchronized appointment', async () => {
      mockSyncGoogleCalendar.mockResolvedValue({ synced: 1 })
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
      await act(() => result.current.handleSyncGoogleCalendar())
      expect(mockShowAlert).toHaveBeenLastCalledWith(
        expect.objectContaining({
          description: '1 agendamento sincronizado.',
          tone: 'success',
        }),
      )
    })

    it('handleConnectGoogleCalendar redirects to the returned URL', async () => {
      mockCreateGoogleCalendarConnectUrl.mockResolvedValue({ url: 'https://accounts.google.com/x' })
      const assignSpy = vi.fn()
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, assign: assignSpy },
        configurable: true,
        writable: true,
      })

      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleConnectGoogleCalendar()
      })
      expect(assignSpy).toHaveBeenCalledWith('https://accounts.google.com/x')

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      })
    })

    it('handleConnectGoogleCalendar shows an error alert on failure', async () => {
      mockCreateGoogleCalendarConnectUrl.mockRejectedValue(new Error('oauth failed'))
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleConnectGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao conectar Google Agenda', tone: 'error' }),
      )
      expect(result.current.isCalendarActionLoading).toBe(false)
    })

    it('handleSyncGoogleCalendar syncs and shows a plural success message', async () => {
      mockSyncGoogleCalendar.mockResolvedValue({ synced: 2 })
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleSyncGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: '2 agendamentos sincronizados.' }),
      )
    })

    it('handleSyncGoogleCalendar shows an error alert on failure', async () => {
      mockSyncGoogleCalendar.mockRejectedValue(new Error('sync failed'))
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleSyncGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao sincronizar Google Agenda', tone: 'error' }),
      )
    })

    it('handleDisconnectGoogleCalendar disconnects and resets status locally', async () => {
      mockDisconnectGoogleCalendar.mockResolvedValue(undefined)
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleDisconnectGoogleCalendar()
      })
      expect(result.current.googleCalendar).toEqual({
        connected: false,
        calendarSummary: null,
        connectedAt: null,
        lastSyncedAt: null,
      })
    })

    it('handleDisconnectGoogleCalendar shows an error and re-syncs status on failure', async () => {
      mockDisconnectGoogleCalendar.mockRejectedValue(new Error('disconnect failed'))
      const { result } = renderHook(() => useSchedulePage())
      await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

      await act(async () => {
        await result.current.handleDisconnectGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao desconectar Google Agenda', tone: 'error' }),
      )
    })
  })
})
