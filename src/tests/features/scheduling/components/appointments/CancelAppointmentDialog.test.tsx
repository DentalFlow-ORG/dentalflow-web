import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { CancelAppointmentDialog } from '@/features/scheduling/components/appointments/CancelAppointmentDialog'

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

  it('clears the reason textarea after confirming', async () => {
    const user = userEvent.setup()
    renderDialog()
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Motivo qualquer')
    await user.click(screen.getByRole('button', { name: /Confirmar cancelamento/i }))
    expect(textarea).toHaveValue('')
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
  it('disables both action buttons when isCanceling is true', () => {
    renderDialog({ isCanceling: true })
    expect(screen.getByRole('button', { name: /Cancelando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Voltar/i })).toBeDisabled()
  })

  it('shows "Cancelando..." as the confirm button label when isCanceling is true', () => {
    renderDialog({ isCanceling: true })
    expect(screen.getByRole('button', { name: /Cancelando/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Confirmar cancelamento/i })).not.toBeInTheDocument()
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
