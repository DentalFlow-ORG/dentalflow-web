import { act, renderHook, waitFor } from '@/test-utils/render-utils'

vi.mock('@/features/inventory/services/stock-abnormal-consumption.service', () => ({
  getAbnormalConsumption: vi.fn(),
}))

import { useStockAbnormalConsumption } from '@/features/inventory/hooks/useStockAbnormalConsumption'
import { getAbnormalConsumption } from '@/features/inventory/services/stock-abnormal-consumption.service'
import { ApiError } from '@/services/http'

const mockGetAbnormalConsumption = vi.mocked(getAbnormalConsumption)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStockAbnormalConsumption', () => {
  it('starts in loading state', () => {
    mockGetAbnormalConsumption.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStockAbnormalConsumption())
    expect(result.current.isLoading).toBe(true)
  })

  it('loads data successfully', async () => {
    mockGetAbnormalConsumption.mockResolvedValue({ items: [] } as never)
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ items: [] })
    expect(result.current.error).toBeNull()
    expect(result.current.isPlanBlocked).toBe(false)
  })

  it('sets isPlanBlocked on a 402 ApiError', async () => {
    mockGetAbnormalConsumption.mockRejectedValue(new ApiError('Upgrade required', 402, null))
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isPlanBlocked).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('sets isPlanBlocked on a 403 ApiError', async () => {
    mockGetAbnormalConsumption.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isPlanBlocked).toBe(true)
  })

  it('sets the ApiError message for other API errors', async () => {
    mockGetAbnormalConsumption.mockRejectedValue(new ApiError('Erro interno.', 500, null))
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Erro interno.')
    expect(result.current.isPlanBlocked).toBe(false)
  })

  it('sets a generic error message for a non-ApiError failure', async () => {
    mockGetAbnormalConsumption.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe(
      'Não foi possível carregar a análise de consumo. Tente novamente.',
    )
  })

  it('refetch reloads the data', async () => {
    mockGetAbnormalConsumption.mockResolvedValue({ items: [] } as never)
    const { result } = renderHook(() => useStockAbnormalConsumption())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetAbnormalConsumption).toHaveBeenCalledTimes(1)

    act(() => result.current.refetch())
    await waitFor(() => expect(mockGetAbnormalConsumption).toHaveBeenCalledTimes(2))
  })
})
