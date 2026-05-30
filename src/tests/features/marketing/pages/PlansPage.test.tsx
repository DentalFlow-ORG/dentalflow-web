import type { ReactNode } from 'react'

import { render, screen, userEvent, within } from '@/test-utils/render-utils'

import { PlansPage } from '@/features/marketing/pages/PlansPage'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('PlansPage', () => {
  it('renders the hero heading', () => {
    render(<PlansPage />)
    expect(
      screen.getByRole('heading', { name: /impulsionar resultados/i }),
    ).toBeInTheDocument()
  })

  it('renders all three plan names in the pricing cards section', () => {
    render(<PlansPage />)
    expect(screen.getByRole('heading', { name: 'Starter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Professional' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument()
  })

  it('renders the feature comparison section', () => {
    render(<PlansPage />)
    expect(
      screen.getByRole('heading', { name: /Compare todos os recursos/i }),
    ).toBeInTheDocument()
  })

  it('renders at least one FAQ question', () => {
    render(<PlansPage />)
    expect(
      screen.getByRole('button', { name: 'Preciso de cartão de crédito para testar?' }),
    ).toBeInTheDocument()
  })

  it('shows monthly pricing copy after switching the billing toggle to monthly', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)
    await user.click(screen.getAllByRole('radio', { name: /Mensal/ })[0])
    const pricingRegion = screen.getByRole('region', { name: 'Planos e preços' })
    expect(within(pricingRegion).getAllByText(/Primeiro mês/i)).toHaveLength(3)
  })
})
