import { waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockGetQuota = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', () => ({
  getQuota: (...args: unknown[]) => mockGetQuota(...args),
}))

import { useNotificationQuota } from '@/features/notifications/hooks/useNotificationQuota'

beforeEach(() => {
  mockGetQuota.mockReset()
})

describe('useNotificationQuota', () => {
  it('loads the quota on mount', async () => {
    mockGetQuota.mockResolvedValue({ used: 10, limit: 100 })
    const { result } = renderHook(() => useNotificationQuota())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.quota).toEqual({ used: 10, limit: 100 })
    expect(result.current.error).toBeNull()
  })

  it('sets an error message when loading fails', async () => {
    mockGetQuota.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNotificationQuota())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar o uso mensal.')
    expect(result.current.quota).toBeNull()
  })

  it('reload re-fetches the quota', async () => {
    mockGetQuota.mockResolvedValue({ used: 1, limit: 100 })
    const { result } = renderHook(() => useNotificationQuota())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockGetQuota.mockResolvedValue({ used: 2, limit: 100 })
    result.current.reload()
    await waitFor(() => expect(result.current.quota).toEqual({ used: 2, limit: 100 }))
    expect(mockGetQuota).toHaveBeenCalledTimes(2)
  })
})
