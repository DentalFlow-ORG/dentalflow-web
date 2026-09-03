import { render, screen } from '@/test-utils/render-utils'

import { SubscriptionHero } from '@/features/billing/components/SubscriptionHero'

describe('SubscriptionHero', () => {
  it('renders the heading and all trust chips', () => {
    render(<SubscriptionHero />)
    expect(
      screen.getByRole('heading', { name: 'Escolha o plano ideal para a sua clínica' }),
    ).toBeInTheDocument()
    expect(screen.getByText('7 dias grátis')).toBeInTheDocument()
    expect(screen.getByText('Sem cartão de crédito')).toBeInTheDocument()
    expect(screen.getByText('Cancele quando quiser')).toBeInTheDocument()
    expect(screen.getByText('Suporte na implantação')).toBeInTheDocument()
  })
})
