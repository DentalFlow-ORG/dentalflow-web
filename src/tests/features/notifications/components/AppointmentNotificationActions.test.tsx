import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

const mockUseNotificationTemplates = vi.fn()
vi.mock('@/features/notifications/hooks/useNotificationTemplates', () => ({
  useNotificationTemplates: () => mockUseNotificationTemplates(),
}))

vi.mock('@/features/notifications/components/NotificationSendDrawer', () => ({
  NotificationSendDrawer: ({
    open,
    template,
    onSent,
  }: {
    open: boolean
    template: { slug: string } | null
    onSent: () => void
  }) =>
    open ? (
      <div data-testid="send-drawer">
        <span>{template?.slug}</span>
        <button type="button" onClick={onSent}>
          simulate-sent
        </button>
      </div>
    ) : null,
}))

vi.mock('@/features/notifications/components/MessageHistoryDrawer', () => ({
  MessageHistoryDrawer: ({ open }: { open: boolean }) =>
    open ? <div data-testid="history-drawer" /> : null,
}))

import { AppointmentNotificationActions } from '@/features/notifications/components/AppointmentNotificationActions'

const baseProps = {
  appointmentId: 'appt-1',
  appointmentStatus: 'CONFIRMED',
  patientName: 'Ana',
  patientPhone: '11987654321',
  clinicName: 'Clínica Sorriso',
  appointmentDate: '2026-06-01',
  appointmentTime: '14:00',
}

beforeEach(() => {
  mockUseNotificationTemplates.mockReturnValue({
    templates: [
      { slug: 'appointment_reminder_24h', bodyPt: 'x' },
      { slug: 'payment_pending_notice', bodyPt: 'y' },
    ],
  })
})

describe('AppointmentNotificationActions', () => {
  it('renders nothing when there is no patient phone', () => {
    const { container } = render(
      <AppointmentNotificationActions {...baseProps} patientPhone={null} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows only templates relevant to the appointment status', () => {
    render(<AppointmentNotificationActions {...baseProps} appointmentStatus="CONFIRMED" />)
    expect(screen.getByText(/lembrete de consulta \(24h\)/i)).toBeInTheDocument()
    expect(screen.queryByText(/cobrança pendente/i)).not.toBeInTheDocument()
  })

  it('always shows the history button', () => {
    render(<AppointmentNotificationActions {...baseProps} />)
    expect(screen.getByText('Histórico de mensagens')).toBeInTheDocument()
  })

  it('does not show a sent-count line before anything was sent', () => {
    render(<AppointmentNotificationActions {...baseProps} />)
    expect(screen.queryByText(/nesta sessão/i)).not.toBeInTheDocument()
  })

  it('opens the send drawer with the clicked template', async () => {
    render(<AppointmentNotificationActions {...baseProps} />)
    await userEvent.click(screen.getByText(/lembrete de consulta \(24h\)/i))
    expect(screen.getByTestId('send-drawer')).toBeInTheDocument()
    expect(screen.getByText('appointment_reminder_24h')).toBeInTheDocument()
  })

  it('opens the history drawer when the history button is clicked', async () => {
    render(<AppointmentNotificationActions {...baseProps} />)
    await userEvent.click(screen.getByText('Histórico de mensagens'))
    expect(screen.getByTestId('history-drawer')).toBeInTheDocument()
  })

  it('increments and pluralizes the sent-count line after messages are sent', async () => {
    render(<AppointmentNotificationActions {...baseProps} />)
    await userEvent.click(screen.getByText(/lembrete de consulta \(24h\)/i))
    await userEvent.click(screen.getByText('simulate-sent'))
    expect(screen.getByText('1 enviada nesta sessão')).toBeInTheDocument()

    await userEvent.click(screen.getByText(/lembrete de consulta \(24h\)/i))
    await userEvent.click(screen.getByText('simulate-sent'))
    expect(screen.getByText('2 enviadas nesta sessão')).toBeInTheDocument()
  })

  it('shows no template actions for a status with no known template mapping', () => {
    render(<AppointmentNotificationActions {...baseProps} appointmentStatus="UNKNOWN_STATUS" />)
    expect(screen.queryByText(/lembrete de consulta \(24h\)/i)).not.toBeInTheDocument()
    expect(screen.getByText('Histórico de mensagens')).toBeInTheDocument()
  })
})
