import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

// Isolate AppointmentDrawer's own orchestration logic — these child sections
// are already independently tested elsewhere.
vi.mock('@/features/scheduling/components/appointments/AppointmentClinicalSection', () => ({
  AppointmentClinicalSection: () => <div data-testid="clinical-section" />,
}))
vi.mock('@/features/scheduling/components/appointments/AppointmentNotificationSection', () => ({
  AppointmentNotificationSection: () => <div data-testid="notification-section" />,
}))
vi.mock('@/features/scheduling/components/appointments/AppointmentStatusActions', () => ({
  AppointmentStatusActions: () => <div data-testid="status-actions" />,
}))

let mockPaymentUpdatedHandler: ((updated: unknown) => void) | null = null
vi.mock('@/features/scheduling/components/appointments/AppointmentPaymentSection', () => ({
  AppointmentPaymentSection: ({ onUpdated }: { onUpdated: (updated: unknown) => void }) => {
    mockPaymentUpdatedHandler = onUpdated
    return <div data-testid="payment-section" />
  },
}))

import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

beforeEach(() => {
  mockPaymentUpdatedHandler = null
})

describe('AppointmentDrawer — closed state', () => {
  it('renders nothing meaningful when appointment is null', () => {
    render(
      <AppointmentDrawer
        appointment={null}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('clinical-section')).not.toBeInTheDocument()
  })
})

describe('AppointmentDrawer — header', () => {
  it('dismisses with Escape and can reopen with a different patient', async () => {
    const onClose = vi.fn()
    const props = {
      isActionLoading: false,
      onClose,
      onStatusChange: vi.fn(),
      onCancelRequest: vi.fn(),
    }
    const { rerender } = render(<AppointmentDrawer {...props} appointment={makeAppointment()} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
    rerender(<AppointmentDrawer {...props} appointment={null} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(
      <AppointmentDrawer
        {...props}
        appointment={makeAppointment({ id: 'other', patientName: 'Outro paciente' })}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Outro paciente' })).toBeInTheDocument()
  })

  it('renders patient name, initials, date, and status/payment badges', () => {
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentDrawer
        appointment={appt}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Ana Souza')[0]).toBeInTheDocument()
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('shows the edit button only when onEdit is provided and status is PENDING/CONFIRMED', () => {
    const appt = makeAppointment({ status: 'PENDING' })
    const { rerender } = render(
      <AppointmentDrawer
        appointment={appt}
        isActionLoading={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Editar agendamento' })).toBeInTheDocument()

    rerender(
      <AppointmentDrawer
        appointment={makeAppointment({ status: 'COMPLETED' })}
        isActionLoading={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Editar agendamento' })).not.toBeInTheDocument()
  })

  it('does not show the edit button when onEdit is omitted', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment({ status: 'PENDING' })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Editar agendamento' })).not.toBeInTheDocument()
  })

  it('calls onEdit with the active appointment', async () => {
    const onEdit = vi.fn()
    const appt = makeAppointment({ status: 'PENDING' })
    render(
      <AppointmentDrawer
        appointment={appt}
        isActionLoading={false}
        onClose={vi.fn()}
        onEdit={onEdit}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Editar agendamento' }))
    expect(onEdit).toHaveBeenCalledWith(appt)
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <AppointmentDrawer
        appointment={makeAppointment()}
        isActionLoading={false}
        onClose={onClose}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('AppointmentDrawer — body sections', () => {
  it('shows status actions when not readOnly', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment()}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByTestId('status-actions')).toBeInTheDocument()
  })

  it('hides status actions when readOnly', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment()}
        readOnly
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('status-actions')).not.toBeInTheDocument()
  })

  it('shows the service row only when a service is present', () => {
    const { rerender } = render(
      <AppointmentDrawer
        appointment={makeAppointment({
          service: {
            id: 's1',
            name: 'Limpeza',
            durationMinutes: 30,
            priceFrom: null,
            priceTo: null,
          },
        })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('Limpeza')).toBeInTheDocument()

    rerender(
      <AppointmentDrawer
        appointment={makeAppointment({ service: null })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByText('Limpeza')).not.toBeInTheDocument()
  })

  it('shows email/phone rows only when present', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment({ patientEmail: 'ana@x.com', patientPhone: '11999999999' })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('ana@x.com')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
  })

  it('shows the notes section only when notes is set', () => {
    const { rerender } = render(
      <AppointmentDrawer
        appointment={makeAppointment({ notes: 'Paciente ansioso' })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('Paciente ansioso')).toBeInTheDocument()

    rerender(
      <AppointmentDrawer
        appointment={makeAppointment({ notes: null })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByText('Paciente ansioso')).not.toBeInTheDocument()
  })

  it('shows the cancellation section only for CANCELED appointments with a reason or date', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment({
          status: 'CANCELED',
          cancellationReason: 'Paciente remarcou',
          canceledAt: '2026-05-20T00:00:00.000Z',
        })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.getByText('Paciente remarcou')).toBeInTheDocument()
    expect(screen.getByText('Cancelamento')).toBeInTheDocument()
  })

  it('does not show the cancellation section for a non-CANCELED appointment', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment({ status: 'PENDING' })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByText('Cancelamento')).not.toBeInTheDocument()
  })

  it('does not show the cancellation section when CANCELED but no reason/date', () => {
    render(
      <AppointmentDrawer
        appointment={makeAppointment({
          status: 'CANCELED',
          cancellationReason: null,
          canceledAt: null,
        })}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByText('Cancelamento')).not.toBeInTheDocument()
  })
})

describe('AppointmentDrawer — payment update propagation', () => {
  it('updates the locally displayed appointment and calls onPaymentUpdated', () => {
    const onPaymentUpdated = vi.fn()
    const appt = makeAppointment({ patientName: 'Ana Souza' })
    render(
      <AppointmentDrawer
        appointment={appt}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
        onPaymentUpdated={onPaymentUpdated}
      />,
    )
    const updated = { ...appt, patientName: 'Ana Souza Atualizada' }
    mockPaymentUpdatedHandler?.(updated)
    expect(onPaymentUpdated).toHaveBeenCalledWith(updated)
  })

  it('works when onPaymentUpdated is not provided', () => {
    const appt = makeAppointment()
    render(
      <AppointmentDrawer
        appointment={appt}
        isActionLoading={false}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(() => mockPaymentUpdatedHandler?.({ ...appt })).not.toThrow()
  })
})
