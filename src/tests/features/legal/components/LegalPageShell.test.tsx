import { render, screen } from '@/test-utils/render-utils'

import { LegalPageShell } from '@/features/legal/components/LegalPageShell'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/layout/SiteFooter', () => ({
  SiteFooter: () => <footer>Mock footer</footer>,
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: () => {},
}))

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => <a href="/">DentalFlow</a>,
}))

describe('LegalPageShell', () => {
  it('renders children inside the main landmark', () => {
    render(<LegalPageShell><p>Conteúdo legal da página.</p></LegalPageShell>)
    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByText('Conteúdo legal da página.'))
  })

  it('renders the header landmark with aria-label="Cabeçalho"', () => {
    render(<LegalPageShell><span /></LegalPageShell>)
    expect(screen.getByRole('banner', { name: 'Cabeçalho' })).toBeInTheDocument()
  })

  it('renders the "Voltar ao início" link pointing to "/"', () => {
    render(<LegalPageShell><span /></LegalPageShell>)
    const link = screen.getByRole('link', { name: /Voltar ao início/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders the site footer', () => {
    render(<LegalPageShell><span /></LegalPageShell>)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('Mock footer')).toBeInTheDocument()
  })
})
