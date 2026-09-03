import { createElement } from 'react'

import { ThemeContext } from '@/features/theme/ThemeContext'
import { useTheme } from '@/features/theme/useTheme'
import { renderHook } from '@/test-utils/render-utils'

describe('useTheme', () => {
  it('throws when used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used inside ThemeProvider')
  })

  it('returns the context value when inside a provider', () => {
    const setTheme = vi.fn()
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(ThemeContext.Provider, { value: { theme: 'dark', setTheme } }, children)

    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
    expect(result.current.setTheme).toBe(setTheme)
  })
})
