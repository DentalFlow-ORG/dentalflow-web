import { render, screen } from '@/test-utils/render-utils'

const mockUseSearch = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockUseSearch(),
}))

vi.mock('@/features/auth/pages/AuthPage', () => ({
  AuthPage: ({ mode, googleAuthStatus }: { mode: string; googleAuthStatus?: string }) => (
    <div data-testid="auth-page">
      mode:{mode} status:{googleAuthStatus ?? 'none'}
    </div>
  ),
}))

import { AuthRoutePage } from '@/features/auth/pages/AuthRoutePage'

describe('AuthRoutePage', () => {
  it('passes the mode and googleAuth search params to AuthPage', () => {
    mockUseSearch.mockReturnValue({ mode: 'register', googleAuth: 'error' })
    render(<AuthRoutePage />)
    expect(screen.getByTestId('auth-page')).toHaveTextContent('mode:register status:error')
  })

  it('renders without a googleAuth status', () => {
    mockUseSearch.mockReturnValue({ mode: 'login', googleAuth: undefined })
    render(<AuthRoutePage />)
    expect(screen.getByTestId('auth-page')).toHaveTextContent('mode:login status:none')
  })
})
