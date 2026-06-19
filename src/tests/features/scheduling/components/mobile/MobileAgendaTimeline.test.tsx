import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { MobileAgendaTimeline } from '@/features/scheduling/components/mobile/MobileAgendaTimeline'
import { DEFAULT_APPT_DATE, makeAppointment } from '@/test-utils/factories/appointment.factory'

// Fix "today" to the factory default date
beforeEach(() => {
  vi.useFakeTimers()
  // 2026-05-26 at noon Brazil time (-03:00) = 15:00 UTC
  vi.setSystemTime(new Date('2026-05-26T15:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

// weekStart = Monday of the week containing 2026-05-26 (Tuesday)
const WEEK_START = new Date(2026, 4, 25) // May = month index 4

const APPT_TODAY = makeAppointment({ appointmentDate: DEFAULT_APPT_DATE })
const APPT_OTHER = makeAppointment({ id: 'appt-2', appointmentDate: '2026-05-27' })

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('MobileAgendaTimeline — rendering', () => {
  it('shows appointments for today by default', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY, APPT_OTHER]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })

  it('shows empty state when no appointments for selected day', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_OTHER]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhuma consulta agendada neste dia.')).toBeInTheDocument()
  })

  it('shows "Hoje" as the day header for today', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })

  it('renders 7 day buttons in the strip', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    const stripButtons = Array.from(document.querySelectorAll('button[aria-pressed]'))
    expect(stripButtons).toHaveLength(7)
  })

  it('renders the start time for each appointment', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    // Factory startTime '1970-01-01T10:00:00.000Z' → wall time "10:00"
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders the status badge for each appointment', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('renders service name when provided', () => {
    const appt = makeAppointment({
      appointmentDate: DEFAULT_APPT_DATE,
      service: {
        id: 's1',
        name: 'Limpeza dental',
        durationMinutes: 60,
        priceFrom: null,
        priceTo: null,
      },
    })
    render(
      <MobileAgendaTimeline
        appointments={[appt]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Limpeza dental')).toBeInTheDocument()
  })

  it('renders professional name when provided', () => {
    const appt = makeAppointment({
      appointmentDate: DEFAULT_APPT_DATE,
      profile: { id: 'p1', displayName: 'Dr. Silva', userId: null },
    })
    render(
      <MobileAgendaTimeline
        appointments={[appt]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
  })
})

// ── Appointment ordering ──────────────────────────────────────────────────────

describe('MobileAgendaTimeline — appointment order', () => {
  it('renders multiple appointments for today', () => {
    const appt2 = makeAppointment({ id: 'appt-2', appointmentDate: DEFAULT_APPT_DATE })
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY, appt2]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    const names = screen.getAllByText('Test Patient')
    expect(names).toHaveLength(2)
  })

  it('sorts appointments by startTime', () => {
    const earlier = makeAppointment({
      id: 'a1',
      appointmentDate: DEFAULT_APPT_DATE,
      startTime: '1970-01-01T08:00:00.000Z',
    })
    const later = makeAppointment({
      id: 'a2',
      patientName: 'Later Patient',
      appointmentDate: DEFAULT_APPT_DATE,
      startTime: '1970-01-01T10:00:00.000Z',
    })
    render(
      <MobileAgendaTimeline
        appointments={[later, earlier]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    const buttons = screen.getAllByRole('button', { name: /Test Patient|Later Patient/ })
    // Earlier appointment should appear first in the DOM
    expect(buttons[0]).toHaveAttribute('aria-label', expect.stringContaining('Test Patient'))
    expect(buttons[1]).toHaveAttribute('aria-label', expect.stringContaining('Later Patient'))
  })
})

// ── Click behavior ────────────────────────────────────────────────────────────

describe('MobileAgendaTimeline — click', () => {
  it('calls onAppointmentClick with the appointment when tapped', () => {
    const onClick = vi.fn()
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={onClick}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Test Patient/i }))
    expect(onClick).toHaveBeenCalledWith(APPT_TODAY)
  })
})

// ── Accessible label ──────────────────────────────────────────────────────────

describe('MobileAgendaTimeline — accessible label', () => {
  it('includes patient name in aria-label', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button', { name: /Test Patient/i })
    expect(btn.getAttribute('aria-label')).toContain('Test Patient')
  })

  it('includes status label in aria-label', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button', { name: /Test Patient/i })
    expect(btn.getAttribute('aria-label')).toContain('Pendente')
  })
})

// ── Create action ─────────────────────────────────────────────────────────────

describe('MobileAgendaTimeline — create action', () => {
  it('shows "Novo agendamento" button when canCreate is true', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        canCreate
        onCreateAppointment={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Novo agendamento/i })).toBeInTheDocument()
  })

  it('does not show "Novo agendamento" when canCreate is omitted', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Novo agendamento/i })).not.toBeInTheDocument()
  })

  it('calls onCreateAppointment when create button is clicked', () => {
    const onCreate = vi.fn()
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        canCreate
        onCreateAppointment={onCreate}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Novo agendamento/i }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})

// ── Controlled date selection ─────────────────────────────────────────────────

describe('MobileAgendaTimeline — controlled date', () => {
  it('shows appointments for the provided selectedDate instead of today', () => {
    // APPT_TODAY is on 2026-05-26 (today); pass selectedDate pointing to 2026-05-27
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        selectedDate="2026-05-27"
      />,
    )
    // Today's appointment should not be visible — the controlled date differs
    expect(screen.queryByText('Test Patient')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhuma consulta agendada neste dia.')).toBeInTheDocument()
  })

  it('calls onSelectedDateChange when a day strip button is clicked', () => {
    const onDateChange = vi.fn()
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        selectedDate="2026-05-26"
        onSelectedDateChange={onDateChange}
      />,
    )
    // Click Wednesday May 27 (qua = quarta-feira)
    fireEvent.click(screen.getByRole('button', { name: /qua 27/i }))
    expect(onDateChange).toHaveBeenCalledWith('2026-05-27')
  })

  it('works without controlled props (uncontrolled backward compat)', () => {
    render(
      <MobileAgendaTimeline
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    // Default selection is today → today's appointment is visible
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('MobileAgendaTimeline — loading state', () => {
  it('shows loading skeleton when isLoading is true', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        isLoading
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByRole('status', { name: /Carregando/i })).toBeInTheDocument()
  })

  it('does not show empty state when isLoading is true', () => {
    render(
      <MobileAgendaTimeline
        appointments={[]}
        weekStart={WEEK_START}
        isLoading
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Nenhuma consulta agendada/i)).not.toBeInTheDocument()
  })
})
