import { GoogleCalendarButton } from '@/features/scheduling/components/shared/GoogleCalendarButton'
import { render, screen, userEvent } from '@/test-utils/render-utils'

describe('GoogleCalendarButton', () => {
  it('blocks connection while busy and dispatches it after recovery', async () => {
    const props = {
      googleCalendar: null,
      canManageGoogleCalendar: true,
      onConnect: vi.fn(),
      onSync: vi.fn(),
      onDisconnect: vi.fn(),
    }
    const { rerender } = render(<GoogleCalendarButton {...props} isCalendarActionLoading />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Conectar Google Agenda' }))
    expect(props.onConnect).not.toHaveBeenCalled()
    rerender(<GoogleCalendarButton {...props} isCalendarActionLoading={false} />)
    await user.click(screen.getByRole('button', { name: 'Conectar Google Agenda' }))
    expect(props.onConnect).toHaveBeenCalledOnce()
  })

  it.each(['Agenda da clínica', null])(
    'syncs and disconnects a connected calendar named %s',
    async (calendarSummary) => {
      const props = {
        googleCalendar: { connected: true, calendarSummary, connectedAt: null, lastSyncedAt: null },
        canManageGoogleCalendar: true,
        onConnect: vi.fn(),
        onSync: vi.fn(),
        onDisconnect: vi.fn(),
      }
      const { rerender } = render(<GoogleCalendarButton {...props} isCalendarActionLoading />)
      const user = userEvent.setup()
      const sync = screen.getByRole('button', { name: 'Sincronizar com Google Agenda' })
      const disconnect = screen.getByRole('button', { name: 'Desconectar Google Agenda' })
      expect(sync).toHaveAttribute('title', calendarSummary ?? 'Google Agenda conectado')
      await user.click(sync)
      await user.click(disconnect)
      expect(props.onSync).not.toHaveBeenCalled()
      expect(props.onDisconnect).not.toHaveBeenCalled()
      rerender(<GoogleCalendarButton {...props} isCalendarActionLoading={false} />)
      await user.click(sync)
      await user.click(disconnect)
      expect(props.onSync).toHaveBeenCalledOnce()
      expect(props.onDisconnect).toHaveBeenCalledOnce()
      expect(props.onConnect).not.toHaveBeenCalled()
      rerender(
        <GoogleCalendarButton
          {...props}
          canManageGoogleCalendar={false}
          isCalendarActionLoading={false}
        />,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    },
  )
})
