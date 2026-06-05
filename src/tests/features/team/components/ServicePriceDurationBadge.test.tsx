import { render, screen } from '@/test-utils/render-utils'

import { ServicePriceDurationBadge } from '@/features/team/components/ServicePriceDurationBadge'

// ── Duration ──────────────────────────────────────────────────────────────────

describe('ServicePriceDurationBadge — duration', () => {
  it('shows duration in minutes when durationMinutes is provided', () => {
    render(<ServicePriceDurationBadge durationMinutes={45} />)
    expect(screen.getByText('45 min')).toBeInTheDocument()
  })

  it('does not render a duration chip when durationMinutes is null', () => {
    render(<ServicePriceDurationBadge durationMinutes={null} priceFrom={100} isPriceDisplayed={true} />)
    expect(screen.queryByText(/min/)).toBeNull()
  })
})

// ── Price display ─────────────────────────────────────────────────────────────

describe('ServicePriceDurationBadge — price', () => {
  it('shows "A partir de" when only priceFrom is provided', () => {
    render(<ServicePriceDurationBadge priceFrom={150} isPriceDisplayed={true} />)
    expect(screen.getByText(/A partir de/)).toBeInTheDocument()
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('shows price range when both priceFrom and priceTo are provided', () => {
    render(
      <ServicePriceDurationBadge
        priceFrom={100}
        priceTo={200}
        isPriceDisplayed={true}
      />,
    )
    const text = screen.getByText(/100/)
    expect(text.textContent).toMatch(/–/)
    expect(text.textContent).toMatch(/200/)
  })

  it('shows "Preço sob consulta" when isPriceDisplayed is false', () => {
    render(
      <ServicePriceDurationBadge
        priceFrom={100}
        isPriceDisplayed={false}
      />,
    )
    expect(screen.getByText('Preço sob consulta')).toBeInTheDocument()
  })

  it('shows "Preço sob consulta" when no price data is available', () => {
    render(<ServicePriceDurationBadge durationMinutes={30} />)
    expect(screen.getByText('Preço sob consulta')).toBeInTheDocument()
  })
})

// ── Combined ──────────────────────────────────────────────────────────────────

describe('ServicePriceDurationBadge — combined', () => {
  it('renders both duration and price chips together', () => {
    render(
      <ServicePriceDurationBadge
        durationMinutes={60}
        priceFrom={200}
        isPriceDisplayed={true}
      />,
    )
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText(/A partir de/)).toBeInTheDocument()
  })

  it('returns null when durationMinutes is null and price is hidden (still shows price badge)', () => {
    render(<ServicePriceDurationBadge isPriceDisplayed={false} />)
    expect(screen.getByText('Preço sob consulta')).toBeInTheDocument()
  })
})
