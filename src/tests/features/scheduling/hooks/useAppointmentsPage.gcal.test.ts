import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks, setMockSearch } from '@/test-utils/mocks/router'
import { renderHook, waitFor } from '@/test-utils/render-utils'

import { useAppointmentsPage } from '@/features/scheduling/hooks/useAppointmentsPage'

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
  cancelAppointment: vi.fn(),
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

describe('useAppointmentsPage — Google Calendar OAuth callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRouterMocks()
    resetAuthMocks()
    setMockAuthState({ user: makeOwnerUser(), isAuthenticated: true })
  })

  it('shows a success alert when googleCalendar=connected', async () => {
    setMockSearch({ googleCalendar: 'connected' })
    renderHook(() => useAppointmentsPage())
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
    renderHook(() => useAppointmentsPage())
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
    renderHook(() => useAppointmentsPage())
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
    renderHook(() => useAppointmentsPage())
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/agendamentos', replace: true })
    })
  })

  it('does not show a callback alert or clean the URL when no callback params are present', async () => {
    renderHook(() => useAppointmentsPage())
    await waitFor(() => Promise.resolve())
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Google Agenda conectado' }),
    )
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao conectar Google Agenda' }),
    )
    expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/app/agendamentos', replace: true })
  })
})
