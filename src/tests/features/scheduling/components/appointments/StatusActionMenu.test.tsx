import { render, screen, userEvent } from '@/test/render-utils'

import type { Appointment, AppointmentStatus } from '@/features/scheduling/types/scheduling.types'
import { StatusActionMenu } from '@/features/scheduling/components/appointments/StatusActionMenu'

// ── Fixture ───────────────────────────────────────────────────────────────────
// appointmentDate '2026-05-26' + startTime '1970-01-01T10:00:00.000Z'
// → buildAppointmentDateTime produces new Date('2026-05-26T10:00:00') local

const APPT_DATE = '2026-05-26'
const APPT_START = '1970-01-01T10:00:00.000Z'

function makeAppointment(
  status: AppointmentStatus,
  appointmentDate = APPT_DATE,
  startTime = APPT_START,
): Appointment {
  return {
    id: 'appt-1',
    clinicId: 'clinic-1',
    profileId: 'prof-1',
    patientUserId: null,
    leadId: null,
    serviceId: null,
    patientName: 'Test Patient',
    patientEmail: null,
    patientPhone: null,
    appointmentDate,
    startTime,
    endTime: null,
    durationMinutes: null,
    status,
    notes: null,
    patientNotes: null,
    canceledBy: null,
    canceledAt: null,
    cancellationReason: null,
    confirmedAt: null,
    completedAt: null,
    estimatedAmountCents: null,
    paidAmountCents: null,
    paymentStatus: 'PAYMENT_PENDING',
    paymentMethod: null,
    paymentDate: null,
    paymentNotes: null,
    createdAt: '2026-05-26T00:00:00.000Z',
    updatedAt: '2026-05-26T00:00:00.000Z',
    profile: null,
    service: null,
    patient: null,
  }
}

// ── Terminal statuses ─────────────────────────────────────────────────────────

describe('StatusActionMenu — terminal statuses', () => {
  it.each<AppointmentStatus>(['COMPLETED', 'NO_SHOW', 'CANCELED'])(
    'renders the em-dash placeholder and no buttons for %s',
    (status) => {
      render(
        <StatusActionMenu
          appointment={makeAppointment(status)}
          isLoading={false}
          onStatusChange={vi.fn()}
          onCancelRequest={vi.fn()}
        />,
      )
      expect(screen.getByText('—')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    },
  )
})

// ── PENDING ───────────────────────────────────────────────────────────────────

describe('StatusActionMenu — PENDING', () => {
  it('renders Confirmar and Cancelar buttons', () => {
    render(
      <StatusActionMenu
        appointment={makeAppointment('PENDING')}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('does not render Concluir or Não veio buttons', () => {
    render(
      <StatusActionMenu
        appointment={makeAppointment('PENDING')}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Não veio/i })).not.toBeInTheDocument()
  })

  it('calls onStatusChange with the appointment id and CONFIRMED when Confirmar is clicked', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(
      <StatusActionMenu
        appointment={makeAppointment('PENDING')}
        isLoading={false}
        onStatusChange={onStatusChange}
        onCancelRequest={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Confirmar/i }))
    expect(onStatusChange).toHaveBeenCalledWith('appt-1', 'CONFIRMED')
  })

  it('calls onCancelRequest with the appointment when Cancelar is clicked', async () => {
    const user = userEvent.setup()
    const onCancelRequest = vi.fn()
    const appointment = makeAppointment('PENDING')
    render(
      <StatusActionMenu
        appointment={appointment}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={onCancelRequest}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancelRequest).toHaveBeenCalledWith(appointment)
  })

  it('hides Confirmar when allowedTransitions excludes CONFIRMED', () => {
    render(
      <StatusActionMenu
        appointment={makeAppointment('PENDING')}
        isLoading={false}
        allowedTransitions={['CANCELED']}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Confirmar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })
})

// ── CONFIRMED — time-sensitive ────────────────────────────────────────────────

describe('StatusActionMenu — CONFIRMED (time-sensitive)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Concluir, Não veio, and Cancelar after the slot has started', () => {
    vi.setSystemTime(new Date('2026-05-26T11:00:00')) // 11:00 > 10:00 slot
    render(
      <StatusActionMenu
        appointment={makeAppointment('CONFIRMED')}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /Concluir/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Não veio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('renders only Cancelar before the slot starts', () => {
    vi.setSystemTime(new Date('2026-05-26T09:00:00')) // 09:00 < 10:00 slot
    render(
      <StatusActionMenu
        appointment={makeAppointment('CONFIRMED')}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Não veio/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })
})
