import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockGetPatientClinicalTimeline = vi.fn()
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  getPatientClinicalTimeline: (...args: unknown[]) => mockGetPatientClinicalTimeline(...args),
}))

import { usePatientClinicalTimeline } from '@/features/clinical-records/hooks/usePatientClinicalTimeline'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usePatientClinicalTimeline', () => {
  it('stays idle (not loading, empty) when identifier is null', () => {
    const { result } = renderHook(() => usePatientClinicalTimeline(null))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.records).toEqual([])
    expect(mockGetPatientClinicalTimeline).not.toHaveBeenCalled()
  })

  it('loads the timeline when identifier is provided', async () => {
    mockGetPatientClinicalTimeline.mockResolvedValue({ records: [{ id: 'r1' }] })
    const { result } = renderHook(() => usePatientClinicalTimeline('123'))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.records).toEqual([{ id: 'r1' }])
  })

  it('sets an error message on failure', async () => {
    mockGetPatientClinicalTimeline.mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => usePatientClinicalTimeline('123'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar o histórico clínico.')
  })

  it('reloads when the identifier changes', async () => {
    mockGetPatientClinicalTimeline.mockResolvedValue({ records: [{ id: 'r1' }] })
    const { result, rerender } = renderHook(
      ({ identifier }: { identifier: string | null }) => usePatientClinicalTimeline(identifier),
      { initialProps: { identifier: '123' as string | null } },
    )
    await waitFor(() => expect(result.current.records).toEqual([{ id: 'r1' }]))

    mockGetPatientClinicalTimeline.mockResolvedValue({ records: [{ id: 'r2' }] })
    rerender({ identifier: '456' })
    await waitFor(() => expect(result.current.records).toEqual([{ id: 'r2' }]))
  })

  it('goes idle when the identifier changes to null', async () => {
    mockGetPatientClinicalTimeline.mockResolvedValue({ records: [{ id: 'r1' }] })
    const { result, rerender } = renderHook(
      ({ identifier }: { identifier: string | null }) => usePatientClinicalTimeline(identifier),
      { initialProps: { identifier: '123' as string | null } },
    )
    await waitFor(() => expect(result.current.records).toEqual([{ id: 'r1' }]))

    rerender({ identifier: null })
    expect(result.current.records).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('ignores a stale response after unmount', async () => {
    let resolve: (v: unknown) => void = () => {}
    mockGetPatientClinicalTimeline.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result, unmount } = renderHook(() => usePatientClinicalTimeline('123'))
    unmount()
    resolve({ records: [{ id: 'r1' }] })
    expect(result.current.records).toEqual([])
  })

  it('ignores a previous patient request failure after the current patient loads', async () => {
    let reject!: (reason: Error) => void
    mockGetPatientClinicalTimeline
      .mockReturnValueOnce(
        new Promise((_, fail) => {
          reject = fail
        }),
      )
      .mockResolvedValueOnce({ records: [{ id: 'current-patient-record' }] })
    const { result, rerender } = renderHook(
      ({ identifier }) => usePatientClinicalTimeline(identifier),
      {
        initialProps: { identifier: 'old-patient' },
      },
    )
    rerender({ identifier: 'current-patient' })
    await waitFor(() => expect(result.current.records).toEqual([{ id: 'current-patient-record' }]))
    await act(async () => {
      reject(new Error('late failure'))
    })
    expect(result.current.records).toEqual([{ id: 'current-patient-record' }])
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })
})
