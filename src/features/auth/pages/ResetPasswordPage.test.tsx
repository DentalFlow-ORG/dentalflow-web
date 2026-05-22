import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import { ResetPasswordPage } from './ResetPasswordPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={String(to)}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useSearch: () => mockUseSearch(),
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: () => undefined,
}))

vi.mock('@/features/auth/components/AuthHeader', () => ({
  AuthHeader: () => <header data-testid="auth-header" />,
}))

const mockResetPassword = vi.fn()

vi.mock('@/features/auth/services/auth.service', () => ({
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
  getGoogleOAuthStartUrl: () => 'http://localhost:3000/auth/google',
}))

const mockUseSearch = vi.fn()

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResetPassword.mockResolvedValue({ message: 'ok' })
    mockUseSearch.mockReturnValue({ token: 'valid-token-123' })
  })

  it('renders heading and password input when token is present', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('heading', { name: 'Nova senha' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument()
  })

  it('shows invalid link message when token is missing', () => {
    mockUseSearch.mockReturnValue({ token: undefined })
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByText(/Link inválido ou expirado/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  })

  it('calls resetPassword with token and password on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nova senha'), 'NewStr0ng@Pass!')
    await user.click(screen.getByRole('button', { name: /Redefinir senha/i }))

    expect(mockResetPassword).toHaveBeenCalledWith('valid-token-123', 'NewStr0ng@Pass!')
  })

  it('shows success state after successful reset', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nova senha'), 'NewStr0ng@Pass!')
    await user.click(screen.getByRole('button', { name: /Redefinir senha/i }))

    expect(
      await screen.findByRole('heading', { name: 'Senha redefinida' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Redefinir senha/i })).not.toBeInTheDocument()
  })

  it('shows error message when reset fails', async () => {
    mockResetPassword.mockRejectedValue(new Error('Token expirado ou inválido.'))
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nova senha'), 'NewStr0ng@Pass!')
    await user.click(screen.getByRole('button', { name: /Redefinir senha/i }))

    expect(
      await screen.findByText('Token expirado ou inválido.'),
    ).toBeInTheDocument()
  })
})
