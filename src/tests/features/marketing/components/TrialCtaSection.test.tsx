import type { ReactNode } from 'react'

import { render, screen } from '@/test-utils/render-utils'

import { TrialCtaSection } from '@/features/marketing/components/TrialCtaSection'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
  }: {
    children: ReactNode
    to: string
    search?: Record<string, string>
  }) => (
    <a href={String(to)} data-search={JSON.stringify(search ?? {})}>
      {children}
    </a>
  ),
}))

// Reveal and MagneticButton wrap the section in scroll/pointer animation that
// jsdom cannot drive; their own behavior is covered by their own suites.
vi.mock('@/features/marketing/components/landing/Reveal', () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/features/marketing/components/landing/MagneticButton', () => ({
  MagneticButton: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('TrialCtaSection', () => {
  it('renders the closing headline', () => {
    render(<TrialCtaSection />)
    expect(
      screen.getByRole('heading', {
        name: 'Sua clínica mais organizada, lucrativa e previsível começa hoje.',
      }),
    ).toBeInTheDocument()
  })

  it('renders all three trust signals', () => {
    render(<TrialCtaSection />)
    expect(screen.getByText('7 dias grátis')).toBeInTheDocument()
    expect(screen.getByText('Sem cartão de crédito')).toBeInTheDocument()
    expect(screen.getByText('Cancele quando quiser')).toBeInTheDocument()
  })

  it('sends the primary CTA to registration', () => {
    render(<TrialCtaSection />)
    const cta = screen.getByRole('link', { name: /Iniciar teste grátis/ })
    expect(cta).toHaveAttribute('href', '/acessar')
    expect(cta).toHaveAttribute('data-search', JSON.stringify({ mode: 'register' }))
  })

  it('sends the secondary CTA to the plans anchor', () => {
    render(<TrialCtaSection />)
    expect(screen.getByRole('link', { name: 'Ver planos' })).toHaveAttribute('href', '#planos')
  })

  it('states that migration and onboarding support are included', () => {
    render(<TrialCtaSection />)
    expect(
      screen.getByText(/Migração dos seus dados e suporte na implantação inclusos/),
    ).toBeInTheDocument()
  })
})
