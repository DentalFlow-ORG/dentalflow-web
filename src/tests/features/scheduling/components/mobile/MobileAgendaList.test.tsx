import { render, screen } from '@/test-utils/render-utils'

import { MobileAgendaList } from '@/features/scheduling/components/mobile/MobileAgendaList'
import { makeAppointment, DEFAULT_APPT_DATE } from '@/test-utils/factories/appointment.factory'

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
// Monday 2026-05-25 is the weekStart
const WEEK_START = new Date(2026, 4, 25) // local month is 0-indexed: May = 4

const APPT_TODAY = makeAppointment({ appointmentDate: DEFAULT_APPT_DATE /* 2026-05-26 */ })
const APPT_OTHER = makeAppointment({ id: 'appt-2', appointmentDate: '2026-05-27' })

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('MobileAgendaList — rendering', () => {
  it('shows appointments for today by default', () => {
    render(
      <MobileAgendaList
        appointments={[APPT_TODAY, APPT_OTHER]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    // Today's appointment (Test Patient) should be visible
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })

  it('shows empty state when no appointments for selected day', () => {
    render(
      <MobileAgendaList
        appointments={[APPT_OTHER]} // only has appointment for a different day
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhuma consulta agendada neste dia.')).toBeInTheDocument()
  })

  it('shows "Hoje" as the day header label for today', () => {
    render(
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })

  it('renders 7 day buttons in the strip', () => {
    render(
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    // 7 day buttons with aria-pressed
    // Filter to buttons that are day strip buttons (have aria-pressed)
    const stripButtons = Array.from(document.querySelectorAll('button[aria-pressed]'))
    expect(stripButtons).toHaveLength(7)
  })
})

// ── Create action ─────────────────────────────────────────────────────────────

describe('MobileAgendaList — create action', () => {
  it('shows "Novo agendamento" button when canCreate is true', () => {
    render(
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        canCreate
        onCreateAppointment={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Novo agendamento/i })).toBeInTheDocument()
  })

  it('does not show "Novo agendamento" when canCreate is false', () => {
    render(
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
        canCreate={false}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Novo agendamento/i }),
    ).not.toBeInTheDocument()
  })

  it('does not show "Novo agendamento" when canCreate is omitted', () => {
    render(
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Novo agendamento/i }),
    ).not.toBeInTheDocument()
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('MobileAgendaList — loading state', () => {
  it('shows loading skeleton when isLoading is true', () => {
    render(
      <MobileAgendaList
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
      <MobileAgendaList
        appointments={[]}
        weekStart={WEEK_START}
        isLoading
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Nenhuma consulta agendada/i)).not.toBeInTheDocument()
  })

  it('shows appointments (not skeleton) when isLoading is false', () => {
    render(
      <MobileAgendaList
        appointments={[APPT_TODAY]}
        weekStart={WEEK_START}
        isLoading={false}
        onAppointmentClick={vi.fn()}
      />,
    )
    expect(screen.queryByRole('status', { name: /Carregando/i })).not.toBeInTheDocument()
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })
})

// ── Appointment ordering ──────────────────────────────────────────────────────

describe('MobileAgendaList — appointment order', () => {
  it('shows multiple appointments for today in the list', () => {
    const appt2 = makeAppointment({ id: 'appt-2', appointmentDate: DEFAULT_APPT_DATE })
    render(
      <MobileAgendaList
        appointments={[APPT_TODAY, appt2]}
        weekStart={WEEK_START}
        onAppointmentClick={vi.fn()}
      />,
    )
    // Both appointments should be visible (same patient name "Test Patient")
    const cards = screen.getAllByText('Test Patient')
    expect(cards).toHaveLength(2)
  })
})
