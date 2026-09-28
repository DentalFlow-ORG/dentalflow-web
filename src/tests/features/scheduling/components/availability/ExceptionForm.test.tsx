import { ExceptionForm } from '@/features/scheduling/components/availability/ExceptionForm'
import { fireEvent, render, screen, userEvent } from '@/test-utils/render-utils'

it('rejects a missing date and permits retry after choosing a date', async () => {
  const onSubmit = vi.fn()
  render(<ExceptionForm isLoading={false} onSubmit={onSubmit} onCancel={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(onSubmit).not.toHaveBeenCalled()
  const date = screen.getByLabelText('Data')
  expect(date).toHaveAttribute('aria-invalid', 'true')
  expect(date).toHaveAccessibleDescription('Informe a data da exceção.')
  fireEvent.change(date, { target: { value: '30/09/2026' } })
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
    exceptionDate: '2026-09-30',
    isDayOff: true,
    reason: undefined,
  })
  expect(screen.queryByText('Informe a data da exceção.')).not.toBeInTheDocument()
})
