import { render, screen } from '@/test-utils/render-utils'

import { PremiumBlurredPreview } from '@/components/common/PremiumBlurredPreview'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

describe('PremiumBlurredPreview', () => {
  it('shows the default upsell message when there is no blockedReason', () => {
    render(<PremiumBlurredPreview blockedReason={null} />)
    expect(
      screen.getByText('O assistente de IA está disponível nos planos Professional e Premium.'),
    ).toBeInTheDocument()
  })

  it('shows the blockedReason when provided', () => {
    render(<PremiumBlurredPreview blockedReason="Cota mensal atingida." />)
    expect(screen.getByText('Cota mensal atingida.')).toBeInTheDocument()
  })

  it('renders the "Recurso Premium" title', () => {
    render(<PremiumBlurredPreview blockedReason={null} />)
    expect(screen.getByText('Recurso Premium')).toBeInTheDocument()
  })
})
