import { act, renderHook } from '@/test/render-utils'

import { useDropdownNav } from './useDropdownNav'

describe('useDropdownNav — initial state', () => {
  it('has no active dropdown', () => {
    const { result } = renderHook(() => useDropdownNav())
    expect(result.current.openDropdown).toBeNull()
  })

  it('has mobile menu closed', () => {
    const { result } = renderHook(() => useDropdownNav())
    expect(result.current.isMobileOpen).toBe(false)
  })

  it('has no expanded mobile sections', () => {
    const { result } = renderHook(() => useDropdownNav())
    expect(result.current.mobileExpanded).toEqual([])
  })
})

describe('useDropdownNav — toggleDropdown', () => {
  it('opens a dropdown', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleDropdown('produto') })
    expect(result.current.openDropdown).toBe('produto')
  })

  it('closes the same dropdown when toggled again', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleDropdown('produto') })
    act(() => { result.current.toggleDropdown('produto') })
    expect(result.current.openDropdown).toBeNull()
  })

  it('replaces the active dropdown when a different one is toggled', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleDropdown('produto') })
    act(() => { result.current.toggleDropdown('funcionalidades') })
    expect(result.current.openDropdown).toBe('funcionalidades')
  })
})

describe('useDropdownNav — closeDropdown', () => {
  it('sets openDropdown to null', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleDropdown('produto') })
    act(() => { result.current.closeDropdown() })
    expect(result.current.openDropdown).toBeNull()
  })
})

describe('useDropdownNav — toggleMobile', () => {
  it('opens the mobile menu', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobile() })
    expect(result.current.isMobileOpen).toBe(true)
  })

  it('closes the mobile menu when toggled again', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobile() })
    act(() => { result.current.toggleMobile() })
    expect(result.current.isMobileOpen).toBe(false)
  })
})

describe('useDropdownNav — closeMobile', () => {
  it('sets isMobileOpen to false', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobile() })
    act(() => { result.current.closeMobile() })
    expect(result.current.isMobileOpen).toBe(false)
  })
})

describe('useDropdownNav — toggleMobileSection', () => {
  it('adds a key to mobileExpanded', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobileSection('produto') })
    expect(result.current.mobileExpanded).toEqual(['produto'])
  })

  it('removes a key when toggled again', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobileSection('produto') })
    act(() => { result.current.toggleMobileSection('produto') })
    expect(result.current.mobileExpanded).toEqual([])
  })

  it('can expand multiple sections independently', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => { result.current.toggleMobileSection('produto') })
    act(() => { result.current.toggleMobileSection('funcionalidades') })
    expect(result.current.mobileExpanded).toEqual(
      expect.arrayContaining(['produto', 'funcionalidades']),
    )
  })
})

describe('useDropdownNav — Escape key', () => {
  it('closes the open dropdown and mobile menu', () => {
    const { result } = renderHook(() => useDropdownNav())
    act(() => {
      result.current.toggleDropdown('produto')
      result.current.toggleMobile()
    })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(result.current.openDropdown).toBeNull()
    expect(result.current.isMobileOpen).toBe(false)
  })
})
