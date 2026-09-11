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
  it('clears consent and loading when the phone is removed', async () => {
    mockListConsents.mockResolvedValue([{ id: 'old', granted: true }])
    const { result, rerender } = renderHook(
      ({ phone }: { phone?: string }) => useNotificationConsent(phone),
      { initialProps: { phone: '11111111111' as string | undefined } },
    )
    await waitFor(() => expect(result.current.consent?.id).toBe('old'))
    rerender({ phone: undefined })
    expect(result.current.consent).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(mockListConsents).toHaveBeenCalledTimes(1)
  })

  it('keeps the latest reload result when an older reload finishes', async () => {
    mockListConsents.mockResolvedValueOnce([{ id: 'c1', granted: false }])
    const { result } = renderHook(() => useNotificationConsent('11111111111'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let resolveOld!: (value: unknown) => void
    mockListConsents
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve
        }),
      )
      .mockResolvedValueOnce([{ id: 'c1', granted: true }])
    act(() => {
      void result.current.reload()
    })
    await act(async () => {
      await result.current.reload()
    })
    await act(async () => resolveOld([{ id: 'c1', granted: false }]))
    expect(result.current.consent?.granted).toBe(true)
  })

  it('does not reload the old phone when a grant finishes after changing patients', async () => {
    mockListConsents
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'current', granted: false }])
    let finishGrant!: () => void
    mockCreateOrUpdateConsent.mockReturnValue(
      new Promise<void>((resolve) => {
        finishGrant = resolve
      }),
    )
    const { result, rerender } = renderHook(({ phone }) => useNotificationConsent(phone), {
      initialProps: { phone: '11111111111' },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let grant!: Promise<void>
    act(() => {
      grant = result.current.grant('11111111111')
    })
    rerender({ phone: '22222222222' })
    await waitFor(() => expect(result.current.consent?.id).toBe('current'))
    await act(async () => {
      finishGrant()
      await grant
    })
    expect(mockListConsents).toHaveBeenCalledTimes(2)
    expect(result.current.consent?.granted).toBe(false)
    expect(result.current.isSaving).toBe(false)
  })

  it('keeps an empty reloaded consent empty when revocation finishes', async () => {
    mockListConsents.mockResolvedValueOnce([{ id: 'c1', granted: true }]).mockResolvedValueOnce([])
    let finishRevoke!: () => void
    mockRevokeConsent.mockReturnValue(
      new Promise<void>((resolve) => {
        finishRevoke = resolve
      }),
    )
    const { result } = renderHook(() => useNotificationConsent('11111111111'))
    await waitFor(() => expect(result.current.consent?.id).toBe('c1'))
    let revoke!: Promise<void>
    act(() => {
      revoke = result.current.revoke()
    })
    await act(async () => {
      await result.current.reload()
    })
    await act(async () => {
      finishRevoke()
      await revoke
    })
    expect(result.current.consent).toBeNull()
    expect(result.current.isSaving).toBe(false)
  })

  it('clears the previous patient consent while loading a different phone', async () => {
    mockListConsents
      .mockResolvedValueOnce([{ id: 'old', granted: true }])
      .mockReturnValueOnce(new Promise(() => {}))
    const { result, rerender } = renderHook(({ phone }) => useNotificationConsent(phone), {
      initialProps: { phone: '11111111111' },
    })
    await waitFor(() => expect(result.current.consent?.id).toBe('old'))
    rerender({ phone: '22222222222' })
    expect(result.current.consent).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('ignores an old phone response after the current phone has loaded', async () => {
    let resolveOld!: (value: unknown) => void
    mockListConsents
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve
        }),
      )
      .mockResolvedValueOnce([{ id: 'current', granted: false }])
    const { result, rerender } = renderHook(({ phone }) => useNotificationConsent(phone), {
      initialProps: { phone: '11111111111' },
    })
    rerender({ phone: '22222222222' })
    await waitFor(() => expect(result.current.consent?.id).toBe('current'))
    await act(async () => resolveOld([{ id: 'old', granted: true }]))
    expect(result.current.consent).toEqual({ id: 'current', granted: false })
  })

  it('does not revoke the new patient consent when an earlier revoke finishes', async () => {
    let finishRevoke!: () => void
    mockListConsents
      .mockResolvedValueOnce([{ id: 'old', granted: true }])
      .mockResolvedValueOnce([{ id: 'current', granted: true }])
    mockRevokeConsent.mockReturnValue(
      new Promise<void>((resolve) => {
        finishRevoke = resolve
      }),
    )
    const { result, rerender } = renderHook(({ phone }) => useNotificationConsent(phone), {
      initialProps: { phone: '11111111111' },
    })
    await waitFor(() => expect(result.current.consent?.id).toBe('old'))
    let revoke!: Promise<void>
    act(() => {
      revoke = result.current.revoke()
    })
    rerender({ phone: '22222222222' })
    await waitFor(() => expect(result.current.consent?.id).toBe('current'))
    await act(async () => {
      finishRevoke()
      await revoke
    })
    expect(result.current.consent).toEqual({ id: 'current', granted: true })
  })

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
