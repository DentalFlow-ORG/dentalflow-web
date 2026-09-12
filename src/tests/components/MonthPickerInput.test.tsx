import { MonthPickerInput } from '@/components/common/MonthPickerInput'
import { maskMonthInput } from '@/components/common/MonthPickerInput.utils'
import { brazilCurrentIsoMonth } from '@/lib/brazil-timezone'
import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

// ── maskMonthInput unit tests ─────────────────────────────────────────────────

describe('maskMonthInput', () => {
  it('returns raw digits when fewer than 3 characters', () => {
    expect(maskMonthInput('0')).toBe('0')
    expect(maskMonthInput('06')).toBe('06')
  })

  it('inserts slash after the first two digits', () => {
    expect(maskMonthInput('062')).toBe('06/2')
    expect(maskMonthInput('062026')).toBe('06/2026')
  })

  it('strips non-digit characters and re-applies mask', () => {
    expect(maskMonthInput('06/2026')).toBe('06/2026')
    expect(maskMonthInput('ab062026')).toBe('06/2026')
  })

  it('caps at 6 digits (2 month + 4 year)', () => {
    expect(maskMonthInput('0620261234')).toBe('06/2026')
  })
})

// ── Render ────────────────────────────────────────────────────────────────────

describe('MonthPickerInput — render', () => {
  it('renders with placeholder when value is empty', () => {
    render(<MonthPickerInput placeholder="MM/AAAA" />)
    expect(screen.getByPlaceholderText('MM/AAAA')).toBeInTheDocument()
  })

  it('shows the formatted display value from a controlled YYYY-MM value', () => {
    render(<MonthPickerInput value="2026-06" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('06/2026')
  })

  it('renders the calendar icon button', () => {
    render(<MonthPickerInput />)
    expect(screen.getByRole('button', { name: /abrir seletor de mês/i })).toBeInTheDocument()
  })
})

// ── Manual typing ─────────────────────────────────────────────────────────────

describe('MonthPickerInput — manual typing', () => {
  it('calls onValueChange with YYYY-MM when a complete MM/AAAA is typed', async () => {
    const onChange = vi.fn()
    render(<MonthPickerInput onValueChange={onChange} />)
    const input = screen.getByRole('textbox')
    // Typing "06" then "2026" — mask produces "06/2026" which is complete
    fireEvent.change(input, { target: { value: '062026' } })
    expect(onChange).toHaveBeenCalledWith('2026-06')
  })

  it('does NOT call onValueChange for an invalid month (13)', () => {
    const onChange = vi.fn()
    render(<MonthPickerInput onValueChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '132026' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onValueChange with empty string when input is cleared', () => {
    const onChange = vi.fn()
    render(<MonthPickerInput value="2026-06" onValueChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith('')
  })
})

// ── Popover ───────────────────────────────────────────────────────────────────

describe('MonthPickerInput — popover', () => {
  it('opens popover when calendar button is clicked', async () => {
    const user = userEvent.setup()
    render(<MonthPickerInput value="2026-06" />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => {
      expect(screen.getByText('2026')).toBeInTheDocument()
    })
  })

  it('shows all 12 month abbreviations in the grid', async () => {
    const user = userEvent.setup()
    render(<MonthPickerInput value="2026-01" />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => screen.getByText('Jan'))
    for (const abbr of [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]) {
      expect(screen.getByRole('button', { name: abbr })).toBeInTheDocument()
    }
  })

  it('calls onValueChange when a month button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MonthPickerInput value="2026-01" onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => screen.getByRole('button', { name: 'Jun' }))
    await user.click(screen.getByRole('button', { name: 'Jun' }))
    expect(onChange).toHaveBeenCalledWith('2026-06')
  })

  it('navigates to the previous year', async () => {
    const user = userEvent.setup()
    render(<MonthPickerInput value="2026-06" />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => screen.getByText('2026'))
    await user.click(screen.getByRole('button', { name: /ano anterior/i }))
    expect(screen.getByText('2025')).toBeInTheDocument()
  })

  it('navigates to the next year', async () => {
    const user = userEvent.setup()
    render(<MonthPickerInput value="2026-06" />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => screen.getByText('2026'))
    await user.click(screen.getByRole('button', { name: /próximo ano/i }))
    expect(screen.getByText('2027')).toBeInTheDocument()
  })

  it('"Este mês" button calls onValueChange with the Brazil current month', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MonthPickerInput onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /abrir seletor de mês/i }))
    await waitFor(() => screen.getByRole('button', { name: /este mês/i }))
    await user.click(screen.getByRole('button', { name: /este mês/i }))
    // Uses Brazil timezone, not browser/UTC timezone
    expect(onChange).toHaveBeenCalledWith(brazilCurrentIsoMonth())
  })
})

// ── Disabled state ────────────────────────────────────────────────────────────

describe('MonthPickerInput — disabled', () => {
  it('disables the text input and calendar button when disabled prop is set', () => {
    render(<MonthPickerInput disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: /abrir seletor de mês/i })).toBeDisabled()
  })
})

// ── Malformed and partial input ───────────────────────────────────────────────

describe('MonthPickerInput — malformed and partial input', () => {
  it('falls back to the placeholder label when the value is not an ISO month', () => {
    render(<MonthPickerInput value="2026" placeholder="Selecionar mês" />)
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Selecionar mês')
  })

  it('does not emit a month while the typed value is still incomplete', async () => {
    const onValueChange = vi.fn()
    render(<MonthPickerInput onValueChange={onValueChange} />)
    await userEvent.type(screen.getByRole('textbox'), '0620')
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
