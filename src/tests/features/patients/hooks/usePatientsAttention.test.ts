import { renderHook, waitFor } from '@/test-utils/render-utils'
import { usePatientsAttention } from '@/features/patients/hooks/usePatientsAttention'
import {
  __resetAvatarCache,
  setCachedPatientAvatar,
} from '@/features/patients/hooks/usePatientAvatar'
import type { AttentionResponse } from '@/features/patients/types/attention.types'

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
}))

import { getPatientsAttention } from '@/features/patients/services/attention.service'
import { batchGetPatientAvatars } from '@/features/patients/services/patients.service'

const mockGetAttention = vi.mocked(getPatientsAttention)
const mockBatchAvatars = vi.mocked(batchGetPatientAvatars)

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
