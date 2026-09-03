import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { SubscriptionCancelPage } from '@/features/billing/pages/SubscriptionCancelPage'

describe('SubscriptionCancelPage', () => {
  it('renders the title and explanation', () => {
    render(<SubscriptionCancelPage />)
    expect(screen.getByRole('heading', { name: 'Assinatura não concluída' })).toBeInTheDocument()
    expect(screen.getByText(/nenhum plano foi ativado/i)).toBeInTheDocument()
  })

  it('links to choose a plan and to go back to the dashboard', () => {
    render(<SubscriptionCancelPage />)
    expect(screen.getByRole('link', { name: 'Escolher plano' })).toHaveAttribute(
      'href',
      '/app/assinatura',
    )
    expect(screen.getByRole('link', { name: /voltar ao painel/i })).toHaveAttribute('href', '/app')
  })
})
