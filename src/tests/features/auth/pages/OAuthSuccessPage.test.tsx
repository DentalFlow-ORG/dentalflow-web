import { render, screen } from '@/test-utils/render-utils'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return { ...m.createRouterMock(), useNavigate: () => mockNavigate }
})

vi.mock('@/components/common/BrandLogo', () => ({
  BrandLogo: () => <img alt="logo" />,
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: vi.fn(),
}))

const mockUseAuth = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

import { OAuthSuccessPage } from '@/features/auth/pages/OAuthSuccessPage'

describe('OAuthSuccessPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('shows the validating-access loading state while bootstrapping', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isBootstrapping: true })
    render(<OAuthSuccessPage />)
    expect(screen.getByText('Validando acesso')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirects to /acessar when not authenticated after bootstrapping', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isBootstrapping: false })
    render(<OAuthSuccessPage />)
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/acessar')
  })

  it('navigates to /app when authenticated with a complete profile', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', isProfileComplete: true },
      isAuthenticated: true,
      isBootstrapping: false,
    })
    render(<OAuthSuccessPage />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/app', replace: true })
  })

  it('navigates to complete-profile when the profile is incomplete', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', isProfileComplete: false },
      isAuthenticated: true,
      isBootstrapping: false,
    })
    render(<OAuthSuccessPage />)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/acessar/completar-perfil',
      replace: true,
    })
  })

  it('does not navigate while bootstrapping even if authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', isProfileComplete: true },
      isAuthenticated: true,
      isBootstrapping: true,
    })
    render(<OAuthSuccessPage />)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
