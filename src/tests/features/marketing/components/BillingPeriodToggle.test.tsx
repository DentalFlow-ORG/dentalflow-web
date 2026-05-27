import { render, screen, userEvent } from '@/test/render-utils'

import { BillingPeriodToggle } from '@/features/marketing/components/BillingPeriodToggle'

describe('BillingPeriodToggle', () => {
  it('renders both billing period options', () => {
    render(<BillingPeriodToggle value="monthly" onChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Mensal/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Anual/ })).toBeInTheDocument()
  })

  it('calls onChange with "monthly" when the monthly option is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<BillingPeriodToggle value="annual" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: /Mensal/ }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('monthly')
  })

  it('calls onChange with "annual" when the annual option is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<BillingPeriodToggle value="monthly" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: /Anual/ }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('annual')
  })

  it('sets aria-checked correctly when value changes', () => {
    const { rerender } = render(<BillingPeriodToggle value="monthly" onChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Mensal/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /Anual/ })).toHaveAttribute('aria-checked', 'false')

    rerender(<BillingPeriodToggle value="annual" onChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Mensal/ })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: /Anual/ })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders the savings badge when savingsLabel is provided', () => {
    render(<BillingPeriodToggle value="monthly" onChange={vi.fn()} savingsLabel="3 meses grátis" />)
    expect(screen.getByText('3 meses grátis')).toBeInTheDocument()
  })

  it('does not render a savings badge when savingsLabel is empty', () => {
    render(<BillingPeriodToggle value="monthly" onChange={vi.fn()} savingsLabel="" />)
    expect(screen.queryByText('2 meses grátis')).not.toBeInTheDocument()
  })

  it('renders without crashing with variant="dark" and remains accessible', () => {
    render(<BillingPeriodToggle value="annual" onChange={vi.fn()} variant="dark" />)
    expect(screen.getByRole('radiogroup', { name: 'Período de cobrança' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Mensal/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Anual/ })).toBeInTheDocument()
  })
})
