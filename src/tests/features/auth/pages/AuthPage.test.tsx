import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/components/common/BrandLogo', () => ({
  BrandLogo: () => <img alt="logo" />,
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: vi.fn(),
}))

let mockIsBannerVisible = false
vi.mock('@/features/privacy/components/CookieConsentContext', () => ({
  useCookieConsent: () => ({ isBannerVisible: mockIsBannerVisible, openPreferences: vi.fn() }),
}))

vi.mock('@/features/auth/components/AuthForm', () => ({
  AuthForm: ({ mode }: { mode: string }) => <div data-testid="auth-form">mode:{mode}</div>,
}))

import { AuthPage } from '@/features/auth/pages/AuthPage'

describe('AuthPage', () => {
  beforeEach(() => {
    mockIsBannerVisible = false
  })

  it('renders the header, info panel, tabs, and form for login mode', () => {
    render(<AuthPage mode="login" />)
    expect(screen.getByText('DentalFlow')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toHaveTextContent('mode:login')
  })

  it('renders for register mode', () => {
    render(<AuthPage mode="register" />)
    expect(screen.getByTestId('auth-form')).toHaveTextContent('mode:register')
  })

  it('applies extra bottom padding when the cookie banner is visible', () => {
    mockIsBannerVisible = true
    const { container } = render(<AuthPage mode="login" />)
    expect(container.querySelector('section')).toHaveClass('pb-64')
  })

  it('applies default bottom padding when the cookie banner is not visible', () => {
    mockIsBannerVisible = false
    const { container } = render(<AuthPage mode="login" />)
    expect(container.querySelector('section')).toHaveClass('pb-10')
  })
})
