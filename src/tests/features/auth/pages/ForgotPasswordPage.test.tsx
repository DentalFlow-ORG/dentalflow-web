import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
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

const mockForgotPassword = vi.fn()

vi.mock('@/features/auth/services/auth.service', () => ({
  forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
  getGoogleOAuthStartUrl: () => 'http://localhost:3000/auth/google',
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockForgotPassword.mockResolvedValue({ message: 'ok' })
  })

  it('renders heading and email input', () => {
    renderWithProviders(<ForgotPasswordPage />)
    expect(screen.getByRole('heading', { name: 'Recuperar senha' })).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail profissional')).toBeInTheDocument()
  })

  it('calls forgotPassword with normalised email on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('E-mail profissional'), '  Owner@Clinic.COM  ')
    await user.click(screen.getByRole('button', { name: /Enviar instruções/i }))

    expect(mockForgotPassword).toHaveBeenCalledWith('owner@clinic.com')
  })

  it('explains an invalid e-mail at the field instead of calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText('E-mail profissional'), 'owner@clinic')
    await user.click(screen.getByRole('button', { name: /Enviar instruções/i }))

    expect(screen.getByLabelText('E-mail profissional')).toHaveAccessibleDescription(
      'Informe um e-mail válido.',
    )
    expect(mockForgotPassword).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('E-mail profissional'), '.com')
    expect(screen.getByLabelText('E-mail profissional')).not.toHaveAttribute('aria-invalid')
  })

  it('rejects an empty e-mail with the same message', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />)
    await user.click(screen.getByRole('button', { name: /Enviar instruções/i }))
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(mockForgotPassword).not.toHaveBeenCalled()
  })

  it('shows success message after submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('E-mail profissional'), 'owner@clinic.com')
    await user.click(screen.getByRole('button', { name: /Enviar instruções/i }))

    expect(await screen.findByText(/Se este e-mail estiver cadastrado/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Enviar instruções/i })).not.toBeInTheDocument()
  })

  it('shows error message when request fails', async () => {
    mockForgotPassword.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('E-mail profissional'), 'owner@clinic.com')
    await user.click(screen.getByRole('button', { name: /Enviar instruções/i }))

    expect(await screen.findByText(/Não foi possível processar a solicitação/i)).toBeInTheDocument()
  })
})
