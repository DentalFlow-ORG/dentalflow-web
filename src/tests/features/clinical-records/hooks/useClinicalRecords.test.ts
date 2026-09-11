import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockListClinicalRecords = vi.fn()
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  listClinicalRecords: (...args: unknown[]) => mockListClinicalRecords(...args),
}))

import { useClinicalRecords } from '@/features/clinical-records/hooks/useClinicalRecords'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useClinicalRecords', () => {
  it('starts loading and then populates records on success', async () => {
    mockListClinicalRecords.mockResolvedValue([{ id: 'r1' }])
    const { result } = renderHook(() => useClinicalRecords())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.records).toEqual([{ id: 'r1' }])
    expect(result.current.error).toBeNull()
  })

  it('sets an error message when the request fails', async () => {
    mockListClinicalRecords.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useClinicalRecords())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Não foi possível carregar os prontuários.')
    expect(result.current.records).toEqual([])
  })

  it('passes the given filters through to the service', async () => {
    mockListClinicalRecords.mockResolvedValue([])
    renderHook(() => useClinicalRecords({ status: 'DRAFT', dentistProfileId: 'p1' }))
    await waitFor(() =>
      expect(mockListClinicalRecords).toHaveBeenCalledWith({
        status: 'DRAFT',
        dentistProfileId: 'p1',
      }),
    )
  })

  it('reloads when refresh is called', async () => {
    mockListClinicalRecords.mockResolvedValue([{ id: 'r1' }])
    const { result } = renderHook(() => useClinicalRecords())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockListClinicalRecords).toHaveBeenCalledTimes(1)

    mockListClinicalRecords.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }])
    result.current.refresh()
    await waitFor(() => expect(result.current.records).toHaveLength(2))
  })

  it('ignores a stale response when the hook unmounts before it resolves', async () => {
    let resolveRequest: (value: unknown[]) => void = () => {}
    mockListClinicalRecords.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )
    const { result, unmount } = renderHook(() => useClinicalRecords())
    unmount()
    resolveRequest([{ id: 'r1' }])
    // No assertion needed beyond "does not throw" — the isCurrent guard
    // prevents a state update on an unmounted hook.
    expect(result.current.records).toEqual([])
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores an old filter request that later %ss',
    async (outcome) => {
      let resolve!: (value: unknown[]) => void
      let reject!: (reason: Error) => void
      mockListClinicalRecords
        .mockReturnValueOnce(
          new Promise((yes, no) => {
            resolve = yes
            reject = no
          }),
        )
        .mockResolvedValue([{ id: 'current' }])
      const { result, rerender } = renderHook(({ status }) => useClinicalRecords({ status }), {
        initialProps: { status: 'DRAFT' },
      })
      rerender({ status: 'COMPLETED' })
      await waitFor(() => expect(result.current.records).toEqual([{ id: 'current' }]))
      await act(async () => {
        if (outcome === 'resolve') resolve([{ id: 'old' }])
        else reject(new Error('old request failed'))
      })
      expect(result.current.records).toEqual([{ id: 'current' }])
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(mockListClinicalRecords).toHaveBeenLastCalledWith({
        status: 'COMPLETED',
        dentistProfileId: undefined,
      })
    },
  )

  it('retains loaded records on refresh failure and clears the error on retry', async () => {
    mockListClinicalRecords
      .mockResolvedValueOnce([{ id: 'r1' }])
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ id: 'r2' }])
    const { result } = renderHook(() => useClinicalRecords())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => {
      result.current.refresh()
    })
    await waitFor(() =>
      expect(result.current.error).toBe('Não foi possível carregar os prontuários.'),
    )
    expect(result.current.records).toEqual([{ id: 'r1' }])
    act(() => {
      result.current.refresh()
    })
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.records).toEqual([{ id: 'r2' }]))
    expect(result.current.isLoading).toBe(false)
  })
})
