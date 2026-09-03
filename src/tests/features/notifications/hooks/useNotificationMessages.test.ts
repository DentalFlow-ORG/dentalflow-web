import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockListMessages = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', () => ({
  listMessages: (...args: unknown[]) => mockListMessages(...args),
}))

import { useNotificationMessages } from '@/features/notifications/hooks/useNotificationMessages'

beforeEach(() => {
  mockListMessages.mockReset()
})

describe('useNotificationMessages', () => {
  it('does not load automatically without an appointmentId', () => {
    renderHook(() => useNotificationMessages())
    expect(mockListMessages).not.toHaveBeenCalled()
  })

  it('loads messages on mount when appointmentId is provided', async () => {
    mockListMessages.mockResolvedValue({ data: [{ id: 'm1' }], total: 1 })
    const { result } = renderHook(() => useNotificationMessages('appt-1'))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages).toEqual([{ id: 'm1' }])
    expect(result.current.total).toBe(1)
    expect(mockListMessages).toHaveBeenCalledWith({ appointmentId: 'appt-1', limit: 50 })
  })

  it('silently keeps an empty list when loading fails', async () => {
    mockListMessages.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNotificationMessages('appt-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('reload re-fetches messages', async () => {
    mockListMessages.mockResolvedValue({ data: [], total: 0 })
    const { result } = renderHook(() => useNotificationMessages('appt-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockListMessages.mockResolvedValue({ data: [{ id: 'm2' }], total: 1 })
    await act(async () => {
      result.current.reload()
    })
    await waitFor(() => expect(result.current.messages).toEqual([{ id: 'm2' }]))
  })
})
