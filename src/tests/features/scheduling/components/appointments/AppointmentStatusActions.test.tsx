import { render, screen, userEvent } from '@/test-utils/render-utils'

import { AppointmentStatusActions } from '@/features/scheduling/components/appointments/AppointmentStatusActions'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

// ── Terminal statuses ─────────────────────────────────────────────────────────

describe('AppointmentStatusActions — terminal statuses', () => {
  it.each(['COMPLETED', 'NO_SHOW', 'CANCELED'] as const)('renders nothing for %s', (status) => {
    const { container } = render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

// ── PENDING ───────────────────────────────────────────────────────────────────

describe('AppointmentStatusActions — PENDING', () => {
  it('renders Confirmar and Cancelar buttons', () => {
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('does not render Concluir or Não compareceu buttons', () => {
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Não compareceu/i })).not.toBeInTheDocument()
  })

  it('calls onStatusChange with CONFIRMED when Confirmar is clicked', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        onStatusChange={onStatusChange}
        onCancelRequest={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Confirmar/i }))
    expect(onStatusChange).toHaveBeenCalledWith('appt-1', 'CONFIRMED')
  })

  it('calls onCancelRequest when Cancelar is clicked', async () => {
    const user = userEvent.setup()
    const onCancelRequest = vi.fn()
    const appointment = makeAppointment({ status: 'PENDING' })
    render(
      <AppointmentStatusActions
        appointment={appointment}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={onCancelRequest}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancelRequest).toHaveBeenCalledWith(appointment)
  })
})

// ── CONFIRMED — time-sensitive ────────────────────────────────────────────────

describe('AppointmentStatusActions — CONFIRMED (time-sensitive)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Concluir, Não compareceu and Cancelar after the slot has started', () => {
    vi.setSystemTime(new Date('2026-05-26T11:00:00'))
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'CONFIRMED' })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Concluir/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Não compareceu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('renders only Cancelar before the slot starts', () => {
    vi.setSystemTime(new Date('2026-05-26T09:00:00'))
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'CONFIRMED' })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Não compareceu/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })
})

// ── allowedTransitions (DENTIST restrictions) ─────────────────────────────────

describe('AppointmentStatusActions — allowedTransitions', () => {
  it('hides Confirmar when CONFIRMED is not in allowedTransitions', () => {
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        allowedTransitions={['CANCELED']}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Confirmar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('renders nothing when DENTIST transitions exclude all valid targets', () => {
    // DENTIST allows only COMPLETED/NO_SHOW; PENDING only allows CONFIRMED/CANCELED
    const { container } = render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        allowedTransitions={['COMPLETED', 'NO_SHOW']}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

// ── Loading / disabled state ──────────────────────────────────────────────────

describe('AppointmentStatusActions — loading state', () => {
  it('disables all buttons when isLoading is true', () => {
    render(
      <AppointmentStatusActions
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={true}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    const buttons = screen.getAllByRole('button')
    for (const btn of buttons) expect(btn).toBeDisabled()
  })
})
