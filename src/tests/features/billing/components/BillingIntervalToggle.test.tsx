import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { BillingIntervalToggle } from '@/features/billing/components/BillingIntervalToggle'

describe('BillingIntervalToggle', () => {
  it('renders only the monthly option when showYearly is false', () => {
    render(
      <BillingIntervalToggle value="MONTHLY" onChange={vi.fn()} showMonthly showYearly={false} />,
    )
    expect(screen.getByRole('radio', { name: 'Mensal' })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /anual/i })).not.toBeInTheDocument()
  })

  it('renders only the yearly option when showMonthly is false', () => {
    render(
      <BillingIntervalToggle value="YEARLY" onChange={vi.fn()} showMonthly={false} showYearly />,
    )
    expect(screen.queryByRole('radio', { name: 'Mensal' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /anual/i })).toBeInTheDocument()
  })

  it('marks the selected value as checked', () => {
    render(<BillingIntervalToggle value="YEARLY" onChange={vi.fn()} showMonthly showYearly />)
    expect(screen.getByRole('radio', { name: /anual/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Mensal' })).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with MONTHLY/YEARLY when clicked', async () => {
    const onChange = vi.fn()
    render(<BillingIntervalToggle value="MONTHLY" onChange={onChange} showMonthly showYearly />)
    await userEvent.click(screen.getByRole('radio', { name: /anual/i }))
    expect(onChange).toHaveBeenCalledWith('YEARLY')
  })

  it('shows the monthly promo badge and message when hasMonthlyPromo is true', () => {
    render(
      <BillingIntervalToggle
        value="MONTHLY"
        onChange={vi.fn()}
        showMonthly
        showYearly
        hasMonthlyPromo
      />,
    )
    expect(screen.getByText('1º mês')).toBeInTheDocument()
    expect(screen.getByText('Preço especial de lançamento no 1º mês')).toBeInTheDocument()
  })

  it('does not show the monthly promo message when value is not MONTHLY', () => {
    render(
      <BillingIntervalToggle
        value="YEARLY"
        onChange={vi.fn()}
        showMonthly
        showYearly
        hasMonthlyPromo
      />,
    )
    expect(screen.queryByText('Preço especial de lançamento no 1º mês')).not.toBeInTheDocument()
  })

  it('shows the discount badge when discountPercent is positive', () => {
    render(
      <BillingIntervalToggle
        value="MONTHLY"
        onChange={vi.fn()}
        showMonthly
        showYearly
        discountPercent={20}
      />,
    )
    expect(screen.getByText('-20%')).toBeInTheDocument()
  })

  it('does not show the discount badge when discountPercent is null or zero', () => {
    const { rerender } = render(
      <BillingIntervalToggle
        value="MONTHLY"
        onChange={vi.fn()}
        showMonthly
        showYearly
        discountPercent={null}
      />,
    )
    expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument()

    rerender(
      <BillingIntervalToggle
        value="MONTHLY"
        onChange={vi.fn()}
        showMonthly
        showYearly
        discountPercent={0}
      />,
    )
    expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument()
  })

  it('shows the "melhor custo-benefício" message when yearly is selected', () => {
    render(<BillingIntervalToggle value="YEARLY" onChange={vi.fn()} showMonthly showYearly />)
    expect(screen.getByText(/melhor custo-benefício/i)).toBeInTheDocument()
  })
})
