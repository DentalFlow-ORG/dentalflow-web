import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@/test-utils/render-utils'

import { DatePickerInput } from '@/components/common/DatePickerInput'

// June 2026 starts on a Monday, so the calendar grid has no leading days from
// May — day-cell index N (0-based) is always June's (N + 1). Using index-based
// lookup avoids ambiguity with trailing July day numbers that repeat (e.g. "5").
function getDayCell(dayOfJune: number) {
  const grids = document.body.querySelectorAll('.grid-cols-7')
  const dayGrid = grids[1] as HTMLElement
  const buttons = within(dayGrid).getAllByRole('button')
  return buttons[dayOfJune - 1]
}

describe('DatePickerInput', () => {
  it('renders the placeholder when there is no value', () => {
    render(<DatePickerInput placeholder="Selecionar data" />)
    expect(screen.getByLabelText('Selecionar data')).toHaveValue('')
  })

  it('renders a pre-filled value formatted as dd/mm/yyyy', () => {
    render(<DatePickerInput value="2026-06-15" placeholder="Data" />)
    expect(screen.getByLabelText('Data')).toHaveValue('15/06/2026')
  })

  it('renders a hidden input with the field name for native form submission', () => {
    const { container } = render(
      <DatePickerInput name="birthDate" value="2026-06-15" placeholder="Data" />,
    )
    const hidden = container.querySelector('input[type="hidden"][name="birthDate"]')
    expect(hidden).toHaveValue('2026-06-15')
  })

  it('does not render a hidden input when no name is given', () => {
    const { container } = render(<DatePickerInput value="2026-06-15" placeholder="Data" />)
    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument()
  })

  it('accepts manual typed input and commits a valid date', async () => {
    const onValueChange = vi.fn()
    render(<DatePickerInput placeholder="Data" onValueChange={onValueChange} />)
    const input = screen.getByLabelText('Data')
    await userEvent.type(input, '15062026')
    expect(onValueChange).toHaveBeenCalledWith('2026-06-15')
  })

  it('clears the value when the manual input is emptied', async () => {
    const onValueChange = vi.fn()
    render(
      <DatePickerInput
        defaultValue="2026-06-15"
        placeholder="Data"
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByLabelText('Data')
    await userEvent.clear(input)
    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('opens the calendar popover and selects a day', async () => {
    const onValueChange = vi.fn()
    render(<DatePickerInput value="2026-06-15" placeholder="Data" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))

    await screen.findByText(/junho de 2026/i)
    await userEvent.click(getDayCell(20))

    expect(onValueChange).toHaveBeenCalledWith('2026-06-20')
  })

  it('navigates to the next and previous month', async () => {
    render(<DatePickerInput value="2026-06-15" placeholder="Data" />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    await screen.findByText(/junho de 2026/i)

    await userEvent.click(screen.getByRole('button', { name: 'Proximo mes' }))
    expect(await screen.findByText(/julho de 2026/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Mes anterior' }))
    expect(await screen.findByText(/junho de 2026/i)).toBeInTheDocument()
  })

  it('selects today when clicking the "Hoje" shortcut', async () => {
    const onValueChange = vi.fn()
    render(<DatePickerInput placeholder="Data" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    await userEvent.click(screen.getByRole('button', { name: 'Hoje' }))
    expect(onValueChange).toHaveBeenCalled()
  })

  it('disables days before minValue', async () => {
    render(<DatePickerInput value="2026-06-15" minValue="2026-06-10" placeholder="Data" />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    await screen.findByText(/junho de 2026/i)
    expect(getDayCell(5)).toBeDisabled()
    expect(getDayCell(15)).toBeEnabled()
  })

  it('disables days matching a custom disabledDate predicate', async () => {
    render(
      <DatePickerInput
        value="2026-06-15"
        placeholder="Data"
        disabledDate={(v) => v === '2026-06-20'}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    await screen.findByText(/junho de 2026/i)
    expect(getDayCell(20)).toBeDisabled()
  })

  it('shows "Sem data" in the footer when nothing is selected', async () => {
    render(<DatePickerInput placeholder="Data" />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir calendário' }))
    expect(await screen.findByText('Sem data')).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is set', () => {
    render(<DatePickerInput placeholder="Data" disabled />)
    expect(screen.getByLabelText('Data')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Abrir calendário' })).toBeDisabled()
  })

  it('works uncontrolled with a defaultValue', () => {
    render(<DatePickerInput defaultValue="2026-06-15" placeholder="Data" />)
    expect(screen.getByLabelText('Data')).toHaveValue('15/06/2026')
  })
})
