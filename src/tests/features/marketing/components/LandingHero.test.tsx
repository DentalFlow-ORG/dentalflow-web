import { LazyMotion, domAnimation } from 'motion/react'
import type { ReactElement } from 'react'

import { render, screen } from '@/test-utils/render-utils'

import { LandingHero } from '@/features/marketing/components/landing/LandingHero'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

function renderHero(ui: ReactElement = <LandingHero />) {
  return render(<LazyMotion features={domAnimation}>{ui}</LazyMotion>)
}

describe('LandingHero', () => {
  it('renders a single primary h1 heading', () => {
    renderHero()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/operação previsível/i)
  })

  it('renders the MacBook product proof image', () => {
    renderHero()
    expect(screen.getByAltText(/MacBook/i)).toBeInTheDocument()
  })

  it('renders the primary trial CTA pointing to the register flow', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: /iniciar teste grátis/i })
    expect(cta).toHaveAttribute('href', '/acessar')
  })

  it('renders the secondary CTA pointing to the features page', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: /ver funcionalidades/i })
    expect(cta).toHaveAttribute('href', '/funcionalidades')
  })

  it('still renders the heading when prefers-reduced-motion is set', () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    try {
      renderHero()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /iniciar teste grátis/i })).toBeInTheDocument()
    } finally {
      window.matchMedia = original
    }
  })
})
