import { render, screen } from '@/test-utils/render-utils'

import { PlanUpgradePrompt } from '@/components/common/PlanUpgradePrompt'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

describe('PlanUpgradePrompt', () => {
  it('renders title, description and a link to the plans page', () => {
    render(<PlanUpgradePrompt title="Recurso Premium" description="Disponível nos planos pagos." />)
    expect(screen.getByText('Recurso Premium')).toBeInTheDocument()
    expect(screen.getByText('Disponível nos planos pagos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver planos/i })).toHaveAttribute(
      'href',
      '/app/assinatura',
    )
  })

  it('applies a custom button variant and className', () => {
    render(
      <PlanUpgradePrompt
        title="T"
        description="D"
        buttonVariant="outline"
        buttonClassName="custom-btn"
      />,
    )
    expect(screen.getByRole('link', { name: /ver planos/i })).toHaveClass('custom-btn')
  })
})
