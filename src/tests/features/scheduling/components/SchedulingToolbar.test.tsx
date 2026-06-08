import { render, screen, userEvent } from '@/test-utils/render-utils'

import { SchedulingToolbar } from '@/features/scheduling/components/SchedulingToolbar'
import type { FilterDef } from '@/components/common/ListToolbar'

const baseProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  activeFilters: {} as Record<string, string>,
  filterDefs: [] as FilterDef[],
  onFilterChange: vi.fn(),
  onClearAll: vi.fn(),
  filteredCount: 0,
  totalCount: 0,
  view: 'calendar' as const,
  onViewChange: vi.fn(),
  onNewAppointment: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SchedulingToolbar — search', () => {
  it('renders the search input', () => {
    render(<SchedulingToolbar {...baseProps} />)
    expect(
      screen.getByPlaceholderText(/Pesquisar por paciente/i),
    ).toBeInTheDocument()
  })

  it('calls onSearchChange when typing in the search input', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(<SchedulingToolbar {...baseProps} onSearchChange={onSearchChange} />)
    await user.type(screen.getByPlaceholderText(/Pesquisar por paciente/i), 'Jo')
    expect(onSearchChange).toHaveBeenCalled()
  })
})

describe('SchedulingToolbar — view toggle', () => {
  it('renders the calendar and list view buttons', () => {
    render(<SchedulingToolbar {...baseProps} />)
    expect(screen.getByRole('button', { name: /Calendário semanal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lista/i })).toBeInTheDocument()
  })

  it('calls onViewChange with "table" when the list button is clicked', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<SchedulingToolbar {...baseProps} onViewChange={onViewChange} />)
    await user.click(screen.getByRole('button', { name: /Lista/i }))
    expect(onViewChange).toHaveBeenCalledWith('table')
  })

  it('calls onViewChange with "calendar" when the calendar button is clicked', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<SchedulingToolbar {...baseProps} view="table" onViewChange={onViewChange} />)
    await user.click(screen.getByRole('button', { name: /Calendário semanal/i }))
    expect(onViewChange).toHaveBeenCalledWith('calendar')
  })
})

describe('SchedulingToolbar — new appointment', () => {
  it('renders the "Novo agendamento" button', () => {
    render(<SchedulingToolbar {...baseProps} />)
    expect(
      screen.getByRole('button', { name: /Novo agendamento/i }),
    ).toBeInTheDocument()
  })

  it('calls onNewAppointment when the button is clicked', async () => {
    const user = userEvent.setup()
    const onNewAppointment = vi.fn()
    render(<SchedulingToolbar {...baseProps} onNewAppointment={onNewAppointment} />)
    await user.click(screen.getByRole('button', { name: /Novo agendamento/i }))
    expect(onNewAppointment).toHaveBeenCalledTimes(1)
  })
})

describe('SchedulingToolbar — filters', () => {
  const filterDefs: FilterDef[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'PENDING', label: 'Pendente' },
        { value: 'CONFIRMED', label: 'Confirmado' },
      ],
    },
  ]

  it('renders the filter button when filterDefs are provided', () => {
    render(<SchedulingToolbar {...baseProps} filterDefs={filterDefs} />)
    expect(screen.getByRole('button', { name: /Filtros/i })).toBeInTheDocument()
  })
})

describe('SchedulingToolbar — Google Calendar hidden when no role', () => {
  it('does not render Google Calendar buttons for ASSISTANT (canManageGoogleCalendar=false)', () => {
    render(
      <SchedulingToolbar
        {...baseProps}
        canManageGoogleCalendar={false}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Google Agenda/i }),
    ).not.toBeInTheDocument()
  })

  it('renders connect button for OWNER (canManageGoogleCalendar=true, not connected)', () => {
    render(
      <SchedulingToolbar
        {...baseProps}
        canManageGoogleCalendar={true}
        googleCalendar={{ connected: false, calendarSummary: null, connectedAt: null, lastSyncedAt: null }}
      />,
    )
    expect(
      screen.getByRole('button', { name: /Conectar Google Agenda/i }),
    ).toBeInTheDocument()
  })
})
