import {
  __resetAvatarCache,
  setCachedPatientAvatar,
} from '@/features/patients/hooks/usePatientAvatar'
import { usePatientsAttention } from '@/features/patients/hooks/usePatientsAttention'
import type { AttentionResponse } from '@/features/patients/types/attention.types'
import { ApiError } from '@/services/http'
import { renderHook, waitFor } from '@/test-utils/render-utils'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/features/patients/services/attention.service', () => ({
  getPatientsAttention: vi.fn(),
}))

vi.mock('@/features/patients/services/patients.service', () => ({
  batchGetPatientAvatars: vi.fn(),
  getPatientAvatar: vi.fn(),
}))

import { getPatientsAttention } from '@/features/patients/services/attention.service'
import {
  batchGetPatientAvatars,
  getPatientAvatar,
} from '@/features/patients/services/patients.service'

const mockGetAttention = vi.mocked(getPatientsAttention)
const mockBatchAvatars = vi.mocked(batchGetPatientAvatars)

it('keeps identical-contact stable Patients in separate avatar entries', async () => {
  const response = makeResponse(['same@example.test', 'same@example.test'])
  response.items = response.items.map((item, index) => ({
    ...item,
    patientId: index === 0 ? 'A' : 'B',
  }))
  mockGetAttention.mockResolvedValue(response)
  vi.mocked(getPatientAvatar).mockImplementation(async (_identifier, id) => ({
    avatarUrl: `photo-${id}`,
  }))
  const { result } = renderHook(() => usePatientsAttention())
  await waitFor(() =>
    expect(result.current.avatarsByIdentifier).toEqual({ A: 'photo-A', B: 'photo-B' }),
  )
  expect(mockBatchAvatars).not.toHaveBeenCalled()
  expect(result.current.allItems).toHaveLength(2)
})

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeResponse(identifiers: string[]): AttentionResponse {
  return {
    summary: {
      total: identifiers.length,
      inactive: 0,
      withoutUpcomingAppointment: 0,
      pendingPayment: 0,
      recentlyCanceled: 0,
      recentNoShow: 0,
      withWhatsappConsent: 0,
    },
    items: identifiers.map((id) => ({
      identifier: id,
      patientName: id,
      patientEmail: id.includes('@') ? id : null,
      patientPhone: null,
      lastAppointmentAt: null,
      nextAppointmentAt: null,
      lastProfessionalName: null,
      reason: 'INACTIVE' as const,
      allReasons: ['INACTIVE' as const],
      priority: 'LOW' as const,
      pendingAmountCents: 0,
      hasWhatsappConsent: false,
    })),
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  __resetAvatarCache()
  vi.clearAllMocks()
  mockGetAttention.mockResolvedValue(makeResponse(['a@test.com', 'b@test.com']))
  mockBatchAvatars.mockResolvedValue({
    avatars: { 'a@test.com': 'img-a', 'b@test.com': null },
  })
})

// ── Batch avatar loading ───────────────────────────────────────────────────────

