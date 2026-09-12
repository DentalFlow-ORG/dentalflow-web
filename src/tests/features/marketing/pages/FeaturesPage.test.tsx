import type { ReactNode } from 'react'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/marketing/hooks/usePageMeta', () => ({
  usePageMeta: () => {},
}))

const reveal = vi.hoisted(() => ({ isVisible: true }))
vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: reveal.isVisible }),
}))

beforeEach(() => {
  reveal.isVisible = true
})

vi.mock('@/features/marketing/components/AvailabilityIndicator', () => ({
  AvailabilityIndicator: ({ available }: { available: boolean }) => (
    <span>{available ? 'available' : 'unavailable'}</span>
  ),
}))

import { FeaturesPage } from '@/features/marketing/pages/FeaturesPage'

describe('FeaturesPage', () => {
  it('renders the hero heading and CTA links', () => {
    render(<FeaturesPage />)
    expect(
      screen.getByRole('heading', { name: /toda a gestão da sua clínica/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /começar teste grátis/i })[0]).toHaveAttribute(
      'href',
      '/acessar',
    )
    expect(screen.getAllByRole('link', { name: /ver planos e preços/i })[0]).toHaveAttribute(
      'href',
      '/planos',
    )
  })

  it('renders all 6 featured modules as links to their detail pages', () => {
    render(<FeaturesPage />)
    expect(screen.getByRole('link', { name: /agenda inteligente/i })).toHaveAttribute(
      'href',
      '/funcionalidades/agenda',
    )
    expect(screen.getByRole('link', { name: /gestão financeira/i })).toHaveAttribute(
      'href',
      '/funcionalidades/financeiro',
    )
    expect(screen.getByRole('link', { name: /ia de gestão/i })).toHaveAttribute(
      'href',
      '/funcionalidades/ia',
    )
  })

  it('renders all 4 additional modules', () => {
    render(<FeaturesPage />)
    expect(screen.getByRole('link', { name: /controle de estoque/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /crm de leads/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /whatsapp e notificações/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /controle fiscal/i })).toBeInTheDocument()
  })

  it('renders the plan comparison table with all 3 plan columns', () => {
    render(<FeaturesPage />)
    expect(screen.getByRole('heading', { name: /comparativo por plano/i })).toBeInTheDocument()
    expect(screen.getAllByText('Professional').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Popular').length).toBeGreaterThan(0)
  })

  it('renders a "Saiba mais" link for categories with a detail route', () => {
    render(<FeaturesPage />)
    expect(screen.getAllByText(/saiba mais →/i).length).toBeGreaterThan(0)
  })
})

describe('FeaturesPage — before the reveal animation runs', () => {
  it('renders the hero and closing CTA in their pre-reveal hidden state', () => {
    reveal.isVisible = false
    render(<FeaturesPage />)
    expect(document.querySelectorAll('.opacity-0').length).toBeGreaterThan(0)
  })
})
