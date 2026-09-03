import { createElement } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthContext } from '@/features/auth/providers/auth-context'
import { renderHook } from '@/test-utils/render-utils'

describe('useAuth', () => {
  it('throws when used outside an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth deve ser usado dentro de AuthProvider.',
    )
  })

  it('returns the context value when inside a provider', () => {
    const value = {
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
      login: vi.fn(),
      register: vi.fn(),
      completeProfile: vi.fn(),
      logout: vi.fn(),
    }
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(AuthContext.Provider, { value }, children)

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toBe(value)
  })
})
