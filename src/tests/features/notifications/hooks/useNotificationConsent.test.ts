import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockListConsents = vi.fn()
const mockCreateOrUpdateConsent = vi.fn()
const mockRevokeConsent = vi.fn()
vi.mock('@/features/notifications/services/notifications.service', () => ({
  listConsents: (...args: unknown[]) => mockListConsents(...args),
  createOrUpdateConsent: (...args: unknown[]) => mockCreateOrUpdateConsent(...args),
  revokeConsent: (...args: unknown[]) => mockRevokeConsent(...args),
}))

import { useNotificationConsent } from '@/features/notifications/hooks/useNotificationConsent'

beforeEach(() => {
  mockListConsents.mockReset()
  mockCreateOrUpdateConsent.mockReset()
  mockRevokeConsent.mockReset()
})

describe('useNotificationConsent', () => {
  it('does not load without a phone', () => {
    renderHook(() => useNotificationConsent())
    expect(mockListConsents).not.toHaveBeenCalled()
  })

  it('loads the first consent for the given phone', async () => {
    mockListConsents.mockResolvedValue([{ id: 'c1', granted: true }])
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.consent).toEqual({ id: 'c1', granted: true })
  })

  it('sets consent to null when the list is empty', async () => {
    mockListConsents.mockResolvedValue([])
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.consent).toBeNull()
  })

  it('silently ignores a load failure', async () => {
    mockListConsents.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.consent).toBeNull()
  })

  it('grant creates consent and reloads', async () => {
    mockListConsents.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 'c1', granted: true }])
    mockCreateOrUpdateConsent.mockResolvedValue({ id: 'c1', granted: true })
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.grant('11987654321')
    })
    expect(mockCreateOrUpdateConsent).toHaveBeenCalledWith({
      phone: '11987654321',
      channel: 'WHATSAPP',
      scope: 'UTILITY',
      granted: true,
      source: 'MANUAL',
    })
    expect(result.current.consent).toEqual({ id: 'c1', granted: true })
    expect(result.current.isSaving).toBe(false)
  })

  it('resets isSaving even when grant rejects', async () => {
    mockListConsents.mockResolvedValue([])
    mockCreateOrUpdateConsent.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.grant('11987654321')).rejects.toThrow('fail')
    })
    expect(result.current.isSaving).toBe(false)
  })

  it('revoke does nothing when there is no consent', async () => {
    mockListConsents.mockResolvedValue([])
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.revoke()
    })
    expect(mockRevokeConsent).not.toHaveBeenCalled()
  })

  it('revoke updates the consent locally', async () => {
    mockListConsents.mockResolvedValue([{ id: 'c1', granted: true }])
    mockRevokeConsent.mockResolvedValue({ id: 'c1', granted: false })
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.revoke()
    })
    expect(mockRevokeConsent).toHaveBeenCalledWith('c1')
    expect(result.current.consent?.granted).toBe(false)
    expect(result.current.consent?.revokedAt).toBeTruthy()
    expect(result.current.isSaving).toBe(false)
  })

  it('resets isSaving even when revoke rejects', async () => {
    mockListConsents.mockResolvedValue([{ id: 'c1', granted: true }])
    mockRevokeConsent.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useNotificationConsent('11987654321'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.revoke()).rejects.toThrow('fail')
    })
    expect(result.current.isSaving).toBe(false)
  })
})
