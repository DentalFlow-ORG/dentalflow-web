import { render, screen, userEvent, waitFor } from '@/test-utils/render-utils'

import { StatusActionMenu } from '@/features/scheduling/components/appointments/StatusActionMenu'
import type { AppointmentStatus } from '@/features/scheduling/types/scheduling.types'
import { makeAppointment } from '@/test-utils/factories/appointment.factory'

// ── Fixture ───────────────────────────────────────────────────────────────────
// Factory defaults: appointmentDate '2026-05-26' + startTime '1970-01-01T10:00:00.000Z'
// → buildAppointmentDateTime produces new Date('2026-05-26T10:00:00') local

// ── Terminal statuses ─────────────────────────────────────────────────────────

describe('StatusActionMenu — terminal statuses', () => {
  it.each<AppointmentStatus>(['COMPLETED', 'NO_SHOW', 'CANCELED'])(
    'renders the em-dash placeholder and no buttons for %s',
    (status) => {
      render(
        <StatusActionMenu
          appointment={makeAppointment({ status })}
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
  it.each([['Concluir consulta', 'COMPLETED']] as const)(
    'dispatches %s only after loading ends',
    async (label, status) => {
      const onStatusChange = vi.fn()
      const props = {
        appointment: makeAppointment({ status: 'CONFIRMED', appointmentDate: '2020-01-01' }),
        allowedTransitions: ['COMPLETED', 'NO_SHOW'] as AppointmentStatus[],
        onStatusChange,
        onCancelRequest: vi.fn(),
      }
      const user = userEvent.setup()
      const { rerender } = render(<StatusActionMenu {...props} isLoading />)
      expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: label }))
      expect(onStatusChange).not.toHaveBeenCalled()
      rerender(<StatusActionMenu {...props} isLoading={false} />)
      await user.click(screen.getByRole('button', { name: label }))
      expect(onStatusChange).toHaveBeenCalledExactlyOnceWith('appt-1', status)
    },
  )

  it('renders Confirmar and Cancelar buttons', () => {
    render(
      <StatusActionMenu
        appointment={makeAppointment({ status: 'PENDING' })}
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
        appointment={makeAppointment({ status: 'PENDING' })}
        isLoading={false}
        onStatusChange={vi.fn()}
        onCancelRequest={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Não compareceu/i })).not.toBeInTheDocument()
  })

  it('calls onStatusChange with the appointment id and CONFIRMED when Confirmar is clicked', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(
      <StatusActionMenu
        appointment={makeAppointment({ status: 'PENDING' })}
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
    const appointment = makeAppointment({ status: 'PENDING' })
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
    vi.setSystemTime(new Date('2026-05-26T11:00:00-03:00')) // 11:00 > 10:00 slot
    render(
      <StatusActionMenu
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
    vi.setSystemTime(new Date('2026-05-26T09:00:00-03:00')) // 09:00 < 10:00 slot
    render(
      <StatusActionMenu
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

// ── NO_SHOW confirmation ──────────────────────────────────────────────────────

describe('StatusActionMenu — NO_SHOW confirmation', () => {
  function renderNoShow(onStatusChange = vi.fn().mockResolvedValue(true), isLoading = false) {
    const props = {
      appointment: makeAppointment({
        status: 'CONFIRMED',
        appointmentDate: '2020-01-01',
        patientName: 'Ana Souza',
      }),
      allowedTransitions: ['NO_SHOW'] as 'NO_SHOW'[],
      onStatusChange,
      onCancelRequest: vi.fn(),
    }
    const view = render(<StatusActionMenu {...props} isLoading={isLoading} />)
    return { ...view, props, onStatusChange }
  }

  it('asks for confirmation naming the patient before registering a no-show', async () => {
    const user = userEvent.setup()
    const { onStatusChange } = renderNoShow()
    await user.click(screen.getByRole('button', { name: 'Não compareceu' }))
    const dialog = screen.getByRole('dialog', { name: 'Registrar falta?' })
    expect(dialog).toHaveTextContent('Ana Souza')
    expect(dialog).toHaveTextContent('não pode ser desfeita')
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it('does not change the status when the confirmation is dismissed', async () => {
    const user = userEvent.setup()
    const { onStatusChange } = renderNoShow()
    await user.click(screen.getByRole('button', { name: 'Não compareceu' }))
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it('registers the no-show on confirm and closes the dialog on success', async () => {
    const user = userEvent.setup()
    const { onStatusChange } = renderNoShow()
    await user.click(screen.getByRole('button', { name: 'Não compareceu' }))
    await user.click(screen.getByRole('button', { name: 'Registrar falta' }))
    expect(onStatusChange).toHaveBeenCalledExactlyOnceWith('appt-1', 'NO_SHOW')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the dialog open when the change fails so it can be retried', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    renderNoShow(onStatusChange)
    await user.click(screen.getByRole('button', { name: 'Não compareceu' }))
    await user.click(screen.getByRole('button', { name: 'Registrar falta' }))
    expect(screen.getByRole('dialog', { name: 'Registrar falta?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Registrar falta' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(onStatusChange).toHaveBeenCalledTimes(2)
  })

  it('disables the confirmation while the change is pending', async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderNoShow()
    await user.click(screen.getByRole('button', { name: 'Não compareceu' }))
    rerender(<StatusActionMenu {...props} isLoading />)
    expect(screen.getByRole('button', { name: /Aguarde/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled()
  })
})
