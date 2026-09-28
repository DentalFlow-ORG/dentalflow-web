import { CancelAppointmentDialog } from '@/features/scheduling/components/appointments/CancelAppointmentDialog'
import { fireEvent, render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

function renderDialog(
  props: {
    open?: boolean
    patientName?: string
    isCanceling?: boolean
    onCancel?: () => void
    onConfirm?: (reason: string) => void
  } = {},
) {
  return render(
    <CancelAppointmentDialog
      open={true}
      patientName="João Silva"
      isCanceling={false}
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
      {...props}
    />,
  )
}

// ─── visibility ───────────────────────────────────────────────────────────────

describe('visibility', () => {
  it('does not render the dialog when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog title and patient name when open is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cancelar agendamento')).toBeInTheDocument()
    expect(screen.getByText(/João Silva/)).toBeInTheDocument()
  })

  it('exposes an accessible name matching the dialog title', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Cancelar agendamento')
  })
})

// ─── cancel reason field ──────────────────────────────────────────────────────

describe('cancel reason field', () => {
  it('allows the user to type a cancellation reason', async () => {
    const user = userEvent.setup()
    renderDialog()
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Paciente cancelou')
    expect(textarea).toHaveValue('Paciente cancelou')
  })

  it('labels the reason field and caps it at the API limit of 500 characters', () => {
    renderDialog()
    const textarea = screen.getByLabelText(/Motivo do cancelamento/)
    expect(textarea).toHaveAttribute('maxLength', '500')
  })
})

// ─── confirm action ───────────────────────────────────────────────────────────

describe('confirm action', () => {
  it('calls onConfirm with the typed reason when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({ onConfirm })
    await user.type(screen.getByRole('textbox'), 'No show')
    await user.click(screen.getByRole('button', { name: /Confirmar cancelamento/i }))
    expect(onConfirm).toHaveBeenCalledWith('No show')
  })

  it('calls onConfirm with an empty string when no reason is typed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({ onConfirm })
    await user.click(screen.getByRole('button', { name: /Confirmar cancelamento/i }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })

  it('trims surrounding whitespace from the reason', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({ onConfirm })
    await user.type(screen.getByRole('textbox'), '  Viagem  ')
    await user.click(screen.getByRole('button', { name: /Confirmar cancelamento/i }))
    expect(onConfirm).toHaveBeenCalledWith('Viagem')
  })

  it('keeps the typed reason when the cancellation fails and the dialog stays open', async () => {
    const user = userEvent.setup()
    const props = {
      patientName: 'João Silva',
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
    }
    const { rerender } = render(<CancelAppointmentDialog {...props} open isCanceling={false} />)
    await user.type(screen.getByRole('textbox'), 'Motivo qualquer')
    await user.click(screen.getByRole('button', { name: /Confirmar cancelamento/i }))
    rerender(<CancelAppointmentDialog {...props} open isCanceling />)
    rerender(<CancelAppointmentDialog {...props} open isCanceling={false} />)
    expect(screen.getByRole('textbox')).toHaveValue('Motivo qualquer')
  })

  it('starts a new cancellation with an empty reason', async () => {
    const user = userEvent.setup()
    const props = {
      patientName: 'João Silva',
      isCanceling: false,
      onCancel: vi.fn(),
      onConfirm: vi.fn(),
    }
    const { rerender } = render(<CancelAppointmentDialog {...props} open />)
    await user.type(screen.getByRole('textbox'), 'Motivo antigo')
    rerender(<CancelAppointmentDialog {...props} open={false} />)
    rerender(<CancelAppointmentDialog {...props} open />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})

// ─── close action ─────────────────────────────────────────────────────────────

describe('close action', () => {
  it('calls onCancel when the Voltar button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderDialog({ onCancel })
    await user.click(screen.getByRole('button', { name: /Voltar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

// ─── loading state ────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('disables both action buttons and the reason field when isCanceling is true', () => {
    renderDialog({ isCanceling: true })
    expect(screen.getByRole('button', { name: /Aguarde/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Voltar/i })).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('replaces the confirm label with a pending label when isCanceling is true', () => {
    renderDialog({ isCanceling: true })
    expect(screen.getByRole('button', { name: /Aguarde/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Confirmar cancelamento/i }),
    ).not.toBeInTheDocument()
  })

  it('ignores Escape while the cancellation is in progress', () => {
    const onCancel = vi.fn()
    renderDialog({ isCanceling: true, onCancel })
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
    expect(onCancel).not.toHaveBeenCalled()
  })
})

// ─── keyboard dismiss ─────────────────────────────────────────────────────────

describe('keyboard dismiss', () => {
  it('calls onCancel when the Escape key is pressed', () => {
    const onCancel = vi.fn()
    renderDialog({ onCancel })
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
    expect(onCancel).toHaveBeenCalled()
  })
})
