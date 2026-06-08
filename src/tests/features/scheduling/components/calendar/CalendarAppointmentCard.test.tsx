import { render, screen, userEvent } from '@/test-utils/render-utils'

import { CalendarAppointmentCard } from '@/features/scheduling/components/calendar/CalendarAppointmentCard'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

const BASE_STYLE = { top: '0px', height: '80px', left: '0px', width: '100%' }

const withProfile = makeAppointment({
  profile: { id: 'p1', displayName: 'Dr. Silva', userId: null },
})

const withService = makeAppointment({
  service: { id: 's1', name: 'Limpeza dental', durationMinutes: 60, priceFrom: null, priceTo: null },
})

const withBoth = makeAppointment({
  durationMinutes: 60,
  profile: { id: 'p1', displayName: 'Dr. Silva', userId: null },
  service: { id: 's1', name: 'Limpeza dental', durationMinutes: 60, priceFrom: null, priceTo: null },
})

// ── Basic content ─────────────────────────────────────────────────────────────

describe('CalendarAppointmentCard — basic content', () => {
  it('renders the patient name', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment()}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })

  it('renders the start time', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment()}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    // Factory startTime = '1970-01-01T10:00:00.000Z' → wall time "10:00"
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders the service name when provided', () => {
    render(
      <CalendarAppointmentCard
        appointment={withService}
        style={{ ...BASE_STYLE, height: '80px' }}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Limpeza dental')).toBeInTheDocument()
  })

  it('renders the professional displayName when service is absent', () => {
    render(
      <CalendarAppointmentCard
        appointment={withProfile}
        style={{ ...BASE_STYLE, height: '80px' }}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
  })

  it('renders professional name on a third row for rich cards (60+ min) when both exist', () => {
    render(
      <CalendarAppointmentCard
        appointment={withBoth}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Limpeza dental')).toBeInTheDocument()
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
  })
})

// ── Accessible label ──────────────────────────────────────────────────────────

describe('CalendarAppointmentCard — accessible label', () => {
  it('includes the patient name in the accessible label', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment()}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('Test Patient'))
  })

  it('includes the time range in the accessible label', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment()}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toMatch(/10:00/)
  })

  it('includes the status label in the accessible label', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment({ status: 'CONFIRMED' })}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toMatch(/Confirmado/i)
  })

  it('includes the service name in the accessible label when available', () => {
    render(
      <CalendarAppointmentCard
        appointment={withBoth}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toMatch(/Limpeza dental/i)
    expect(btn.getAttribute('aria-label')).toMatch(/Dr. Silva/i)
  })
})

// ── Click behavior ────────────────────────────────────────────────────────────

describe('CalendarAppointmentCard — click', () => {
  it('calls onClick with the appointment when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const appointment = makeAppointment()
    render(
      <CalendarAppointmentCard
        appointment={appointment}
        style={BASE_STYLE}
        onClick={onClick}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(appointment)
  })
})

// ── Compact tier ──────────────────────────────────────────────────────────────

describe('CalendarAppointmentCard — compact (< 30 min)', () => {
  it('still renders the patient name in compact mode', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment({ durationMinutes: 15 })}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })
})

// ── Payment status NOT rendered inside card ───────────────────────────────────

describe('CalendarAppointmentCard — payment badge not rendered in card', () => {
  it('does not render the payment badge text inside the card', () => {
    render(
      <CalendarAppointmentCard
        appointment={makeAppointment({ paymentStatus: 'PAID' })}
        style={BASE_STYLE}
        onClick={vi.fn()}
      />,
    )
    // "Pago" should not appear as a visible element (it is design decision to omit from card)
    expect(screen.queryByText('Pago')).not.toBeInTheDocument()
  })
})
