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
  allAppointments: [],
  appointments: [],
  isLoading: false,
  error: null as string | null,
  view: 'calendar' as 'calendar' | 'table',
  setView: vi.fn(),
  drawerAppointment: null,
  setDrawerAppointment: vi.fn(),
  editTarget: null,
  setEditTarget: vi.fn(),
  cancelTarget: null as { patientName: string } | null,
  setCancelTarget: vi.fn(),
  isActionLoading: false,
  isCreating: false,
  setIsCreating: vi.fn(),
  weekStart: new Date(2026, 5, 1),
  setWeekStart: vi.fn(),
  calendarAvailability: [],
  googleCalendar: null,
  isCalendarActionLoading: false,
  canManageGoogleCalendar: false,
  searchQuery: '',
  setSearchQuery: vi.fn(),
  activeFilters: {},
  setFilter: vi.fn(),
  clearAll: vi.fn(),
  filteredCount: 0,
  filterDefs: [],
  handleCreated: vi.fn(),
  handleUpdated: vi.fn(),
  handleStatusChange: vi.fn(),
  handleCancelRequest: vi.fn(),
  handleCancelConfirm: vi.fn(),
  handleEdit: vi.fn(),
  handleConnectGoogleCalendar: vi.fn(),
  handleSyncGoogleCalendar: vi.fn(),
  handleDisconnectGoogleCalendar: vi.fn(),
}

let mockHookState = { ...baseHookState }
const mockUseAppointmentsPage = vi.fn(() => mockHookState)
vi.mock('@/features/scheduling/hooks/useAppointmentsPage', () => ({
  useAppointmentsPage: () => mockUseAppointmentsPage(),
}))

vi.mock('@/features/scheduling/components/SchedulingKpiCards', () => ({
  SchedulingKpiCards: () => <div data-testid="kpi-cards" />,
}))

vi.mock('@/features/scheduling/components/SchedulingToolbar', () => ({
  SchedulingToolbar: ({ onNewAppointment }: { onNewAppointment: () => void }) => (
    <button type="button" onClick={onNewAppointment}>
      toolbar-new-appointment
    </button>
  ),
}))

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

vi.mock('@/features/scheduling/components/mobile/MobileAgendaTimeline', () => ({
  MobileAgendaTimeline: ({
    selectedDate,
    onSelectedDateChange,
    onCreateAppointment,
  }: {
    selectedDate: string
    onSelectedDateChange: (date: string) => void
    onCreateAppointment: () => void
  }) => (
    <div data-testid="mobile-timeline">
      <span>{selectedDate}</span>
      <button type="button" onClick={() => onSelectedDateChange('2026-06-03')}>
        Select Wednesday
      </button>
      <button type="button" onClick={onCreateAppointment}>
        Create from timeline
      </button>
    </div>
  ),
}))

