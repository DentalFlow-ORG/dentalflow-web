import type { ReactNode } from 'react'

import { render, screen, userEvent } from '@/test/render-utils'

import { PricingSection } from '@/features/marketing/components/PricingSection'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
}))

vi.mock('@/features/marketing/hooks/useRevealOnScroll', () => ({
  useRevealOnScroll: () => ({ ref: { current: null }, isVisible: true }),
}))

const NOTE_TEXT = 'Plano anual sujeito à disponibilidade no momento da contratação.'

describe('PricingSection', () => {
  it('renders all three plan headings', () => {
    render(<PricingSection />)
    expect(screen.getByRole('heading', { name: 'Starter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Professional' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument()
  })

  it('shows the "Recomendado" badge on the Professional plan', () => {
    render(<PricingSection />)
    expect(screen.getByText('Recomendado')).toBeInTheDocument()
  })

  it('default billing period is annual and the availability note is not aria-hidden', () => {
    render(<PricingSection />)
    const note = screen.getByText(NOTE_TEXT)
    expect(note.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('hides the availability note with aria-hidden="true" after switching to monthly', async () => {
    const user = userEvent.setup()
    render(<PricingSection />)
    await user.click(screen.getByRole('radio', { name: /Mensal/ }))
    const note = screen.getByText(NOTE_TEXT)
    expect(note.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('shows annual pricing copy by default', () => {
    render(<PricingSection />)
    expect(screen.getAllByText(/cobrado anualmente/i)).toHaveLength(3)
  })

  it('shows monthly pricing copy after switching to monthly', async () => {
    const user = userEvent.setup()
    render(<PricingSection />)
    await user.click(screen.getByRole('radio', { name: /Mensal/ }))
    expect(screen.getAllByText(/Primeiro mês/i)).toHaveLength(3)
  })

  it('each plan has a "Começar agora" CTA link pointing to /acessar', () => {
    render(<PricingSection />)
    const ctaLinks = screen.getAllByRole('link', { name: /Começar agora/i })
    expect(ctaLinks).toHaveLength(3)
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/acessar')
    })
  })
})
