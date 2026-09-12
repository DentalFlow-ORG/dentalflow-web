import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { setMockSearch } from '@/test-utils/mocks/router'
import { renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

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

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResetPassword.mockResolvedValue({ message: 'ok' })
    setMockSearch({ token: 'valid-token-123' })
  })

  it('renders heading and password input when token is present', () => {
    renderWithProviders(<ResetPasswordPage />)
    expect(screen.getByRole('heading', { name: 'Nova senha' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument()
  })

  it('shows invalid link message when token is missing', () => {
    setMockSearch({ token: undefined })
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

    expect(await screen.findByRole('heading', { name: 'Senha redefinida' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Redefinir senha/i })).not.toBeInTheDocument()
  })

  it('shows error message when reset fails', async () => {
    mockResetPassword.mockRejectedValue(new Error('Token expirado ou inválido.'))
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nova senha'), 'NewStr0ng@Pass!')
    await user.click(screen.getByRole('button', { name: /Redefinir senha/i }))

    expect(await screen.findByText('Token expirado ou inválido.')).toBeInTheDocument()
  })

  it('falls back to a generic message when the reset rejects with a non-Error', async () => {
    mockResetPassword.mockRejectedValue('offline')
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nova senha'), 'NewStr0ng@Pass!')
    await user.click(screen.getByRole('button', { name: /Redefinir senha/i }))

    expect(
      await screen.findByText('Não foi possível redefinir a senha. Tente novamente.'),
    ).toBeInTheDocument()
  })

  describe('PasswordRequirements', () => {
    it('shows requirements when password field is focused', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ResetPasswordPage />)

      await user.click(screen.getByLabelText('Nova senha'))

      expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument()
    })

    it('marks met requirements as typing progresses', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ResetPasswordPage />)

      await user.type(screen.getByLabelText('Nova senha'), 'Abcdefg1@')

      const items = screen.getAllByRole('listitem')
      expect(items.length).toBe(5)
      expect(screen.getByText('Mínimo de 8 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Letra maiúscula (A–Z)')).toBeInTheDocument()
      expect(screen.getByText('Letra minúscula (a–z)')).toBeInTheDocument()
      expect(screen.getByText('Número (0–9)')).toBeInTheDocument()
      expect(screen.getByText('Caractere especial (!@#$…)')).toBeInTheDocument()
    })
  })
})
