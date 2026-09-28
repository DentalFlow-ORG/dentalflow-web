import { ExceptionEditModal } from '@/features/scheduling/components/availability/ExceptionEditModal'
import type { AvailabilityException } from '@/features/scheduling/types/scheduling.types'
import { fireEvent, renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'

const exception: AvailabilityException = {
  id: 'exception-1',
  profileId: 'profile-1',
  clinicId: 'clinic-1',
  exceptionDate: '2026-12-10',
  isDayOff: false,
  startTime: '09:00',
  endTime: '12:00',
  reason: 'Atendimento especial',
  createdAt: '2026-06-01T12:00:00Z',
  updatedAt: '2026-06-01T12:00:00Z',
}

function props() {
  return {
    open: true,
    exception,
    isSaving: false,
    isDeleting: false,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
  }
}

it('shows a custom error for missing special schedule times', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  fireEvent.change(screen.getByLabelText('Início'), { target: { value: '' } })
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
  expect(callbacks.onSave).not.toHaveBeenCalled()
  expect(screen.getByText('Informe os horários de início e fim.')).toBeInTheDocument()
})

it('rejects a missing end time even when the start time is valid', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '' } })
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
  expect(callbacks.onSave).not.toHaveBeenCalled()
  expect(screen.getByText('Informe os horários de início e fim.')).toBeInTheDocument()
})

it('edits a special schedule and submits the existing date with the changed values', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Editar exceção')
  expect(screen.getByLabelText('Início')).toHaveValue('09:00')
  fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '13:00' } })
  fireEvent.change(screen.getByLabelText(/Motivo/), { target: { value: '  Novo horário  ' } })
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
  expect(callbacks.onSave).toHaveBeenCalledExactlyOnceWith({
    exceptionDate: '2026-12-10',
    isDayOff: false,
    startTime: '09:00',
    endTime: '13:00',
    reason: 'Novo horário',
  })
})

it('allows changing a special schedule to a day off without retaining time fields', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  await userEvent.click(screen.getByRole('button', { name: 'Folga ocasional' }))
  expect(screen.queryByLabelText('Início')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
  expect(callbacks.onSave).toHaveBeenCalledWith({
    exceptionDate: '2026-12-10',
    isDayOff: true,
    reason: 'Atendimento especial',
  })
})

it('forwards deletion and cancellation, and allows Escape when idle', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  await userEvent.click(screen.getByRole('button', { name: 'Excluir exceção' }))
  expect(callbacks.onDelete).toHaveBeenCalledOnce()
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(callbacks.onClose).toHaveBeenCalled()
  callbacks.onClose.mockClear()
  await userEvent.keyboard('{Escape}')
  expect(callbacks.onClose).toHaveBeenCalled()
})

it.each(['isSaving', 'isDeleting'] as const)(
  'prevents Escape and outside dismissal while %s',
  async (pending) => {
    const callbacks = props()
    renderWithProviders(<ExceptionEditModal {...callbacks} {...{ [pending]: true }} />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await userEvent.keyboard('{Escape}')
    fireEvent.pointerDown(document.body, { button: 0, pointerType: 'mouse' })
    expect(callbacks.onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  },
)

it('closes on outside interaction once saving has finished', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  await userEvent.tab()
  fireEvent.pointerDown(document.body, { button: 0, pointerType: 'mouse' })
  expect(callbacks.onClose).toHaveBeenCalled()
})

it('does not render a form before an exception is selected', () => {
  renderWithProviders(<ExceptionEditModal {...props()} open={false} exception={null} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeInTheDocument()
})

it('blocks a special schedule whose end is not after its start and clears the error on edit', async () => {
  const callbacks = props()
  renderWithProviders(<ExceptionEditModal {...callbacks} />)
  fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '09:00' } })
  await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

  expect(callbacks.onSave).not.toHaveBeenCalled()
  const start = screen.getByLabelText('Início')
  const end = screen.getByLabelText('Fim')
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(start).toHaveAttribute('aria-invalid', 'true')
  expect(end).toHaveAttribute('aria-invalid', 'true')
  expect(end).toHaveAttribute('aria-describedby', `${end.id}-error`)

  fireEvent.change(end, { target: { value: '12:30' } })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(end).not.toHaveAttribute('aria-invalid')
})
