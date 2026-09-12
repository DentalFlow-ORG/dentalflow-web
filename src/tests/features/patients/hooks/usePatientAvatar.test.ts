import {
  __resetAvatarCache,
  getCachedPatientAvatar,
  getMissingPatientAvatarIdentifiers,
  setCachedPatientAvatar,
  usePatientAvatar,
} from '@/features/patients/hooks/usePatientAvatar'
import { act, renderHook, waitFor } from '@/test-utils/render-utils'

// ── Service mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/patients/services/patients.service', () => ({
  getPatientAvatar: vi.fn(),
  upsertPatientAvatar: vi.fn(),
}))

import {
  getPatientAvatar,
  upsertPatientAvatar,
} from '@/features/patients/services/patients.service'

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
    expect(mockGet).toHaveBeenCalledTimes(1) // no second fetch
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

    u1()
    u2()
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

    await act(async () => {
      await result.current.update('newphoto')
    })

    expect(result.current.avatarUrl).toBe('newphoto')
    unmount()

    // Next mount should get the updated value immediately from cache.
    const { result: second } = renderHook(() => usePatientAvatar(ID))
    expect(second.current.isLoading).toBe(false)
    expect(second.current.avatarUrl).toBe('newphoto')
    expect(mockGet).toHaveBeenCalledTimes(1) // only the original fetch
  })

  it('update(null) caches null (photo removed) and next mount reflects removal', async () => {
    const { result, unmount } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update(null)
    })

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
      act(async () => {
        await result.current.update('badphoto')
      }),
    ).rejects.toThrow('Não foi possível salvar a foto.')

    // Original cached value should be intact, not the failed write.
    unmount()
    const { result: second } = renderHook(() => usePatientAvatar(ID))
    expect(second.current.avatarUrl).toBe('base64abc') // original value
  })
})

// ── Obsolete responses and missing identifier ────────────────────────────────

describe('usePatientAvatar — obsolete responses', () => {
  it('discards a fetch that resolves after the hook is unmounted', async () => {
    let resolveFetch: ((value: { avatarUrl: string | null }) => void) | undefined
    mockGet.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const { unmount } = renderHook(() => usePatientAvatar(ID))
    unmount()

    await act(async () => {
      resolveFetch?.({ avatarUrl: 'late-photo' })
    })

    // The late response must not be cached, so a fresh mount refetches.
    mockGet.mockResolvedValueOnce({ avatarUrl: 'current-photo' })
    const { result } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.avatarUrl).toBe('current-photo'))
  })

  it('discards a fetch that rejects after the hook is unmounted', async () => {
    let rejectFetch: ((reason: unknown) => void) | undefined
    mockGet.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectFetch = reject
      }),
    )

    const { unmount } = renderHook(() => usePatientAvatar(ID))
    unmount()

    await act(async () => {
      rejectFetch?.(new Error('too late'))
    })

    mockGet.mockResolvedValueOnce({ avatarUrl: 'current-photo' })
    const { result } = renderHook(() => usePatientAvatar(ID))
    await waitFor(() => expect(result.current.avatarUrl).toBe('current-photo'))
  })

  it('ignores update() while there is no identifier to save against', async () => {
    const { result } = renderHook(() => usePatientAvatar(null))

    await act(async () => {
      await result.current.update('photo')
    })

    expect(mockUpsert).not.toHaveBeenCalled()
    expect(result.current.isSaving).toBe(false)
  })
})

// ── Cache helper functions ────────────────────────────────────────────────────

describe('getCachedPatientAvatar', () => {
  it('returns undefined when the identifier has never been cached', () => {
    expect(getCachedPatientAvatar('never@cached.com')).toBeUndefined()
  })

  it('returns the avatarUrl after setCachedPatientAvatar is called', () => {
    setCachedPatientAvatar('warm@test.com', 'base64warm')
    expect(getCachedPatientAvatar('warm@test.com')).toBe('base64warm')
  })

  it('returns null when the identifier was explicitly cached as absent (no photo)', () => {
    setCachedPatientAvatar('nophoto@test.com', null)
    expect(getCachedPatientAvatar('nophoto@test.com')).toBeNull()
  })
})

describe('getMissingPatientAvatarIdentifiers', () => {
  it('returns all identifiers when none are cached', () => {
    const ids = ['x@test.com', 'y@test.com']
    expect(getMissingPatientAvatarIdentifiers(ids)).toEqual(ids)
  })

  it('excludes identifiers that are already in the cache', () => {
    setCachedPatientAvatar('cached@test.com', 'base64data')
    const result = getMissingPatientAvatarIdentifiers(['cached@test.com', 'missing@test.com'])
    expect(result).toEqual(['missing@test.com'])
  })

  it('excludes identifiers cached as null (explicitly absent)', () => {
    setCachedPatientAvatar('absent@test.com', null)
    const result = getMissingPatientAvatarIdentifiers(['absent@test.com', 'other@test.com'])
    expect(result).not.toContain('absent@test.com')
    expect(result).toContain('other@test.com')
  })

  it('returns an empty array when all identifiers are cached', () => {
    setCachedPatientAvatar('a@test.com', 'img1')
    setCachedPatientAvatar('b@test.com', 'img2')
    expect(getMissingPatientAvatarIdentifiers(['a@test.com', 'b@test.com'])).toEqual([])
  })

  it('returns an empty array for an empty input', () => {
    expect(getMissingPatientAvatarIdentifiers([])).toEqual([])
  })
})

describe('setCachedPatientAvatar — usePatientAvatar hook benefits from pre-warmed cache', () => {
  it('usePatientAvatar starts with isLoading=false when identifier was pre-warmed', () => {
    setCachedPatientAvatar('prewarm@test.com', 'base64prewarm')

    let initialIsLoading: boolean | undefined
    renderHook(() => {
      const hook = usePatientAvatar('prewarm@test.com')
      if (initialIsLoading === undefined) initialIsLoading = hook.isLoading
      return hook
    })

    expect(initialIsLoading).toBe(false)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('usePatientAvatar returns the pre-warmed avatarUrl without a network call', async () => {
    setCachedPatientAvatar('instant@test.com', 'base64instant')

    const { result } = renderHook(() => usePatientAvatar('instant@test.com'))

    expect(result.current.avatarUrl).toBe('base64instant')
    expect(result.current.isLoading).toBe(false)
    expect(mockGet).not.toHaveBeenCalled()
  })
})