vi.mock('@/features/scheduling/components/mobile/MobileAgendaList', () => ({
  MobileAgendaList: ({
    selectedDate,
    onCreateAppointment,
  }: { selectedDate: string; onCreateAppointment: () => void }) => (
    <div data-testid="mobile-list">
      <span>{selectedDate}</span>
      <button type="button" onClick={onCreateAppointment}>
        Create from list
      </button>
    </div>
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

vi.mock('@/features/scheduling/components/appointments/CancelAppointmentDialog', () => ({
  CancelAppointmentDialog: ({ open, onCancel }: { open: boolean; onCancel: () => void }) =>
    open ? (
      <div data-testid="cancel-dialog">
        cancel-open
        <button type="button" onClick={onCancel}>
          Dismiss cancellation
        </button>
      </div>
    ) : null,
}))

vi.mock('@/features/scheduling/components/appointments/EditAppointmentModal', () => ({
  EditAppointmentModal: ({
    appointment,
    onClose,
  }: { appointment: unknown; onClose: () => void }) =>
    appointment ? (
      <div data-testid="edit-modal">
        edit-open
        <button type="button" onClick={onClose}>
          Close editor
        </button>
      </div>
    ) : null,
}))

vi.mock('@/features/scheduling/components/appointments/CreateAppointmentModal', () => ({
  CreateAppointmentModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="create-modal">
        create-open
        <button type="button" onClick={onClose}>
          Close creator
        </button>
      </div>
    ) : null,
}))

import { AppointmentsPageContainer } from '@/features/scheduling/containers/AppointmentsPageContainer'

beforeEach(() => {
  vi.clearAllMocks()
  mockHookState = { ...baseHookState }
})

describe('AppointmentsPageContainer', () => {
  it('starts at the first day when opening a week that does not contain today', () => {
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 8) }
    render(<AppointmentsPageContainer />)
    expect(screen.getByText('2026-06-08')).toBeInTheDocument()
  })

  it('preserves the selected mobile day across views and chooses an appropriate day after week changes', async () => {
    const { rerender } = render(<AppointmentsPageContainer />)
    expect(screen.getByText('2026-06-04')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Select Wednesday' }))
    mockHookState = { ...mockHookState, view: 'table' }
    rerender(<AppointmentsPageContainer />)
    expect(screen.getByText('2026-06-03')).toBeInTheDocument()
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 8) }
    rerender(<AppointmentsPageContainer />)
    expect(screen.getByText('2026-06-08')).toBeInTheDocument()
    mockHookState = { ...mockHookState, weekStart: new Date(2026, 5, 1) }
    rerender(<AppointmentsPageContainer />)
    expect(screen.getByText('2026-06-04')).toBeInTheDocument()
  })

  it('opens creation from both mobile views and clears dismissed modal targets', async () => {
    mockHookState = {
      ...mockHookState,
      drawerAppointment: { id: 'a' } as never,
      cancelTarget: { patientName: 'Ana' },
      editTarget: { id: 'a' } as never,
      isCreating: true,
    }
    const { rerender } = render(<AppointmentsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Create from timeline' }))
    expect(mockHookState.setIsCreating).toHaveBeenLastCalledWith(true)
    mockHookState = { ...mockHookState, view: 'table' }
    rerender(<AppointmentsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'Create from list' }))
    expect(mockHookState.setIsCreating).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss cancellation' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close editor' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close creator' }))
    expect(mockHookState.setDrawerAppointment).toHaveBeenLastCalledWith(null)
    expect(mockHookState.setCancelTarget).toHaveBeenLastCalledWith(null)
    expect(mockHookState.setEditTarget).toHaveBeenLastCalledWith(null)
    expect(mockHookState.setIsCreating).toHaveBeenLastCalledWith(false)
  })

  it('renders the KPI cards and toolbar', () => {
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'toolbar-new-appointment' })).toBeInTheDocument()
  })

  it('shows the calendar view (WeekCalendar) by default', () => {
    render(<AppointmentsPageContainer />)
    expect(screen.getByRole('button', { name: 'week-calendar' })).toBeInTheDocument()
    expect(screen.queryByTestId('appointment-table')).not.toBeInTheDocument()
  })

  it('shows the table view when view is "table"', () => {
    mockHookState = { ...baseHookState, view: 'table' }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('appointment-table')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'week-calendar' })).not.toBeInTheDocument()
  })

  it('shows the mobile timeline for the calendar view', () => {
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('mobile-timeline')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-list')).not.toBeInTheDocument()
  })

  it('shows the mobile list for the table view', () => {
    mockHookState = { ...baseHookState, view: 'table' }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('mobile-list')).toBeInTheDocument()
  })

  it('opens the create modal via the toolbar action', async () => {
    render(<AppointmentsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'toolbar-new-appointment' }))
    expect(mockHookState.setIsCreating).toHaveBeenCalledWith(true)
  })

  it('opens the drawer when an appointment is clicked in the calendar', async () => {
    render(<AppointmentsPageContainer />)
    await userEvent.click(screen.getByRole('button', { name: 'week-calendar' }))
    expect(mockHookState.setDrawerAppointment).toHaveBeenCalledWith({ id: 'appt-1' })
  })

  it('renders the drawer when drawerAppointment is set', () => {
    mockHookState = { ...baseHookState, drawerAppointment: { id: 'appt-1' } as never }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('drawer')).toBeInTheDocument()
  })

  it('renders the cancel dialog when cancelTarget is set', () => {
    mockHookState = { ...baseHookState, cancelTarget: { patientName: 'Ana' } }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument()
  })

  it('renders the edit modal when editTarget is set', () => {
    mockHookState = { ...baseHookState, editTarget: { id: 'appt-1' } as never }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
  })

  it('renders the create modal when isCreating is true', () => {
    mockHookState = { ...baseHookState, isCreating: true }
    render(<AppointmentsPageContainer />)
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockHookState = { ...baseHookState, isLoading: true }
    render(<AppointmentsPageContainer />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an error message', () => {
    mockHookState = { ...baseHookState, error: 'Falha ao carregar agendamentos' }
    render(<AppointmentsPageContainer />)
    expect(screen.getByText('Falha ao carregar agendamentos')).toBeInTheDocument()
  })
})
