import { renderHook, waitFor, act } from '@/test-utils/render-utils'
import { usePatientAvatar, __resetAvatarCache } from '@/features/patients/hooks/usePatientAvatar'

// ── Service mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/patients/services/patients.service', () => ({
  getPatientAvatar: vi.fn(),
  upsertPatientAvatar: vi.fn(),
}))

import { getPatientAvatar, upsertPatientAvatar } from '@/features/patients/services/patients.service'

const mockGet = vi.mocked(getPatientAvatar)
const mockUpsert = vi.mocked(upsertPatientAvatar)

// ── Helpers ───────────────────────────────────────────────────────────────────

const ID = 'patient@example.com'

beforeEach(() => {
  __resetAvatarCache()
  vi.clearAllMocks()
  mockGet.mockResolvedValue({ avatarUrl: 'base64abc' })
  mockUpsert.mockResolvedValue(undefined)
})

// ── Initial fetch ─────────────────────────────────────────────────────────────

describe('usePatientAvatar — initial fetch', () => {
  it('starts loading and resolves with avatar url', async () => {
    const { result } = renderHook(() => usePatientAvatar(ID))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.avatarUrl).toBe('base64abc')
    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockGet).toHaveBeenCalledWith(ID)
  })

  it('returns avatarUrl: null when identifier is null — no fetch', async () => {
    const { result } = renderHook(() => usePatientAvatar(null))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.avatarUrl).toBeNull()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('returns avatarUrl: null when identifier is undefined — no fetch', async () => {
    const { result } = renderHook(() => usePatientAvatar(undefined))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.avatarUrl).toBeNull()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('handles fetch failure gracefully: isLoading false, avatarUrl null', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => usePatientAvatar(ID))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.avatarUrl).toBeNull()
  })
})

// ── Cache: skip fetch on repeat mount ────────────────────────────────────────

describe('usePatientAvatar — cache', () => {
  it('second mount for same identifier skips the network call', async () => {
    // First mount — populates the cache.
    const { result: first, unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(first.current.isLoading).toBe(false))
    unmount()

    // Second mount — should read from cache immediately.
    const { result: second } = renderHook(() => usePatientAvatar(ID))

    expect(second.current.isLoading).toBe(false)
    expect(second.current.avatarUrl).toBe('base64abc')
    expect(mockGet).toHaveBeenCalledTimes(1)  // no second fetch
  })

  it('cache hit: isLoading is false from the very first render (no loading flash)', async () => {
    // Warm the cache.
    const { unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
    unmount()

    // Second mount: initial state should already have isLoading=false.
    let initialIsLoading: boolean | undefined
    renderHook(() => {
      const hook = usePatientAvatar(ID)
      if (initialIsLoading === undefined) initialIsLoading = hook.isLoading
      return hook
    })

    expect(initialIsLoading).toBe(false)
  })

  it('different identifiers fetch independently — no cross-contamination', async () => {
    const ID2 = 'other@example.com'
    mockGet
      .mockResolvedValueOnce({ avatarUrl: 'base64abc' })
      .mockResolvedValueOnce({ avatarUrl: 'base64xyz' })

    const { result: r1, unmount: u1 } = renderHook(() => usePatientAvatar(ID))
    const { result: r2, unmount: u2 } = renderHook(() => usePatientAvatar(ID2))

    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    await waitFor(() => expect(r2.current.isLoading).toBe(false))

    expect(r1.current.avatarUrl).toBe('base64abc')
    expect(r2.current.avatarUrl).toBe('base64xyz')
    expect(mockGet).toHaveBeenCalledTimes(2)

    u1(); u2()
  })

  it('failure is not cached — next mount retries the fetch', async () => {
    mockGet.mockRejectedValueOnce(new Error('Fail'))

    const { unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
    unmount()

    // Second mount should attempt the fetch again since failure was not cached.
    mockGet.mockResolvedValueOnce({ avatarUrl: 'recovered' })
    const { result } = renderHook(() => usePatientAvatar(ID))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.avatarUrl).toBe('recovered')
    expect(mockGet).toHaveBeenCalledTimes(2)
  })
})

// ── Cache: update() writes through ───────────────────────────────────────────

describe('usePatientAvatar — update() cache write-through', () => {
  it('update() persists new url in cache so next mount skips fetch', async () => {
    const { result, unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.update('newphoto') })

    expect(result.current.avatarUrl).toBe('newphoto')
    unmount()

    // Next mount should get the updated value immediately from cache.
    const { result: second } = renderHook(() => usePatientAvatar(ID))
    expect(second.current.isLoading).toBe(false)
    expect(second.current.avatarUrl).toBe('newphoto')
    expect(mockGet).toHaveBeenCalledTimes(1)  // only the original fetch
  })

  it('update(null) caches null (photo removed) and next mount reflects removal', async () => {
    const { result, unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.update(null) })

    expect(result.current.avatarUrl).toBeNull()
    unmount()

    const { result: second } = renderHook(() => usePatientAvatar(ID))
    expect(second.current.isLoading).toBe(false)
    expect(second.current.avatarUrl).toBeNull()
    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  it('update() throws when upsert fails and does not update cache', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('Save failed'))

    const { result, unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => { await result.current.update('badphoto') }),
    ).rejects.toThrow('Não foi possível salvar a foto.')

    // Original cached value should be intact, not the failed write.
    unmount()
    const { result: second } = renderHook(() => usePatientAvatar(ID))
    expect(second.current.avatarUrl).toBe('base64abc')  // original value
  })
})
