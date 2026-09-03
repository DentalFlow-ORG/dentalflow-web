import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockGetPreferences = vi.fn()
const mockUpdatePreferences = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', () => ({
  getPreferences: (...args: unknown[]) => mockGetPreferences(...args),
  updatePreferences: (...args: unknown[]) => mockUpdatePreferences(...args),
}))

import { useNotificationPreferences } from '@/features/notifications/hooks/useNotificationPreferences'

beforeEach(() => {
  mockGetPreferences.mockReset()
  mockUpdatePreferences.mockReset()
})

describe('useNotificationPreferences', () => {
  it('loads preferences on mount', async () => {
    mockGetPreferences.mockResolvedValue({ whatsappEnabled: true })
    const { result } = renderHook(() => useNotificationPreferences())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.preferences).toEqual({ whatsappEnabled: true })
    expect(result.current.error).toBeNull()
  })

  it('sets an error message when loading fails', async () => {
    mockGetPreferences.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNotificationPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar as preferências.')
  })

  it('save updates preferences and returns the updated value', async () => {
    mockGetPreferences.mockResolvedValue({ whatsappEnabled: false })
    mockUpdatePreferences.mockResolvedValue({ whatsappEnabled: true })
    const { result } = renderHook(() => useNotificationPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let returned: { whatsappEnabled: boolean } | undefined
    await act(async () => {
      returned = await result.current.save({ whatsappEnabled: true })
    })
    expect(returned).toEqual({ whatsappEnabled: true })
    expect(result.current.preferences).toEqual({ whatsappEnabled: true })
    expect(result.current.isSaving).toBe(false)
  })

  it('resets isSaving even when save rejects', async () => {
    mockGetPreferences.mockResolvedValue({ whatsappEnabled: false })
    mockUpdatePreferences.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useNotificationPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.save({ whatsappEnabled: true })).rejects.toThrow('fail')
    })
    expect(result.current.isSaving).toBe(false)
  })
})
