import { makeAssistantUser, makeDentistUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks, setMockSearch } from '@/test-utils/mocks/router'
import { renderHook, waitFor } from '@/test-utils/render-utils'

import { useSchedulePage } from '@/features/scheduling/hooks/useSchedulePage'

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

vi.mock('@/features/scheduling/services/scheduling.service', () => ({
  listAppointments: vi.fn().mockResolvedValue([]),
  listAvailability: vi.fn().mockResolvedValue([]),
  listAvailabilityExceptions: vi.fn().mockResolvedValue([]),
  updateAppointmentStatus: vi.fn(),
}))

vi.mock('@/features/scheduling/services/profiles.service', () => ({
  listProfiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/features/scheduling/services/calendar-integrations.service', () => ({
  createGoogleCalendarConnectUrl: vi.fn(),
  disconnectGoogleCalendar: vi.fn(),
  getGoogleCalendarStatus: vi.fn().mockResolvedValue({
    connected: false,
    calendarSummary: null,
    connectedAt: null,
    lastSyncedAt: null,
  }),
  syncGoogleCalendar: vi.fn(),
}))

vi.mock('@/lib/brazil-timezone', () => ({
  brazilTodayIso: vi.fn().mockReturnValue('2026-06-27'),
}))

vi.mock('@/features/scheduling/utils/time', () => ({
  getBrazilWeekStart: vi.fn().mockReturnValue('2026-06-22'),
}))

describe('useSchedulePage — Google Calendar OAuth callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMocks()
    resetAuthMocks()
    setMockAuthState({ user: makeDentistUser(), isAuthenticated: true })
  })

  it('shows a success alert when googleCalendar=connected', async () => {
    setMockSearch({ googleCalendar: 'connected' })
    renderHook(() => useSchedulePage())
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: 'success',
          title: 'Google Agenda conectado',
        }),
      )
    })
  })

  it('shows an error alert when googleCalendar=error with a message param', async () => {
    setMockSearch({ googleCalendar: 'error', message: 'Acesso negado pelo usuário' })
    renderHook(() => useSchedulePage())
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: 'error',
          title: 'Erro ao conectar Google Agenda',
          description: 'Acesso negado pelo usuário',
        }),
      )
    })
  })

  it('shows the default error message when googleCalendar=error and no message param', async () => {
    setMockSearch({ googleCalendar: 'error' })
    renderHook(() => useSchedulePage())
    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: 'error',
          description: 'Não foi possível conectar o Google Agenda.',
        }),
      )
    })
  })

  it('navigates with replace:true to clean callback params from the URL', async () => {
    setMockSearch({ googleCalendar: 'connected' })
    renderHook(() => useSchedulePage())
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/agenda', replace: true })
    })
  })

  it('does not show a callback alert or clean the URL when no callback params are present', async () => {
    renderHook(() => useSchedulePage())
    await waitFor(() => Promise.resolve())
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Google Agenda conectado' }),
    )
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao conectar Google Agenda' }),
    )
    expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/app/agenda', replace: true })
  })

  it('exposes canManageGoogleCalendar=true for DENTIST', async () => {
    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.canManageGoogleCalendar).toBe(true)
  })
})

describe('useSchedulePage — Google Calendar role gating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMocks()
    resetAuthMocks()
  })

  it('does not expose Google Calendar management for ASSISTANT', async () => {
    setMockAuthState({ user: makeAssistantUser(), isAuthenticated: true })
    const { result } = renderHook(() => useSchedulePage())
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.canManageGoogleCalendar).toBe(false)
  })
})
