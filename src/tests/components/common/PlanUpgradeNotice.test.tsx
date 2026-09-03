import { render, screen } from '@/test-utils/render-utils'

import { PlanUpgradeNotice } from '@/components/common/PlanUpgradeNotice'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

describe('PlanUpgradeNotice', () => {
  it('renders the default title and description', () => {
    render(<PlanUpgradeNotice />)
    expect(
      screen.getByRole('heading', { name: 'Recurso não disponível no seu plano' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/faça upgrade para liberar esta funcionalidade/i)).toBeInTheDocument()
  })

  it('renders a custom title and description', () => {
    render(<PlanUpgradeNotice title="Bloqueado" description="Fale com o suporte." />)
    expect(screen.getByRole('heading', { name: 'Bloqueado' })).toBeInTheDocument()
    expect(screen.getByText('Fale com o suporte.')).toBeInTheDocument()
  })

  it('links to the subscription page', () => {
    render(<PlanUpgradeNotice />)
    expect(screen.getByRole('link', { name: /ver planos e fazer upgrade/i })).toHaveAttribute(
      'href',
      '/app/assinatura',
    )
  })
})
