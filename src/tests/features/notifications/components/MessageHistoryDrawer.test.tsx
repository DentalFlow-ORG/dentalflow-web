import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

const mockUseNotificationMessages = vi.fn()
vi.mock('@/features/notifications/hooks/useNotificationMessages', () => ({
  useNotificationMessages: (...args: unknown[]) => mockUseNotificationMessages(...args),
}))

import { MessageHistoryDrawer } from '@/features/notifications/components/MessageHistoryDrawer'

function setHookState(overrides = {}) {
  mockUseNotificationMessages.mockReturnValue({
    messages: [],
    isLoading: false,
    total: 0,
    reload: vi.fn(),
    ...overrides,
  })
}

describe('MessageHistoryDrawer', () => {
  it('renders nothing meaningful when closed', () => {
    setHookState()
    render(
      <MessageHistoryDrawer
        appointmentId="appt-1"
        patientName="Ana"
        open={false}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByText('Histórico de mensagens')).not.toBeInTheDocument()
  })

  it('shows a loading spinner while loading', () => {
    setHookState({ isLoading: true })
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={vi.fn()} />)
    expect(screen.getByText('Histórico de mensagens')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('shows the empty state when there are no messages', () => {
    setHookState()
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={vi.fn()} />)
    expect(screen.getByText('Nenhuma mensagem enviada para este agendamento.')).toBeInTheDocument()
  })

  it('shows a singular count for one message', () => {
    setHookState({
      total: 1,
      messages: [
        {
          id: 'm1',
          templateSlug: 'appointment_reminder_24h',
          status: 'SENT',
          sentAt: '2026-06-01T14:00:00.000Z',
          createdAt: '2026-06-01T13:00:00.000Z',
        },
      ],
    })
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={vi.fn()} />)
    expect(screen.getByText('1 mensagem encontradas')).toBeInTheDocument()
    expect(screen.getByText(/lembrete de consulta \(24h\)/i)).toBeInTheDocument()
    expect(screen.getByText(/enviado em/i)).toBeInTheDocument()
  })

  it('shows a plural count and falls back to the raw slug for an unknown template', () => {
    setHookState({
      total: 2,
      messages: [
        {
          id: 'm1',
          templateSlug: 'custom_slug',
          status: 'PENDING',
          createdAt: '2026-06-01T13:00:00.000Z',
        },
      ],
    })
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={vi.fn()} />)
    expect(screen.getByText('2 mensagens encontradas')).toBeInTheDocument()
    expect(screen.getByText('custom_slug')).toBeInTheDocument()
    expect(screen.getByText(/criado em/i)).toBeInTheDocument()
  })

  it('shows the failedAt timestamp and failReason when the message failed', () => {
    setHookState({
      total: 1,
      messages: [
        {
          id: 'm1',
          templateSlug: 'appointment_reminder_24h',
          status: 'FAILED',
          failedAt: '2026-06-01T14:00:00.000Z',
          createdAt: '2026-06-01T13:00:00.000Z',
          failReason: 'Número inválido',
        },
      ],
    })
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={vi.fn()} />)
    expect(screen.getByText(/falhou em/i)).toBeInTheDocument()
    expect(screen.getByText('Motivo: Número inválido')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    setHookState()
    const onClose = vi.fn()
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape', async () => {
    setHookState()
    const onClose = vi.fn()
    render(<MessageHistoryDrawer appointmentId="appt-1" patientName="Ana" open onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
