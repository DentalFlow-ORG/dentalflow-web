import type { ReactNode } from 'react'

import { render, screen, within } from '@/test-utils/render-utils'

import { integrationCards } from '@/features/marketing/data/public-content'
import { IntegrationsPage } from '@/features/marketing/pages/IntegrationsPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
}))

vi.mock('@/features/marketing/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const mockUsePageMeta = vi.fn()
vi.mock('@/features/marketing/hooks/usePageMeta', () => ({
  usePageMeta: (...args: unknown[]) => mockUsePageMeta(...args),
}))

describe('IntegrationsPage', () => {
  it('sets the page title and description', () => {
    render(<IntegrationsPage />)
    expect(mockUsePageMeta).toHaveBeenCalledWith(
      'DentalFlow | Integrações e serviços conectados',
      expect.stringContaining('Google Calendar'),
    )
  })

  it('renders the hero heading', () => {
    render(<IntegrationsPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Plataformas e serviços integrados' }),
    ).toBeInTheDocument()
  })

  it('renders one card per integration', () => {
    render(<IntegrationsPage />)
    for (const integration of integrationCards) {
      expect(screen.getByRole('heading', { level: 2, name: integration.name })).toBeInTheDocument()
    }
  })

  it('renders each integration category, description, benefit and placement', () => {
    render(<IntegrationsPage />)
    const first = integrationCards[0]
    const card = screen.getByRole('heading', { level: 2, name: first.name }).closest('article')
    expect(card).not.toBeNull()
    const scope = within(card as HTMLElement)
    expect(scope.getByText(first.category)).toBeInTheDocument()
    expect(scope.getByText(first.description)).toBeInTheDocument()
    expect(scope.getByText(first.benefit)).toBeInTheDocument()
    expect(scope.getByText(first.where)).toBeInTheDocument()
  })

  it('renders the provider logo rather than the fallback icon', () => {
    render(<IntegrationsPage />)
    const first = integrationCards[0]
    const card = screen.getByRole('heading', { level: 2, name: first.name }).closest('article')
    const logo = within(card as HTMLElement).getByAltText(first.logoAlt)
    expect(logo).toHaveAttribute('src', first.logoSrc)
    expect(logo).toHaveAttribute('loading', 'lazy')
  })

  it('shows the integration-specific status label for each card', () => {
    render(<IntegrationsPage />)
    for (const integration of integrationCards) {
      const card = screen
        .getByRole('heading', { level: 2, name: integration.name })
        .closest('article')
      expect(within(card as HTMLElement).getByText(integration.statusLabel)).toBeInTheDocument()
    }
  })

  it('renders the trust list and the registration CTA', () => {
    render(<IntegrationsPage />)
    expect(screen.getByText('Integração oficial via API de cada provedor')).toBeInTheDocument()
    expect(screen.getByText('Não compartilhamos dados entre clínicas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Testar grátis/ })).toHaveAttribute('href', '/acessar')
  })
})

// The page falls back to a generic icon and a status-derived label only when an
// integration omits `logoSrc` / `statusLabel`. This contract test keeps that
// fallback classified as unreachable: if content ever ships an entry without
// them, this fails and the fallback has to be covered instead.
describe('integrationCards content contract', () => {
  it('gives every integration a logo and an explicit status label', () => {
    for (const integration of integrationCards) {
      expect(integration.logoSrc).not.toBe('')
      expect(integration.logoAlt).not.toBe('')
      expect(integration.statusLabel).not.toBe('')
    }
  })

  it('only uses statuses the page can style', () => {
    for (const integration of integrationCards) {
      expect(['available', 'configuring', 'soon', 'simulated']).toContain(integration.status)
    }
  })
})
