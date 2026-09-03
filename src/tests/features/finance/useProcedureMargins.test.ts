import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { useProcedureMargins } from '@/features/finance/hooks/useProcedureMargins'
import { ApiError } from '@/services/http'

const mockFetchProcedureMargins = vi.fn()
vi.mock('@/features/finance/services/finance-analytics.service', () => ({
  fetchProcedureMargins: (...args: unknown[]) => mockFetchProcedureMargins(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProcedureMargins', () => {
  it('starts idle with no data', () => {
    const { result } = renderHook(() => useProcedureMargins())
    expect(result.current.state).toEqual({
      data: null,
      isLoading: false,
      isPlanBlocked: false,
      error: null,
    })
  })

  it('loads data successfully', async () => {
    mockFetchProcedureMargins.mockResolvedValue({ items: [] })
    const { result } = renderHook(() => useProcedureMargins())
    act(() => {
      result.current.load({ month: '2026-06' })
    })
    expect(result.current.state.isLoading).toBe(true)
    await waitFor(() => expect(result.current.state.isLoading).toBe(false))
    expect(result.current.state.data).toEqual({ items: [] })
    expect(result.current.state.error).toBeNull()
    expect(mockFetchProcedureMargins).toHaveBeenCalledWith({ month: '2026-06' })
  })

  it('sets isPlanBlocked on a 403 ApiError', async () => {
    mockFetchProcedureMargins.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useProcedureMargins())
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.state.isPlanBlocked).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
  })

  it('sets a generic error message for a non-Error rejection', async () => {
    mockFetchProcedureMargins.mockRejectedValue('boom')
    const { result } = renderHook(() => useProcedureMargins())
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.state.error).toBe('Erro ao carregar margens por procedimento.')
  })

  it('sets the Error message when rejected with a generic Error', async () => {
    mockFetchProcedureMargins.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useProcedureMargins())
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.state.error).toBe('network down')
  })

  it('resets isPlanBlocked and error on a new load call', async () => {
    mockFetchProcedureMargins.mockRejectedValueOnce(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useProcedureMargins())
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.state.isPlanBlocked).toBe(true)

    mockFetchProcedureMargins.mockResolvedValueOnce({ items: [] })
    await act(async () => {
      await result.current.load()
    })
    expect(result.current.state.isPlanBlocked).toBe(false)
  })
})
