import { act } from '@testing-library/react'

import { makeAppointment } from '@/test-utils/factories/appointment.factory'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { resetRouterMocks } from '@/test-utils/mocks/router'
import { renderHook, waitFor } from '@/test-utils/render-utils'

import { useAppointmentsPage } from '@/features/scheduling/hooks/useAppointmentsPage'
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
vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: (...args: unknown[]) => mockListAppointments(...args),
  listAvailability: (...args: unknown[]) => mockListAvailability(...args),
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

describe('useAppointmentsPage', () => {
  it('searches patient name, email and phone while handling absent contacts', async () => {
    const named = makeAppointment({
      id: 'name',
      patientName: 'Maria Lima',
      patientEmail: null,
      patientPhone: null,
    })
    const contacted = makeAppointment({
      id: 'contact',
      patientName: 'João',
      patientEmail: 'joao@example.com',
      patientPhone: '11987654321',
    })
    mockListAppointments.mockResolvedValue([named, contacted])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    for (const [query, expected] of [
      ['MARIA', named],
      ['example.com', contacted],
      ['987654321', contacted],
    ] as const) {
      act(() => result.current.setSearchQuery(query))
      await waitFor(() => expect(result.current.appointments).toEqual([expected]))
    }
    act(() => result.current.clearAll())
    await waitFor(() => expect(result.current.appointments).toEqual([named, contacted]))
  })

  it('combines status and professional filters and restores the full list on clear', async () => {
    const matching = makeAppointment({ id: 'match', profileId: 'prof-1', status: 'CONFIRMED' })
    const pending = makeAppointment({ id: 'pending', profileId: 'prof-1', status: 'PENDING' })
    const other = makeAppointment({ id: 'other', profileId: 'prof-2', status: 'CONFIRMED' })
    mockListAppointments.mockResolvedValue([matching, pending, other])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => {
      result.current.setFilter('status', 'CONFIRMED')
      result.current.setFilter('profileId', 'prof-1')
    })
    expect(result.current.appointments).toEqual([matching])
    expect(result.current.filteredCount).toBe(1)
    act(() => result.current.clearAll())
    expect(result.current.appointments).toEqual([matching, pending, other])
  })

  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMocks()
    resetAuthMocks()
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
    mockListAppointments.mockResolvedValue([])
    mockListProfiles.mockResolvedValue([])
    mockGetGoogleCalendarStatus.mockResolvedValue({
      connected: false,
      calendarSummary: null,
      connectedAt: null,
      lastSyncedAt: null,
    })
    mockListAvailability.mockResolvedValue([])
  })

  it('loads appointments and profiles, and stops loading', async () => {
    const appt = makeAppointment()
    mockListAppointments.mockResolvedValue([appt])
    mockListProfiles.mockResolvedValue([makeProfile()])

    const { result } = renderHook(() => useAppointmentsPage())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.allAppointments).toEqual([appt])
    expect(result.current.error).toBeNull()
  })

  it('sets an error and shows an alert when loading fails', async () => {
    mockListAppointments.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('network down')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao carregar agendamentos', tone: 'error' }),
    )
  })

  it('shows a generic error message for a non-Error rejection', async () => {
    mockListAppointments.mockRejectedValue('boom')

    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Erro ao carregar agendamentos.')
  })

  it('does not fetch Google Calendar status for a non-OWNER user', async () => {
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.canManageGoogleCalendar).toBe(false)
    expect(mockGetGoogleCalendarStatus).not.toHaveBeenCalled()
  })

  it('only includes the profile filter when there is more than one profile', async () => {
    mockListProfiles.mockResolvedValue([makeProfile()])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.filterDefs.some((f) => f.key === 'profileId')).toBe(false)

    mockListProfiles.mockResolvedValue([makeProfile({ id: 'p1' }), makeProfile({ id: 'p2' })])
    const { result: result2 } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result2.current.isLoading).toBe(false))
    expect(result2.current.filterDefs.some((f) => f.key === 'profileId')).toBe(true)
  })

  it('loads availability when a profile filter is selected, and clears it when unselected', async () => {
    const availability = [{ id: 'av-1' }]
    mockListAvailability.mockResolvedValue(availability)
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setFilter('profileId', 'prof-1'))
    await waitFor(() => expect(result.current.calendarAvailability).toEqual(availability))

    act(() => result.current.setFilter('profileId', null))
    await waitFor(() => expect(result.current.calendarAvailability).toEqual([]))
  })

  it('clears availability silently when listAvailability fails', async () => {
    mockListAvailability.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setFilter('profileId', 'prof-1'))
    await waitFor(() => expect(mockListAvailability).toHaveBeenCalled())
    expect(result.current.calendarAvailability).toEqual([])
  })

  it('handleCreated prepends the new appointment', async () => {
    const existing = makeAppointment({ id: 'a1' })
    mockListAppointments.mockResolvedValue([existing])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const created = makeAppointment({ id: 'a2' })
    act(() => result.current.handleCreated(created))
    expect(result.current.allAppointments.map((a) => a.id)).toEqual(['a2', 'a1'])
  })

  it('handleUpdated replaces the matching appointment and syncs the open drawer', async () => {
    const original = makeAppointment({ id: 'a1', patientName: 'Old' })
    mockListAppointments.mockResolvedValue([original])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDrawerAppointment(original))
    const updated = makeAppointment({ id: 'a1', patientName: 'New' })
    act(() => result.current.handleUpdated(updated))

    expect(result.current.allAppointments[0].patientName).toBe('New')
    expect(result.current.drawerAppointment?.patientName).toBe('New')
  })

  it('handleUpdated does not touch the drawer when a different appointment updates', async () => {
    const inDrawer = makeAppointment({ id: 'a1' })
    const other = makeAppointment({ id: 'a2' })
    mockListAppointments.mockResolvedValue([inDrawer, other])
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDrawerAppointment(inDrawer))
    const updatedOther = makeAppointment({ id: 'a2', patientName: 'Changed' })
    act(() => result.current.handleUpdated(updatedOther))

    expect(result.current.drawerAppointment?.id).toBe('a1')
  })

  it('handleEdit closes the drawer and opens the edit target', async () => {
    const appt = makeAppointment()
    const { result } = renderHook(() => useAppointmentsPage())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setDrawerAppointment(appt))
    act(() => result.current.handleEdit(appt))

    expect(result.current.drawerAppointment).toBeNull()
    expect(result.current.editTarget).toEqual(appt)
  })

  describe('Google Calendar actions', () => {
    it('handleConnectGoogleCalendar redirects to the returned URL', async () => {
      mockCreateGoogleCalendarConnectUrl.mockResolvedValue({ url: 'https://accounts.google.com/x' })
      const assignSpy = vi.fn()
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, assign: assignSpy },
        configurable: true,
        writable: true,
      })

      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

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

    it('handleConnectGoogleCalendar shows an error alert and resets loading on failure', async () => {
      mockCreateGoogleCalendarConnectUrl.mockRejectedValue(new Error('oauth failed'))
      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleConnectGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao conectar Google Agenda', tone: 'error' }),
      )
      expect(result.current.isCalendarActionLoading).toBe(false)
    })

    it('handleSyncGoogleCalendar syncs, refetches status, and shows a plural success message', async () => {
      mockSyncGoogleCalendar.mockResolvedValue({ synced: 3 })
      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleSyncGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Google Agenda sincronizado',
          description: '3 agendamentos sincronizados.',
        }),
      )
    })

    it('handleSyncGoogleCalendar shows a singular success message for 1 synced item', async () => {
      mockSyncGoogleCalendar.mockResolvedValue({ synced: 1 })
      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleSyncGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: '1 agendamento sincronizado.' }),
      )
    })

    it('handleSyncGoogleCalendar shows an error alert on failure', async () => {
      mockSyncGoogleCalendar.mockRejectedValue(new Error('sync failed'))
      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleSyncGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao sincronizar Google Agenda', tone: 'error' }),
      )
      expect(result.current.isCalendarActionLoading).toBe(false)
    })

    it('handleDisconnectGoogleCalendar disconnects and resets the status locally', async () => {
      mockDisconnectGoogleCalendar.mockResolvedValue(undefined)
      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleDisconnectGoogleCalendar()
      })
      expect(result.current.googleCalendar).toEqual({
        connected: false,
        calendarSummary: null,
        connectedAt: null,
        lastSyncedAt: null,
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Google Agenda desconectado', tone: 'success' }),
      )
    })

    it('handleDisconnectGoogleCalendar shows an error and re-syncs status on failure', async () => {
      mockDisconnectGoogleCalendar.mockRejectedValue(new Error('disconnect failed'))
      mockGetGoogleCalendarStatus
        .mockResolvedValueOnce({
          connected: true,
          calendarSummary: 'Agenda',
          connectedAt: '2026-01-01T00:00:00.000Z',
          lastSyncedAt: null,
        })
        .mockResolvedValueOnce({
          connected: true,
          calendarSummary: 'Agenda',
          connectedAt: '2026-01-01T00:00:00.000Z',
          lastSyncedAt: null,
        })

      const { result } = renderHook(() => useAppointmentsPage())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.handleDisconnectGoogleCalendar()
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao desconectar Google Agenda', tone: 'error' }),
      )
      await waitFor(() => expect(mockGetGoogleCalendarStatus).toHaveBeenCalledTimes(2))
    })
  })
})
