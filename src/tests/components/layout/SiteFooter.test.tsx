import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockOpenPreferences = vi.fn()
vi.mock('@/features/privacy/components/CookieConsentContext', () => ({
  useCookieConsent: () => ({ openPreferences: mockOpenPreferences }),
}))

import { SiteFooter } from '@/components/layout/SiteFooter'

describe('SiteFooter', () => {
  beforeEach(() => {
    mockOpenPreferences.mockClear()
  })

  it('renders the trade name and current year copyright', () => {
    render(<SiteFooter />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument()
  })

  it('renders navigation links for Produto, Recursos and Legal columns', () => {
    render(<SiteFooter />)
    expect(screen.getByRole('link', { name: /funcionalidades/i })).toHaveAttribute(
      'href',
      '/funcionalidades',
    )
    expect(screen.getByRole('link', { name: /agenda inteligente/i })).toHaveAttribute(
      'href',
      '/funcionalidades/agenda',
    )
    expect(screen.getByRole('link', { name: /termos de uso/i })).toHaveAttribute(
      'href',
      '/termos-de-uso',
    )
  })

  it('renders a mailto support link', () => {
    render(<SiteFooter />)
    const link = screen.getByRole('link', { name: /contato@dentalflow\.com\.br/i })
    expect(link).toHaveAttribute('href', 'mailto:contato@dentalflow.com.br')
  })

  it('renders the YouTube social link when configured', () => {
    render(<SiteFooter />)
    expect(screen.getByRole('link', { name: /dentalflow no youtube/i })).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  it('opens cookie preferences when the button is clicked', async () => {
    render(<SiteFooter />)
    await userEvent.click(screen.getByRole('button', { name: /política de cookies/i }))
    expect(mockOpenPreferences).toHaveBeenCalledOnce()
  })
})
