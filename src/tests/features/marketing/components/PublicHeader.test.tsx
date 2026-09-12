import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => <div data-testid="brand-link" />,
}))

import { PublicHeader } from '@/features/marketing/components/PublicHeader'

describe('PublicHeader', () => {
  it('renders the desktop nav dropdown triggers and "Planos" link', () => {
    render(<PublicHeader />)
    expect(screen.getByRole('button', { name: /produto/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /funcionalidades/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Planos' })).toHaveAttribute('href', '/planos')
  })

  it('renders Entrar and Testar grátis links', () => {
    render(<PublicHeader />)
    expect(screen.getAllByRole('link', { name: /entrar/i })[0]).toHaveAttribute('href', '/acessar')
    expect(screen.getAllByRole('link', { name: /testar grátis/i })[0]).toHaveAttribute(
      'href',
      '/acessar',
    )
  })

  it('does not show a dropdown menu until its trigger is clicked', () => {
    render(<PublicHeader />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the "Produto" dropdown menu on click and lists its items', async () => {
    render(<PublicHeader />)
    await userEvent.click(screen.getByRole('button', { name: /produto/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /para dentistas/i })).toHaveAttribute(
      'href',
      '/para-dentistas',
    )
  })

  it('toggles the same dropdown closed when its trigger is clicked again', async () => {
    render(<PublicHeader />)
    const trigger = screen.getByRole('button', { name: /produto/i })
    await userEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('switches to the other dropdown when a different trigger is clicked', async () => {
    render(<PublicHeader />)
    await userEvent.click(screen.getByRole('button', { name: /produto/i }))
    expect(screen.getByRole('menuitem', { name: /para dentistas/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /funcionalidades/i }))
    expect(screen.queryByRole('menuitem', { name: /para dentistas/i })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /agenda inteligente/i })).toBeInTheDocument()
  })

  it('closes the dropdown when a menu item is clicked', async () => {
    render(<PublicHeader />)
    await userEvent.click(screen.getByRole('button', { name: /produto/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /para dentistas/i }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows the mobile menu toggle and opens the mobile menu on click', async () => {
    render(<PublicHeader />)
    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('navigation', { name: 'Menu mobile' })).toBeInTheDocument()
  })

  it('expands a mobile accordion section and lists its items', async () => {
    render(<PublicHeader />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    const sectionButtons = screen.getAllByRole('button', { name: /produto/i })
    const mobileSectionButton = sectionButtons[sectionButtons.length - 1]
    await userEvent.click(mobileSectionButton)

    expect(screen.getAllByRole('link', { name: /para dentistas/i }).length).toBeGreaterThan(0)
  })

  it('closes the mobile menu when the mobile "Entrar" link is clicked', async () => {
    render(<PublicHeader />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const entrarLinks = screen.getAllByRole('link', { name: /entrar/i })
    await userEvent.click(entrarLinks[entrarLinks.length - 1])
    expect(screen.queryByRole('navigation', { name: 'Menu mobile' })).not.toBeInTheDocument()
  })

  it('applies dark-hero styling when isDarkHero is true', () => {
    const { container } = render(<PublicHeader isDarkHero />)
    expect(container.querySelector('header')).toHaveClass('bg-slate-950/70')
  })

  it('applies scrolled styling when isScrolled is true and not dark hero', () => {
    const { container } = render(<PublicHeader isScrolled />)
    expect(container.querySelector('header')).toHaveClass('bg-white/95')
  })
  it('highlights an open dropdown trigger differently on a dark hero', async () => {
    render(<PublicHeader isDarkHero />)
    const trigger = screen.getByRole('button', { name: /produto/i })
    expect(trigger).toHaveClass('text-white/80')
    await userEvent.click(trigger)
    expect(trigger).toHaveClass('bg-white/15', 'text-white')
    expect(trigger).not.toHaveClass('bg-slate-100')
  })

  it('highlights an open dropdown trigger with the light styling off a dark hero', async () => {
    render(<PublicHeader />)
    const trigger = screen.getByRole('button', { name: /produto/i })
    await userEvent.click(trigger)
    expect(trigger).toHaveClass('bg-slate-100', 'text-primary')
  })
})
