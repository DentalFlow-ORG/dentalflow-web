import { fireEvent } from '@testing-library/react'
import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import { AuthForm } from '@/features/auth/components/AuthForm'
import { mockNavigate } from '@/test/mocks/router'

let mockApiUrl = 'http://localhost:3000'

const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockShowAlert = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test/mocks/router')
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
      expect(
        screen.getByRole('link', { name: 'Esqueci minha senha' }),
      ).toBeInTheDocument()
    })

    it('does not show "Esqueci minha senha" link in register mode', () => {
      renderWithProviders(<AuthForm mode="register" />)
      expect(
        screen.queryByRole('link', { name: 'Esqueci minha senha' }),
      ).not.toBeInTheDocument()
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
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'warning' }),
      )
    })
  })
})
