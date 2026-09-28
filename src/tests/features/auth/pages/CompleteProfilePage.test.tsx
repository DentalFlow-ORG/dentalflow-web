import { CompleteProfilePage } from '@/features/auth/pages/CompleteProfilePage'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { mockCompleteProfile, resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks } from '@/test-utils/mocks/router'
import { renderWithProviders, screen, userEvent, waitFor } from '@/test-utils/render-utils'
import { fireEvent } from '@testing-library/react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({
    showAlert: mockShowAlert,
    dismissAlert: vi.fn(),
  }),
}))

vi.mock('@/features/theme/useForceLightTheme', () => ({
  useForceLightTheme: vi.fn(),
}))

// BrandLink → BrandLogo → useTheme() requires ThemeProvider, which is not in
// TestProviders. Mock it as a no-op to keep the test focused on page behavior.
vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => null,
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const incompleteUser = makeOwnerUser({
  isProfileComplete: false,
  firstName: 'Test',
  lastName: 'User',
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetAuthMocks()
  resetRouterMocks()
  mockShowAlert.mockReset()
  mockCompleteProfile.mockResolvedValue(undefined)
  mockNavigate.mockResolvedValue(undefined)
  setMockAuthState({ isBootstrapping: false, isAuthenticated: true, user: incompleteUser })
})

// ── Redirects ─────────────────────────────────────────────────────────────────

describe('redirects', () => {
  it('shows a loading screen while auth is bootstrapping', () => {
    setMockAuthState({ isBootstrapping: true })
    renderWithProviders(<CompleteProfilePage />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Complete seu acesso DentalFlow' }),
    ).not.toBeInTheDocument()
  })

  it('redirects to /acessar when the user is not authenticated', () => {
    setMockAuthState({ isAuthenticated: false, user: null })
    renderWithProviders(<CompleteProfilePage />)
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/acessar')
  })

  it('redirects to /app when the profile is already complete', () => {
    setMockAuthState({ user: makeOwnerUser({ isProfileComplete: true }) })
    renderWithProviders(<CompleteProfilePage />)
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/app')
  })
})

// ── Form rendering ────────────────────────────────────────────────────────────

describe('form rendering', () => {
  it('renders the main heading and required fields', () => {
    renderWithProviders(<CompleteProfilePage />)
    expect(
      screen.getByRole('heading', { name: 'Complete seu acesso DentalFlow' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome da clínica')).toBeInTheDocument()
    expect(screen.getByLabelText('Responsável')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('pre-fills the responsible name from the authenticated user', () => {
    renderWithProviders(<CompleteProfilePage />)
    expect(screen.getByLabelText('Responsável')).toHaveValue('Test User')
  })
})

// ── Validation ────────────────────────────────────────────────────────────────

describe('form validation', () => {
  it('shows an inline error when the responsible name has only one word', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    const responsibleInput = screen.getByLabelText('Responsável')
    await user.clear(responsibleInput)
    await user.type(responsibleInput, 'Pedro')
    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    expect(screen.getByText('Informe nome e sobrenome do responsável.')).toBeInTheDocument()
    expect(mockCompleteProfile).not.toHaveBeenCalled()
  })

  it('leaves the responsible name empty when the user has no stored name parts', () => {
    setMockAuthState({
      isBootstrapping: false,
      isAuthenticated: true,
      user: makeOwnerUser({ isProfileComplete: false, firstName: undefined, lastName: undefined }),
    })
    renderWithProviders(<CompleteProfilePage />)
    expect(screen.getByLabelText('Responsável')).toHaveValue('')
  })

  it('shows an inline error when the clinic name is too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'C')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    expect(screen.getByText('Informe o nome da clínica.')).toBeInTheDocument()
    expect(mockCompleteProfile).not.toHaveBeenCalled()
  })

  it('shows an inline error when terms are not accepted', () => {
    // fireEvent.submit bypasses native checkbox required — exercises the JS guard
    const { container } = renderWithProviders(<CompleteProfilePage />)
    fireEvent.change(screen.getByLabelText('Nome da clínica'), {
      target: { value: 'Clínica Teste' },
    })
    fireEvent.submit(container.querySelector('form')!)

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.',
    )
    expect(mockCompleteProfile).not.toHaveBeenCalled()
  })

  it('explains invalid characters instead of asking for a surname', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)
    const responsibleInput = screen.getByLabelText('Responsável')
    await user.clear(responsibleInput)
    await user.type(responsibleInput, 'Pedro S0uza')
    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    expect(responsibleInput).toHaveAccessibleDescription(
      'O nome do responsável não pode conter números ou caracteres especiais.',
    )
    expect(mockCompleteProfile).not.toHaveBeenCalled()
  })

  it('rejects clinic name characters the API refuses', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)
    await user.type(screen.getByLabelText('Nome da clínica'), 'Sorriso & Cia')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    expect(screen.getByLabelText('Nome da clínica')).toHaveAccessibleDescription(
      'O nome da clínica deve conter apenas letras, números, espaços, apóstrofos, pontos e hífens.',
    )
    expect(mockCompleteProfile).not.toHaveBeenCalled()
  })

  it('clears a field error as soon as the field is edited', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)
    await user.type(screen.getByLabelText('Nome da clínica'), 'C')
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))
    expect(screen.getByLabelText('Nome da clínica')).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText('Nome da clínica'), 'línica')
    expect(screen.getByLabelText('Nome da clínica')).not.toHaveAttribute('aria-invalid')
  })
})

// ── Submit behavior ───────────────────────────────────────────────────────────

describe('submit behavior', () => {
  it('calls completeProfile with the correct payload on a valid submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    await waitFor(() =>
      expect(mockCompleteProfile).toHaveBeenCalledWith({
        clinicName: 'Clínica Teste',
        firstName: 'Test',
        lastName: 'User',
        acceptedTerms: true,
      }),
    )
  })

  it('disables the submit button and shows loading text while the request is in flight', async () => {
    mockCompleteProfile.mockReturnValue(new Promise(() => {})) // Never resolves
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    // fireEvent to kick off submit without awaiting the async handler
    fireEvent.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /Concluindo/i })).toBeDisabled())
  })

  it('shows a success alert and navigates to /app after successful completion', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }))
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app', replace: true })
    })
  })

  it('shows an inline error and error alert when completeProfile rejects', async () => {
    mockCompleteProfile.mockRejectedValue(new Error('Servidor indisponível'))
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    await waitFor(() => expect(screen.getByText('Servidor indisponível')).toBeInTheDocument())
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))
  })
})

// ── Non-Error rejection ───────────────────────────────────────────────────────

describe('unexpected rejection', () => {
  it('falls back to a generic message when completeProfile rejects with a non-Error', async () => {
    mockCompleteProfile.mockRejectedValueOnce('offline')
    const user = userEvent.setup()
    renderWithProviders(<CompleteProfilePage />)

    await user.type(screen.getByLabelText('Nome da clínica'), 'Clínica Teste')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /Concluir cadastro/i }))

    expect(await screen.findByText('Não foi possível concluir o perfil agora.')).toBeInTheDocument()
  })
})
