import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})
vi.mock('@/lib/brazil-timezone', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/brazil-timezone')>()),
  brazilTodayIso: () => '2026-06-04',
}))

const baseHookState = {
  ownProfile: { id: 'profile-1' } as { id: string } | null,
  appointments: [],
  availability: [],
  setAvailability: vi.fn(),
  exceptions: [],
  setExceptions: vi.fn(),
  isBootstrapping: false,
  error: null as string | null,
  activeTab: 'agenda' as 'agenda' | 'disponibilidade' | 'excecoes',
  setActiveTab: vi.fn(),
  view: 'calendar' as 'calendar' | 'table',
  setView: vi.fn(),
  weekStart: new Date(2026, 5, 1),
  setWeekStart: vi.fn(),
  drawerAppointment: null,
  setDrawerAppointment: vi.fn(),
  isActionLoading: false,
  handleStatusChange: vi.fn(),
  googleCalendar: null,
  isCalendarActionLoading: false,
  canManageGoogleCalendar: false,
  handleConnectGoogleCalendar: vi.fn(),
  handleSyncGoogleCalendar: vi.fn(),
  handleDisconnectGoogleCalendar: vi.fn(),
}

let mockHookState = { ...baseHookState }
const mockUseSchedulePage = vi.fn(() => mockHookState)
vi.mock('@/features/scheduling/hooks/useSchedulePage', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/scheduling/hooks/useSchedulePage')
  >('@/features/scheduling/hooks/useSchedulePage')
  return {
    ...actual,
    useSchedulePage: () => mockUseSchedulePage(),
  }
})

vi.mock('@/features/scheduling/components/calendar/WeekCalendar', () => ({
  WeekCalendar: ({ onAppointmentClick }: { onAppointmentClick: (a: unknown) => void }) => (
    <button type="button" onClick={() => onAppointmentClick({ id: 'appt-1' })}>
      week-calendar
    </button>
  ),
}))

vi.mock('@/features/scheduling/components/appointments/AppointmentTable', () => ({
  AppointmentTable: () => <div data-testid="appointment-table" />,
}))

vi.mock('@/features/scheduling/components/availability/AvailabilityManager', () => ({
  AvailabilityManager: () => <div data-testid="availability-manager" />,
}))

vi.mock('@/features/scheduling/components/availability/ExceptionManager', () => ({
  ExceptionManager: () => <div data-testid="exception-manager" />,
}))

vi.mock('@/features/scheduling/components/mobile/MobileAgendaTimeline', () => ({
  MobileAgendaTimeline: ({
    selectedDate,
    onSelectedDateChange,
  }: { selectedDate: string; onSelectedDateChange: (date: string) => void }) => (
    <div data-testid="mobile-timeline">
      <span>{selectedDate}</span>
      <button type="button" onClick={() => onSelectedDateChange('2026-06-03')}>
        Select Wednesday
      </button>
    </div>
  ),
}))

vi.mock('@/features/scheduling/components/mobile/MobileAgendaList', () => ({
  MobileAgendaList: ({ selectedDate }: { selectedDate: string }) => (
    <div data-testid="mobile-list">{selectedDate}</div>
  ),
}))

vi.mock('@/features/scheduling/components/shared/GoogleCalendarButton', () => ({
  GoogleCalendarButton: () => <div data-testid="gcal-button" />,
}))

vi.mock('@/features/scheduling/components/shared/ViewToggle', () => ({
  ViewToggle: ({ onChange }: { onChange: (v: 'calendar' | 'table') => void }) => (
    <button type="button" onClick={() => onChange('table')}>
      view-toggle
    </button>
  ),
}))

vi.mock('@/features/scheduling/components/appointments/AppointmentDrawer', () => ({
  AppointmentDrawer: ({ appointment, onClose }: { appointment: unknown; onClose: () => void }) =>
    appointment ? (
      <div data-testid="drawer">
        drawer-open
        <button type="button" onClick={onClose}>
          Close drawer
        </button>
      </div>
    ) : null,
}))

import { SchedulePageContainer } from '@/features/scheduling/containers/SchedulePageContainer'

beforeEach(() => {
  vi.clearAllMocks()
  mockHookState = { ...baseHookState }
})

