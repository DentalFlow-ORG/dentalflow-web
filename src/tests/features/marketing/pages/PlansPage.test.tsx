import type { ReactNode } from 'react'

import { render, screen, userEvent, within } from '@/test-utils/render-utils'

import { PlansPage } from '@/features/marketing/pages/PlansPage'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const reveal = vi.hoisted(() => ({ isVisible: true }))
vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: reveal.isVisible }),
}))

beforeEach(() => {
  reveal.isVisible = true
})

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('PlansPage', () => {
  it('renders the hero heading', () => {
    render(<PlansPage />)
    expect(screen.getByRole('heading', { name: /impulsionar resultados/i })).toBeInTheDocument()
  })

  it('renders all three plan names in the pricing cards section', () => {
    render(<PlansPage />)
    expect(screen.getByRole('heading', { name: 'Starter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Professional' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument()
  })

  it('renders the feature comparison section', () => {
    render(<PlansPage />)
    expect(screen.getByRole('heading', { name: /Compare todos os recursos/i })).toBeInTheDocument()
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

describe('PlansPage — FAQ accordion', () => {
  const question = 'Preciso de cartão de crédito para testar?'

  it('renders every question collapsed', () => {
    render(<PlansPage />)
    expect(screen.getByRole('button', { name: question })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens a question and exposes its answer region', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)
    const button = screen.getByRole('button', { name: question })
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const panelId = button.getAttribute('aria-controls')
    expect(document.getElementById(panelId as string)).toHaveAttribute('role', 'region')
  })

  it('closes the same question on a second click', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)
    const button = screen.getByRole('button', { name: question })
    await user.click(button)
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps only one question open at a time', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)
    const first = screen.getByRole('button', { name: question })
    await user.click(first)
    const others = screen
      .getAllByRole('button')
      .filter(
        (b) => b.getAttribute('aria-expanded') === 'false' && b.id.startsWith('plans-faq-btn'),
      )
    await user.click(others[0])
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(others[0]).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('PlansPage — before the reveal animation runs', () => {
  it('renders the hero and CTA in their pre-reveal hidden state', () => {
    reveal.isVisible = false
    render(<PlansPage />)
    expect(screen.getByRole('heading', { name: /impulsionar resultados/i })).toBeInTheDocument()
    expect(document.querySelectorAll('.opacity-0').length).toBeGreaterThan(0)
  })
})
