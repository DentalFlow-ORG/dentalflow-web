import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

// Radix Select does not work reliably in JSDOM — stub with a native <select>.
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    name,
    required,
    disabled,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    name?: string
    required?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <select
      name={name}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  // SelectTrigger accepts (and ignores) the id; the select is found by role, not label.
  SelectTrigger: ({ children }: { children: React.ReactNode; id?: string }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { AvailabilitySlotForm } from '@/features/scheduling/components/availability/AvailabilitySlotForm'

describe('AvailabilitySlotForm', () => {
  it('shows custom validation for an empty submission instead of using browser popups', async () => {
    const onSubmit = vi.fn()
    render(<AvailabilitySlotForm isLoading={false} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByText('Selecione o dia e informe os horários de início e fim.'),
    ).toBeInTheDocument()
  })

  it('renders empty when no initial value is given', () => {
    render(<AvailabilitySlotForm isLoading={false} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Início')).toHaveValue('')
    expect(screen.getByLabelText('Fim')).toHaveValue('')
  })

  it('pre-fills from the initial value', () => {
    render(
      <AvailabilitySlotForm
        initial={{ dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }}
        isLoading={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox')).toHaveValue('2')
    expect(screen.getByLabelText('Início')).toHaveValue('08:00')
    expect(screen.getByLabelText('Fim')).toHaveValue('18:00')
  })

  it('submits a new slot as active', async () => {
    const onSubmit = vi.fn()
    render(<AvailabilitySlotForm isLoading={false} onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    await userEvent.type(screen.getByLabelText('Início'), '0800')
    await userEvent.type(screen.getByLabelText('Fim'), '1800')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '18:00',
      isActive: true,
    })
  })

  it('keeps the active state when editing an existing slot', async () => {
    const onSubmit = vi.fn()
    render(
      <AvailabilitySlotForm
        initial={{ dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }}
        isLoading={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSubmit).toHaveBeenCalledWith({ dayOfWeek: 2, startTime: '08:00', endTime: '18:00' })
  })

  it.each([
    ['equal to', '0800', '0800'],
    ['after', '1800', '0800'],
  ])('shows an inline error when the start is %s the end', async (_case, start, end) => {
    const onSubmit = vi.fn()
    render(<AvailabilitySlotForm isLoading={false} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    await userEvent.type(screen.getByLabelText('Início'), start)
    await userEvent.type(screen.getByLabelText('Fim'), end)
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      screen.getByText('O horário de início deve ser anterior ao horário de fim.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Fim')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('gives each form instance unique field ids', () => {
    render(
      <>
        <AvailabilitySlotForm isLoading={false} onSubmit={vi.fn()} onCancel={vi.fn()} />
        <AvailabilitySlotForm isLoading={false} onSubmit={vi.fn()} onCancel={vi.fn()} />
      </>,
    )
    const [first, second] = screen.getAllByLabelText('Início')
    expect(first.id).not.toBe(second.id)
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<AvailabilitySlotForm isLoading={false} onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows the saving state and disables the fields/buttons while loading', () => {
    render(<AvailabilitySlotForm isLoading onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByLabelText('Início')).toBeDisabled()
    expect(screen.getByLabelText('Fim')).toBeDisabled()
  })
})