describe('SchedulePageContainer', () => {
  it('starts at the first day when the displayed week does not contain today', () => {
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 8) }
    render(<SchedulePageContainer />)
    expect(screen.getByText('2026-06-08')).toBeInTheDocument()
  })

  it('preserves the selected day across views and chooses today or the first day after a week change', async () => {
    const { rerender } = render(<SchedulePageContainer />)
    expect(screen.getByText('2026-06-04')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Select Wednesday' }))
    mockHookState = { ...mockHookState, view: 'table' }
    rerender(<SchedulePageContainer />)
    expect(screen.getByText('2026-06-03')).toBeInTheDocument()
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 8) }
    rerender(<SchedulePageContainer />)
    expect(screen.getByText('2026-06-08')).toBeInTheDocument()
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 1) }
    rerender(<SchedulePageContainer />)
    expect(screen.getByText('2026-06-04')).toBeInTheDocument()
  })

  it('clears the active appointment when the drawer closes', async () => {
    mockHookState = { ...mockHookState, drawerAppointment: { id: 'a' } as never }
    render(<SchedulePageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    expect(mockHookState.setDrawerAppointment).toHaveBeenLastCalledWith(null)
  })

  it('shows a loading card while bootstrapping', () => {
    mockHookState = { ...baseHookState, isBootstrapping: true }
    render(<SchedulePageContainer />)
    expect(screen.getByText('Carregando agenda...')).toBeInTheDocument()
  })

  it('shows a "profile not found" warning when ownProfile is null', () => {
    mockHookState = { ...baseHookState, ownProfile: null }
    render(<SchedulePageContainer />)
    expect(screen.getByText('Perfil não encontrado')).toBeInTheDocument()
  })

  it('shows an error message when present', () => {
    mockHookState = { ...baseHookState, error: 'Falha ao carregar' }
    render(<SchedulePageContainer />)
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
  })

  it('renders the agenda tab by default with the calendar view', () => {
    render(<SchedulePageContainer />)
    expect(screen.getByRole('tab', { name: 'Agenda' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'week-calendar' })).toBeInTheDocument()
  })

  it('renders the table view when view is "table"', () => {
    mockHookState = { ...baseHookState, view: 'table' }
    render(<SchedulePageContainer />)
    expect(screen.getByTestId('appointment-table')).toBeInTheDocument()
  })

  it('switches to the availability tab', async () => {
    render(<SchedulePageContainer />)
    await userEvent.click(screen.getByRole('tab', { name: 'Disponibilidade' }))
    expect(mockHookState.setActiveTab).toHaveBeenCalledWith('disponibilidade')
  })

  it('renders the AvailabilityManager panel on the disponibilidade tab', () => {
    mockHookState = { ...baseHookState, activeTab: 'disponibilidade' }
    render(<SchedulePageContainer />)
    expect(screen.getByTestId('availability-manager')).toBeInTheDocument()
  })

  it('renders the ExceptionManager panel on the excecoes tab', () => {
    mockHookState = { ...baseHookState, activeTab: 'excecoes' }
    render(<SchedulePageContainer />)
    expect(screen.getByTestId('exception-manager')).toBeInTheDocument()
  })

  it('opens the drawer when an appointment is clicked in the calendar', async () => {
    render(<SchedulePageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'week-calendar' }))
    expect(mockHookState.setDrawerAppointment).toHaveBeenCalledWith({ id: 'appt-1' })
  })

  it('renders the drawer when drawerAppointment is set', () => {
    mockHookState = { ...baseHookState, drawerAppointment: { id: 'appt-1' } as never }
    render(<SchedulePageContainer />)
    expect(screen.getByTestId('drawer')).toBeInTheDocument()
  })

  it('renders the mobile timeline for the calendar view and list for the table view', () => {
    const { rerender } = render(<SchedulePageContainer />)
    expect(screen.getByTestId('mobile-timeline')).toBeInTheDocument()

    mockHookState = { ...baseHookState, view: 'table' }
    rerender(<SchedulePageContainer />)
    expect(screen.getByTestId('mobile-list')).toBeInTheDocument()
  })

  it('toggles the view via the ViewToggle control', async () => {
    render(<SchedulePageContainer />)
    await userEvent.click(screen.getAllByRole('button', { name: 'view-toggle' })[0])
    expect(mockHookState.setView).toHaveBeenCalledWith('table')
  })
})