describe('usePatientsAttention — avatar batch loading', () => {
  it('uses stable cache entries and ignores the shared contact cache', async () => {
    const response = makeResponse(['same@example.test'])
    response.items[0].patientId = 'A'
    setCachedPatientAvatar('A', 'own-photo')
    setCachedPatientAvatar('same@example.test', 'other-photo')
    mockGetAttention.mockResolvedValue(response)
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.avatarsByIdentifier).toEqual({ A: 'own-photo' }))
    expect(getPatientAvatar).not.toHaveBeenCalled()
  })

  it.each(['success', 'failure'])('ignores an obsolete attention response: %s', async (outcome) => {
    let finish!: (value: AttentionResponse) => void
    let fail!: (reason: Error) => void
    mockGetAttention
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          finish = resolve
          fail = reject
        }),
      )
      .mockResolvedValueOnce(makeResponse(['current']))
    const { result } = renderHook(() => usePatientsAttention())
    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.allItems[0]?.identifier).toBe('current'))
    await act(async () => {
      if (outcome === 'success') finish(makeResponse(['old']))
      else fail(new Error('late failure'))
    })
    expect(result.current.allItems[0]?.identifier).toBe('current')
    expect(result.current.error).toBeNull()
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('ignores obsolete stable and legacy avatar requests after refresh', async () => {
    const response = makeResponse(['same@example.test', 'legacy'])
    response.items[0].patientId = 'A'
    let finishStable!: (value: { avatarUrl: string }) => void
    let finishLegacy!: (value: { avatars: Record<string, string> }) => void
    vi.mocked(getPatientAvatar).mockReturnValueOnce(
      new Promise((resolve) => {
        finishStable = resolve
      }),
    )
    mockBatchAvatars.mockReturnValueOnce(
      new Promise((resolve) => {
        finishLegacy = resolve
      }),
    )
    mockGetAttention.mockResolvedValueOnce(response).mockResolvedValueOnce(makeResponse([]))
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(mockBatchAvatars).toHaveBeenCalled())
    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.allItems).toEqual([]))
    await act(async () => {
      finishStable({ avatarUrl: 'old-stable' })
      finishLegacy({ avatars: { legacy: 'old-legacy' } })
    })
    expect(result.current.avatarsByIdentifier).toEqual({})
  })

  it('keeps stable avatar failures empty and retryable', async () => {
    const response = makeResponse(['same@example.test'])
    response.items[0].patientId = 'A'
    mockGetAttention.mockResolvedValue(response)
    vi.mocked(getPatientAvatar)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ avatarUrl: 'recovered' })
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.avatarsByIdentifier).toEqual({})
    act(() => result.current.refresh())
    await waitFor(() => expect(result.current.avatarsByIdentifier).toEqual({ A: 'recovered' }))
  })

  it('calls batchGetPatientAvatars once after data loads when no identifiers are cached', async () => {
    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockBatchAvatars).toHaveBeenCalledTimes(1)
    const [identifiers] = mockBatchAvatars.mock.calls[0] as [string[]]
    expect(identifiers).toHaveLength(2)
    expect(identifiers).toEqual(expect.arrayContaining(['a@test.com', 'b@test.com']))
  })

  it('does not call batchGetPatientAvatars when all identifiers are already cached', async () => {
    setCachedPatientAvatar('a@test.com', 'cached-a')
    setCachedPatientAvatar('b@test.com', 'cached-b')

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockBatchAvatars).not.toHaveBeenCalled()
  })

  it('calls batchGetPatientAvatars only for the identifiers not in cache', async () => {
    setCachedPatientAvatar('a@test.com', 'cached-a')
    mockBatchAvatars.mockResolvedValue({ avatars: { 'b@test.com': 'img-b' } })

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockBatchAvatars).toHaveBeenCalledTimes(1)
    const [identifiers] = mockBatchAvatars.mock.calls[0] as [string[]]
    expect(identifiers).toEqual(['b@test.com'])
  })

  it('deduplicates identifiers — each is requested at most once', async () => {
    // Simulate a response where the same identifier appears twice (defensive)
    mockGetAttention.mockResolvedValue(makeResponse(['dup@test.com', 'dup@test.com']))
    mockBatchAvatars.mockResolvedValue({ avatars: { 'dup@test.com': 'img-dup' } })

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // getMissingPatientAvatarIdentifiers deduplicates via the cache-check loop;
    // the backend also deduplicates, but verify we never send the same id twice.
    expect(mockBatchAvatars).toHaveBeenCalledTimes(1)
    const [identifiers] = mockBatchAvatars.mock.calls[0] as [string[]]
    const unique = [...new Set(identifiers)]
    expect(identifiers).toHaveLength(unique.length)
  })
})

// ── Immediate cache population ────────────────────────────────────────────────

describe('usePatientsAttention — immediate cache population', () => {
  it('avatarsByIdentifier is populated from cache before batch resolves', async () => {
    setCachedPatientAvatar('a@test.com', 'cached-a')
    // Block the batch call so we can test the pre-batch state
    mockBatchAvatars.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.avatarsByIdentifier['a@test.com']).toBe('cached-a')
  })

  it('attention items are rendered before batch avatars resolve (non-blocking)', async () => {
    mockBatchAvatars.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Items already available even though batch is pending
    expect(result.current.allItems).toHaveLength(2)
    expect(result.current.allItems[0].patientName).toBe('a@test.com')
  })
})

// ── Post-batch state ──────────────────────────────────────────────────────────

describe('usePatientsAttention — avatarsByIdentifier after batch', () => {
  it('avatarsByIdentifier is updated with batch response values', async () => {
    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => {
      expect(result.current.avatarsByIdentifier['a@test.com']).toBe('img-a')
    })
    expect(result.current.avatarsByIdentifier['b@test.com']).toBeNull()
  })

  it('writes batch results into the session cache for future use', async () => {
    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.avatarsByIdentifier['a@test.com']).toBe('img-a'))

    // A second render of any hook for the same identifier should find a cache hit.
    // Verify by checking getMissingPatientAvatarIdentifiers no longer includes it.
    const { getMissingPatientAvatarIdentifiers } = await import(
      '@/features/patients/hooks/usePatientAvatar'
    )
    expect(getMissingPatientAvatarIdentifiers(['a@test.com'])).toHaveLength(0)
  })
})

// ── Failure resilience ────────────────────────────────────────────────────────

