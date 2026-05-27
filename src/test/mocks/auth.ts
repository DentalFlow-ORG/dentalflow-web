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

export const setMockAuthState = (patch: Partial<AuthMockState>): void => {
  Object.assign(_authState, patch)
}

export const resetAuthMocks = (): void => {
  _authState.user = null
  _authState.isAuthenticated = false
  _authState.isBootstrapping = false
}

export function createUseAuthMock() {
  return {
    useAuth: () => ({
      user: _authState.user,
      isAuthenticated: _authState.isAuthenticated,
      isBootstrapping: _authState.isBootstrapping,
      login: vi.fn(),
      register: vi.fn(),
      completeProfile: vi.fn(),
      logout: vi.fn(),
    }),
  }
}
