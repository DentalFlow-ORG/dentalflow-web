import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/theme/useForceLightTheme', () => ({ useForceLightTheme: () => {} }))
vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' as const, setTheme: vi.fn() }),
}))
vi.mock('@/features/privacy/components/CookieConsentContext', () => ({
  useCookieConsent: () => ({ openPreferences: vi.fn() }),
}))

import { roleContents } from '@/features/marketing/data/public-content'
import { RolePage } from '@/features/marketing/pages/RolePage'

describe('RolePage', () => {
  it('renders the standard-accent role (secretaria)', () => {
    render(<RolePage content={roleContents.secretaria} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      roleContents.secretaria.tagline,
    )
  })

  it('renders the navy-accent role (gestores)', () => {
    render(<RolePage content={roleContents.gestores} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      roleContents.gestores.tagline,
    )
  })

  it('renders the fresh-accent role (clinicas-em-abertura)', () => {
    render(<RolePage content={roleContents['clinicas-em-abertura']} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      roleContents['clinicas-em-abertura'].tagline,
    )
  })

  it('links the primary CTA to the register flow', () => {
    render(<RolePage content={roleContents.dentistas} />)
    const links = screen.getAllByRole('link', {
      name: new RegExp(roleContents.dentistas.cta, 'i'),
    })
    expect(links.some((link) => link.getAttribute('href') === '/acessar')).toBe(true)
  })
})