describe('usePatientsAttention — batch failure resilience', () => {
  it.each([new ApiError('Acesso indisponível', 403, null), new Error('network')])(
    'retains patient data after a refresh error and recovers on retry: %s',
    async (error) => {
      const { result } = renderHook(() => usePatientsAttention())
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      const items = result.current.allItems
      mockGetAttention.mockRejectedValueOnce(error)
      act(() => result.current.refresh())
      await waitFor(() =>
        expect(result.current.error).toBe(
          error instanceof ApiError
            ? error.message
            : 'Erro ao carregar pacientes que precisam de atenção.',
        ),
      )
      expect(result.current.allItems).toEqual(items)
      expect(result.current.isLoading).toBe(false)
      expect(mockShowAlert).toHaveBeenCalledWith({
        title: 'Erro ao carregar atenção',
        description: result.current.error,
        tone: 'error',
      })
      act(() => result.current.refresh())
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.error).toBeNull()
      expect(result.current.filteredItems).toEqual(items)
    },
  )
  it('batch failure does not set error state and the page remains usable', async () => {
    mockBatchAvatars.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.allItems).toHaveLength(2)
  })

  it('batch failure keeps cached avatars intact in avatarsByIdentifier', async () => {
    setCachedPatientAvatar('a@test.com', 'cached-a')
    mockBatchAvatars.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.avatarsByIdentifier['a@test.com']).toBe('cached-a')
  })

  it('batch failure does not show an alert — initials are an acceptable fallback', async () => {
    mockBatchAvatars.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePatientsAttention())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // showAlert should only have been called if getPatientsAttention itself fails,
    // not if the avatar batch fails.
    expect(mockShowAlert).not.toHaveBeenCalled()
  })
})

// ── Filters ──────────────────────────────────────────────────────────────────

import { act } from '@testing-library/react'

function makeCustomResponse(
  items: Array<{
    identifier: string
    patientName: string
    patientEmail?: string | null
    allReasons?: Array<'INACTIVE' | 'PENDING_PAYMENT' | 'NO_UPCOMING_APPOINTMENT'>
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    hasWhatsappConsent?: boolean
  }>,
): AttentionResponse {
  return {
    summary: {
      total: items.length,
      inactive: 0,
      withoutUpcomingAppointment: 0,
      pendingPayment: 0,
      recentlyCanceled: 0,
      recentNoShow: 0,
      withWhatsappConsent: 0,
    },
    items: items.map((item) => ({
      identifier: item.identifier,
      patientName: item.patientName,
      patientEmail: item.patientEmail ?? null,
      patientPhone: null,
      lastAppointmentAt: null,
      nextAppointmentAt: null,
      lastProfessionalName: null,
      reason: (item.allReasons?.[0] ?? 'INACTIVE') as 'INACTIVE',
      allReasons: item.allReasons ?? ['INACTIVE'],
      priority: item.priority ?? 'LOW',
      pendingAmountCents: 0,
      hasWhatsappConsent: item.hasWhatsappConsent ?? false,
    })),
  }
}

describe('usePatientsAttention — filters', () => {
  it('filters by search matching patient name', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'Ana Silva' },
        { identifier: 'b', patientName: 'Bruno Costa' },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setSearch('ana'))
    expect(result.current.filteredItems.map((i) => i.identifier)).toEqual(['a'])
    expect(result.current.hasFilters).toBe(true)
  })

  it('filters by search matching patient email', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'X', patientEmail: 'ana@clinica.com' },
        { identifier: 'b', patientName: 'Y', patientEmail: 'bruno@clinica.com' },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setSearch('bruno@'))
    expect(result.current.filteredItems.map((i) => i.identifier)).toEqual(['b'])
  })

  it('excludes an item with no email when searching and no name match', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([{ identifier: 'a', patientName: 'X', patientEmail: null }]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setSearch('nomatch'))
    expect(result.current.filteredItems).toEqual([])
  })

  it('filters by reasonFilter', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'A', allReasons: ['PENDING_PAYMENT'] },
        { identifier: 'b', patientName: 'B', allReasons: ['INACTIVE'] },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setReasonFilter('PENDING_PAYMENT'))
    expect(result.current.filteredItems.map((i) => i.identifier)).toEqual(['a'])
  })

  it('filters by priorityFilter', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'A', priority: 'HIGH' },
        { identifier: 'b', patientName: 'B', priority: 'LOW' },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setPriorityFilter('HIGH'))
    expect(result.current.filteredItems.map((i) => i.identifier)).toEqual(['a'])
  })

  it('filters by whatsappFilter', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'A', hasWhatsappConsent: true },
        { identifier: 'b', patientName: 'B', hasWhatsappConsent: false },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setWhatsappFilter('HAS_CONSENT'))
    expect(result.current.filteredItems.map((i) => i.identifier)).toEqual(['a'])
  })

  it('clearFilters resets every filter and hasFilters becomes false', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([{ identifier: 'a', patientName: 'A', priority: 'HIGH' }]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSearch('x')
      result.current.setReasonFilter('INACTIVE')
      result.current.setPriorityFilter('HIGH')
      result.current.setWhatsappFilter('HAS_CONSENT')
    })
    expect(result.current.hasFilters).toBe(true)

    act(() => result.current.clearFilters())
    expect(result.current.hasFilters).toBe(false)
    expect(result.current.search).toBe('')
    expect(result.current.reasonFilter).toBe('ALL')
    expect(result.current.priorityFilter).toBe('ALL')
    expect(result.current.whatsappFilter).toBe('ALL')
  })

  it('has no filters and returns all items by default', async () => {
    mockGetAttention.mockResolvedValue(
      makeCustomResponse([
        { identifier: 'a', patientName: 'A' },
        { identifier: 'b', patientName: 'B' },
      ]),
    )
    const { result } = renderHook(() => usePatientsAttention())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasFilters).toBe(false)
    expect(result.current.filteredItems).toHaveLength(2)
  })
})
