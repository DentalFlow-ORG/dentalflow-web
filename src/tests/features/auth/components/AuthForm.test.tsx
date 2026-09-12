import { AuthForm } from '@/features/auth/components/AuthForm'
import { ApiError } from '@/services/http'
import { mockNavigate } from '@/test-utils/mocks/router'
import { renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'
import { fireEvent } from '@testing-library/react'

let mockApiUrl = 'http://localhost:3000'

const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockShowAlert = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: vi.fn(),
    completeProfile: vi.fn(),
    user: null,
    isAuthenticated: false,
    isBootstrapping: false,
  }),
}))

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({
    showAlert: mockShowAlert,
    dismissAlert: vi.fn(),
  }),
}))

vi.mock('@/config/env', () => ({
  env: {
    get apiUrl() {
      return mockApiUrl
    },
  },
}))

vi.mock('@/features/auth/services/auth.service', () => ({
  getGoogleOAuthStartUrl: () => 'http://localhost:3000/auth/google',
}))

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockResolvedValue(undefined)
    mockRegister.mockResolvedValue(undefined)
    mockNavigate.mockResolvedValue(undefined)
    mockApiUrl = 'http://localhost:3000'
  })

  describe('login mode', () => {
    it('renders the login heading', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.getByRole('heading', { name: 'Entrar com segurança' })).toBeInTheDocument()
    })

    it('renders email and password fields', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.getByLabelText('E-mail profissional')).toBeInTheDocument()
      expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    })

    it('does not render clinic name or responsible fields', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.queryByLabelText('Nome da clínica')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Responsável')).not.toBeInTheDocument()
    })

    it('does not render the terms checkbox', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('renders the submit button with login label', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.getByRole('button', { name: /Entrar na plataforma/i })).toBeInTheDocument()
    })

    it('renders the Google login button', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.getByRole('button', { name: /Entrar com Google/i })).toBeInTheDocument()
    })
  })

  describe('register mode', () => {
    it('renders the register heading', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.getByRole('heading', { name: 'Criar conta da clínica' })).toBeInTheDocument()
    })

    it('renders all four registration fields', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.getByLabelText('Nome da clínica')).toBeInTheDocument()
      expect(screen.getByLabelText('Responsável')).toBeInTheDocument()
      expect(screen.getByLabelText('E-mail profissional')).toBeInTheDocument()
      expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    })

    it('renders the terms checkbox', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders the submit button with register label', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.getByRole('button', { name: /Criar acesso seguro/i })).toBeInTheDocument()
    })

    it('renders the Google register button', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.getByRole('button', { name: /Cadastrar com Google/i })).toBeInTheDocument()
    })
  })

  describe('register validation', () => {
    it('shows error when responsible name is a single word', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
      await user.type(screen.getByLabelText('Responsável'), 'Pedro')
      await user.type(screen.getByLabelText('E-mail profissional'), 'pedro@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      // Check terms so native constraint validation passes and handleSubmit runs
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Criar acesso seguro/i }))

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Informe nome e sobrenome do responsável.' }),
      )
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('shows error when terms checkbox is not accepted', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
      await user.type(screen.getByLabelText('Responsável'), 'Pedro Souza')
      await user.type(screen.getByLabelText('E-mail profissional'), 'pedro@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      // Skip checkbox — use fireEvent.submit to bypass native required validation
      // and exercise the JS validation path in handleSubmit
      fireEvent.submit(container.querySelector('form')!)

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          description:
            'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.',
        }),
      )
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  describe('successful submission', () => {
    async function fillRegister(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText('Nome da clínica'), '  Clínica Teste  ')
      await user.type(screen.getByLabelText('Responsável'), '  Pedro  Souza Lima  ')
      await user.type(screen.getByLabelText('E-mail profissional'), '  Pedro@Clinica.COM  ')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      await user.click(screen.getByRole('checkbox'))
    }

    it('logs in with a normalised e-mail and sends the user to the app', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('E-mail profissional'), '  Ana@Clinica.COM  ')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      await user.click(screen.getByRole('button', { name: /Entrar na plataforma/i }))

      expect(mockLogin).toHaveBeenCalledWith({ email: 'ana@clinica.com', password: 'senha123' })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Acesso liberado', tone: 'success' }),
      )
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app' })
    })

    it('registers with a split responsible name and accepted terms', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)
      await fillRegister(user)

      await user.click(screen.getByRole('button', { name: /Criar acesso seguro/i }))

      expect(mockRegister).toHaveBeenCalledWith({
        clinicName: 'Clínica Teste',
        firstName: 'Pedro',
        lastName: 'Souza Lima',
        email: 'pedro@clinica.com',
        password: 'senha123',
        acceptedTerms: true,
      })
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Conta criada', tone: 'success' }),
      )
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app' })
    })

    it('rejects a responsible name containing digits before calling the service', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
      await user.type(screen.getByLabelText('Responsável'), 'Pedro S0uza')
      await user.type(screen.getByLabelText('E-mail profissional'), 'pedro@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Criar acesso seguro/i }))

      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'O nome do responsável não pode conter números ou caracteres especiais.',
        }),
      )
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  describe('failed submission', () => {
    it('shows the API message and stays on the form when login is rejected', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValueOnce(new ApiError('E-mail ou senha inválidos.', 401, null))
      renderWithProviders(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('E-mail profissional'), 'ana@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'errada')
      await user.click(screen.getByRole('button', { name: /Entrar na plataforma/i }))

      expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument()
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Não foi possível entrar', tone: 'error' }),
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('reports a registration failure under the register title', async () => {
      const user = userEvent.setup()
      mockRegister.mockRejectedValueOnce(new Error('Este e-mail já está em uso.'))
      renderWithProviders(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
      await user.type(screen.getByLabelText('Responsável'), 'Pedro Souza')
      await user.type(screen.getByLabelText('E-mail profissional'), 'pedro@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /Criar acesso seguro/i }))

      expect(await screen.findByText('Este e-mail já está em uso.')).toBeInTheDocument()
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Não foi possível criar a conta', tone: 'error' }),
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('falls back to a generic message when the rejection is not an Error', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValueOnce('offline')
      renderWithProviders(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('E-mail profissional'), 'ana@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      await user.click(screen.getByRole('button', { name: /Entrar na plataforma/i }))

      expect(await screen.findByText('Não foi possível autenticar agora.')).toBeInTheDocument()
    })

    it('re-enables the submit button after a failure so the user can retry', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValueOnce(new Error('Falha temporária.'))
      renderWithProviders(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('E-mail profissional'), 'ana@clinica.com')
      await user.type(screen.getByLabelText('Senha'), 'senha123')
      const submit = screen.getByRole('button', { name: /Entrar na plataforma/i })
      await user.click(submit)

      await screen.findByText('Falha temporária.')
      expect(submit).toBeEnabled()

      await user.click(submit)
      expect(mockLogin).toHaveBeenCalledTimes(2)
    })
  })

  describe('Google sign-in feedback', () => {
    it.each([
      ['disabled', 'Login com Google indisponível no momento. Use e-mail e senha para continuar.'],
      [
        'error',
        'Não foi possível concluir o login com Google. Tente novamente ou use e-mail e senha.',
      ],
      ['cancelled', 'Login com Google cancelado. Você pode tentar novamente quando quiser.'],
    ] as const)('explains the %s outcome returned by the OAuth redirect', (status, message) => {
      renderWithProviders(<AuthForm mode="login" googleAuthStatus={status} />)
      expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('shows no OAuth feedback when the redirect reported nothing', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.queryByText(/Google/i, { selector: 'p' })).not.toBeInTheDocument()
    })
  })

  describe('PasswordRequirements', () => {
    it('shows requirements when password field is focused in register mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.click(screen.getByLabelText('Senha'))

      expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument()
    })

    it('updates requirement indicators while typing in register mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.click(screen.getByLabelText('Senha'))
      await user.type(screen.getByLabelText('Senha'), 'Abc1')

      expect(screen.getByText('Mínimo de 8 caracteres')).toBeInTheDocument()
      expect(screen.getByText('Letra maiúscula (A–Z)')).toBeInTheDocument()
      const icons = screen.getAllByRole('listitem')
      expect(icons.length).toBe(5)
    })

    it('hides requirements after blur when password field is empty in register mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.click(screen.getByLabelText('Senha'))
      expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument()

      await user.tab()
      expect(screen.queryByRole('list', { name: 'Requisitos de senha' })).not.toBeInTheDocument()
    })

    it('keeps requirements visible after blur when password has content in register mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="register" />)

      await user.type(screen.getByLabelText('Senha'), 'abc')
      await user.tab()

      expect(screen.getByRole('list', { name: 'Requisitos de senha' })).toBeInTheDocument()
    })

    it('does not show requirements in login mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="login" />)

      await user.click(screen.getByLabelText('Senha'))
      await user.type(screen.getByLabelText('Senha'), 'Test@1234')

      expect(screen.queryByRole('list', { name: 'Requisitos de senha' })).not.toBeInTheDocument()
    })
  })

  describe('forgot password link', () => {
    it('shows "Esqueci minha senha" link in login mode', () => {
      renderWithProviders(<AuthForm mode="login" />)
      expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toBeInTheDocument()
    })

    it('does not show "Esqueci minha senha" link in register mode', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(screen.queryByRole('link', { name: 'Esqueci minha senha' })).not.toBeInTheDocument()
    })
  })

  describe('Google OAuth', () => {
    it('calls window.location.assign with the OAuth URL', async () => {
      const assignSpy = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { assign: assignSpy },
        configurable: true,
        writable: true,
      })

      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="login" />)
      await user.click(screen.getByRole('button', { name: /Entrar com Google/i }))

      expect(assignSpy).toHaveBeenCalledWith('http://localhost:3000/auth/google')
    })

    it('shows a warning alert when apiUrl is not configured', async () => {
      mockApiUrl = ''
      const assignSpy = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { assign: assignSpy },
        configurable: true,
        writable: true,
      })

      const user = userEvent.setup()
      renderWithProviders(<AuthForm mode="login" />)
      await user.click(screen.getByRole('button', { name: /Entrar com Google/i }))

      expect(assignSpy).not.toHaveBeenCalled()
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'warning' }))
    })
  })
})
