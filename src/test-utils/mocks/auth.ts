import type { AuthUser } from '@/features/auth/types'

interface AuthMockState {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
}

const _authState: AuthMockState = {
  user: null,
  isAuthenticated: false,
  isBootstrapping: false,
}

const mockLogin = vi.fn()
const mockRegister = vi.fn()
export const mockCompleteProfile = vi.fn()
export const mockLogout = vi.fn()

export const setMockAuthState = (patch: Partial<AuthMockState>): void => {
  Object.assign(_authState, patch)
}

export const resetAuthMocks = (): void => {
  _authState.user = null
  _authState.isAuthenticated = false
  _authState.isBootstrapping = false
  mockLogin.mockReset()
  mockRegister.mockReset()
  mockCompleteProfile.mockReset()
  mockLogout.mockReset()
}

export function createUseAuthMock() {
  return {
    useAuth: () => ({
      user: _authState.user,
      isAuthenticated: _authState.isAuthenticated,
      isBootstrapping: _authState.isBootstrapping,
      login: mockLogin,
      register: mockRegister,
      completeProfile: mockCompleteProfile,
      logout: mockLogout,
    }),
  }
}
