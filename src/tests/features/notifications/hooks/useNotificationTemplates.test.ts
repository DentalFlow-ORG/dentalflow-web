import { waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockListTemplates = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', () => ({
  listTemplates: (...args: unknown[]) => mockListTemplates(...args),
}))

import { useNotificationTemplates } from '@/features/notifications/hooks/useNotificationTemplates'

beforeEach(() => {
  mockListTemplates.mockReset()
})

describe('useNotificationTemplates', () => {
  it('loads templates on mount', async () => {
    mockListTemplates.mockResolvedValue([{ slug: 'appointment_reminder_24h' }])
    const { result } = renderHook(() => useNotificationTemplates())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.templates).toEqual([{ slug: 'appointment_reminder_24h' }])
  })

  it('silently keeps an empty list when loading fails', async () => {
    mockListTemplates.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNotificationTemplates())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.templates).toEqual([])
  })
})
