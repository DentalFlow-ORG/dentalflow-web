import { act } from '@testing-library/react'

import { render, renderHook, screen, waitFor } from '@/test-utils/render-utils'

const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockCompleteProfile = vi.fn()
const mockRefresh = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/features/auth/services/auth.service', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  register: (...args: unknown[]) => mockRegister(...args),
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  completeProfile: (...args: unknown[]) => mockCompleteProfile(...args),
  refresh: (...args: unknown[]) => mockRefresh(...args),
  logout: (...args: unknown[]) => mockLogout(...args),
}))

const mockClearBillingStatusCache = vi.fn()
vi.mock('@/features/billing/services/billing-status-cache', () => ({
  clearBillingStatusCache: () => mockClearBillingStatusCache(),
}))

const mockSetupAuthRefresh = vi.fn()
vi.mock('@/services/http', () => ({
  setupAuthRefresh: (...args: unknown[]) => mockSetupAuthRefresh(...args),
}))

import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthProvider } from '@/features/auth/providers/AuthProvider'
import { clearSession, hasStoredSession } from '@/features/auth/utils/session-storage'

const originalLocation = window.location

function Consumer() {
  const { user, isAuthenticated, isBootstrapping } = useAuth()
  return (
    <div>
      <span data-testid="bootstrapping">{String(isBootstrapping)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.id ?? 'none'}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearSession()
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, replace: vi.fn() },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
      writable: true,
    })
  })

  it('finishes bootstrapping immediately with no user when there is no stored session', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('restores the session on mount when a stored session exists', async () => {
    localStorage.setItem('dentalflow.activeSession', '1')
    mockRefresh.mockResolvedValue({ accessToken: 'token-1' })
    mockGetCurrentUser.mockResolvedValue({ id: 'u1', firstName: 'Ana' })

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('u1')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
  })

  it('clears the session and stays unauthenticated when restoring fails', async () => {
    localStorage.setItem('dentalflow.activeSession', '1')
    mockRefresh.mockRejectedValue(new Error('expired'))

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(hasStoredSession()).toBe(false)
  })

  it('registers the http refresh config on mount', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(mockSetupAuthRefresh).toHaveBeenCalledOnce())
    const config = mockSetupAuthRefresh.mock.calls[0][0]
    expect(typeof config.refreshTokens).toBe('function')
    expect(typeof config.onTokenRefreshed).toBe('function')
    expect(typeof config.onRefreshFailed).toBe('function')
  })

  it('onRefreshFailed clears the session and redirects to /acessar', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(mockSetupAuthRefresh).toHaveBeenCalledOnce())
    const config = mockSetupAuthRefresh.mock.calls[0][0]

    act(() => config.onRefreshFailed())

    expect(hasStoredSession()).toBe(false)
    expect(window.location.replace).toHaveBeenCalledWith('/acessar')
  })

  it('login sets the session and user', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'token-1', user: { id: 'u1' } })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'x' })
    })

    expect(result.current.user).toEqual({ id: 'u1' })
    expect(result.current.isAuthenticated).toBe(true)
    expect(hasStoredSession()).toBe(true)
  })

  it('register sets the session and user', async () => {
    mockRegister.mockResolvedValue({ accessToken: 'token-1', user: { id: 'u2' } })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.register({
        email: 'a@b.com',
        password: 'x',
        firstName: 'A',
        lastName: 'B',
      } as never)
    })

    expect(result.current.user).toEqual({ id: 'u2' })
  })

  it('completeProfile sets the session and user', async () => {
    mockCompleteProfile.mockResolvedValue({ accessToken: 'token-1', user: { id: 'u3' } })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.completeProfile({ clinicName: 'Clínica' } as never)
    })

    expect(result.current.user).toEqual({ id: 'u3' })
  })

  it('logout clears the session and user even when the request fails', async () => {
    mockLogin.mockResolvedValue({ accessToken: 'token-1', user: { id: 'u1' } })
    mockLogout.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'x' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    // logout() only try/finally-wraps the request — a failure still propagates
    // after cleanup runs, so the caller must handle the rejection.
    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow('network')
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockClearBillingStatusCache).toHaveBeenCalled()
    expect(hasStoredSession()).toBe(false)
  })
})
