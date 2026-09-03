import { act } from '@testing-library/react'

import { render, screen } from '@/test-utils/render-utils'

import { LaunchOfferBanner } from '@/features/billing/components/LaunchOfferBanner'
import type { BillingCampaign } from '@/features/billing/types/billing.types'

function makeCampaign(overrides: Partial<BillingCampaign> = {}): BillingCampaign {
  return {
    name: 'launch',
    enabled: true,
    totalSpots: 100,
    claimedSpots: 40,
    promotionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    promotionalPrices: {},
    compareAtPrices: {},
    message: 'Oferta de lançamento',
    ...overrides,
  }
}

describe('LaunchOfferBanner', () => {
  afterEach(() => vi.useRealTimers())

  it('renders nothing when there is no campaign', () => {
    const { container } = render(
      <LaunchOfferBanner campaign={null} billingInterval="MONTHLY" hasMonthlyPromo />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for MONTHLY without an active promo', () => {
    const { container } = render(
      <LaunchOfferBanner
        campaign={makeCampaign()}
        billingInterval="MONTHLY"
        hasMonthlyPromo={false}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the launch offer card with a countdown for MONTHLY + promo', () => {
    render(
      <LaunchOfferBanner campaign={makeCampaign()} billingInterval="MONTHLY" hasMonthlyPromo />,
    )
    expect(screen.getByText('Condição especial de lançamento')).toBeInTheDocument()
    expect(screen.getByText('Oferta termina em')).toBeInTheDocument()
  })

  it('shows the spots progress bar when totalSpots > 0', () => {
    render(
      <LaunchOfferBanner
        campaign={makeCampaign({ totalSpots: 100, claimedSpots: 40 })}
        billingInterval="MONTHLY"
        hasMonthlyPromo
      />,
    )
    expect(screen.getByText('40/100')).toBeInTheDocument()
  })

  it('does not show the spots progress bar when totalSpots is 0', () => {
    render(
      <LaunchOfferBanner
        campaign={makeCampaign({ totalSpots: 0 })}
        billingInterval="MONTHLY"
        hasMonthlyPromo
      />,
    )
    expect(screen.queryByText('Clínicas com essa condição ativa')).not.toBeInTheDocument()
  })

  it('shows "Oferta encerrada" and the unavailable message when the promo has ended', () => {
    render(
      <LaunchOfferBanner
        campaign={makeCampaign({
          promotionEndDate: new Date(Date.now() - 1000).toISOString(),
        })}
        billingInterval="MONTHLY"
        hasMonthlyPromo
      />,
    )
    expect(screen.getByText('Oferta encerrada')).toBeInTheDocument()
    expect(
      screen.getByText('A condição especial não está disponível no momento.'),
    ).toBeInTheDocument()
  })

  it('treats an unparsable promotionEndDate as no countdown', () => {
    render(
      <LaunchOfferBanner
        campaign={makeCampaign({ promotionEndDate: 'not-a-date' })}
        billingInterval="MONTHLY"
        hasMonthlyPromo
      />,
    )
    expect(screen.getByText('Oferta encerrada')).toBeInTheDocument()
  })

  it('renders the annual value card for YEARLY, regardless of hasMonthlyPromo', () => {
    render(
      <LaunchOfferBanner
        campaign={makeCampaign()}
        billingInterval="YEARLY"
        hasMonthlyPromo={false}
      />,
    )
    expect(screen.getByText('Plano anual selecionado')).toBeInTheDocument()
  })

  it('updates the countdown as time passes', () => {
    vi.useFakeTimers()
    render(
      <LaunchOfferBanner
        campaign={makeCampaign({
          promotionEndDate: new Date(Date.now() + 10 * 60_000).toISOString(),
        })}
        billingInterval="MONTHLY"
        hasMonthlyPromo
      />,
    )
    const before = screen.getByText(/oferta encerra em/i).textContent
    act(() => {
      vi.advanceTimersByTime(61_000)
    })
    const after = screen.getByText(/oferta encerra em/i).textContent
    expect(after).not.toBe(before)
  })
})
