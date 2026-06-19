import { render, screen, userEvent } from '@/test-utils/render-utils'

import { MobileAppointmentCard } from '@/features/scheduling/components/mobile/MobileAppointmentCard'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

const withProfile = makeAppointment({
  profile: { id: 'p1', displayName: 'Dr. Silva', userId: null },
})

const withService = makeAppointment({
  service: {
    id: 's1',
    name: 'Limpeza dental',
    durationMinutes: 60,
    priceFrom: null,
    priceTo: null,
  },
})

const withBoth = makeAppointment({
  profile: { id: 'p1', displayName: 'Dr. Silva', userId: null },
  service: {
    id: 's1',
    name: 'Limpeza dental',
    durationMinutes: 60,
    priceFrom: null,
    priceTo: null,
  },
})

// ── Basic rendering ───────────────────────────────────────────────────────────

describe('MobileAppointmentCard — basic content', () => {
  it('renders the patient name', () => {
    render(<MobileAppointmentCard appointment={makeAppointment()} onClick={vi.fn()} />)
    expect(screen.getByText('Test Patient')).toBeInTheDocument()
  })

  it('renders the start time', () => {
    render(<MobileAppointmentCard appointment={makeAppointment()} onClick={vi.fn()} />)
    // Factory startTime '1970-01-01T10:00:00.000Z' → wall time "10:00"
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders the service name when provided', () => {
    render(<MobileAppointmentCard appointment={withService} onClick={vi.fn()} />)
    expect(screen.getByText('Limpeza dental')).toBeInTheDocument()
  })

  it('renders professional name as fallback when no service', () => {
    render(<MobileAppointmentCard appointment={withProfile} onClick={vi.fn()} />)
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
  })

  it('renders both service and professional for rich appointments', () => {
    render(<MobileAppointmentCard appointment={withBoth} onClick={vi.fn()} />)
    expect(screen.getByText('Limpeza dental')).toBeInTheDocument()
    expect(screen.getByText('Dr. Silva')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(
      <MobileAppointmentCard
        appointment={makeAppointment({ status: 'CONFIRMED' })}
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
  })
})

// ── Accessible label ──────────────────────────────────────────────────────────

describe('MobileAppointmentCard — accessible label', () => {
  it('has an aria-label containing the patient name', () => {
    render(<MobileAppointmentCard appointment={makeAppointment()} onClick={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toContain('Test Patient')
  })

  it('has an aria-label containing the start time', () => {
    render(<MobileAppointmentCard appointment={makeAppointment()} onClick={vi.fn()} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toMatch(/10:00/)
  })

  it('has an aria-label containing the status label', () => {
    render(
      <MobileAppointmentCard
        appointment={makeAppointment({ status: 'PENDING' })}
        onClick={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toContain('Pendente')
  })
})

// ── Click behavior ────────────────────────────────────────────────────────────

describe('MobileAppointmentCard — click', () => {
  it('calls onClick with the appointment when tapped', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const appt = makeAppointment()
    render(<MobileAppointmentCard appointment={appt} onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(appt)
  })
})
