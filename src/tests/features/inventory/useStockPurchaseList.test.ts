import { act, renderHook, waitFor } from '@/test-utils/render-utils'

vi.mock('@/features/inventory/services/inventory.service', () => ({
  getStockPurchaseList: vi.fn(),
}))

import { useStockPurchaseList } from '@/features/inventory/hooks/useStockPurchaseList'
import { getStockPurchaseList } from '@/features/inventory/services/inventory.service'
import { ApiError } from '@/services/http'

const mockGetStockPurchaseList = vi.mocked(getStockPurchaseList)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStockPurchaseList', () => {
  it('starts in loading state', () => {
    mockGetStockPurchaseList.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useStockPurchaseList())
    expect(result.current.isLoading).toBe(true)
  })

  it('loads data successfully', async () => {
    mockGetStockPurchaseList.mockResolvedValue({ items: [] } as never)
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ items: [] })
    expect(result.current.error).toBeNull()
    expect(result.current.isPlanBlocked).toBe(false)
  })

  it('sets isPlanBlocked on a 402 ApiError', async () => {
    mockGetStockPurchaseList.mockRejectedValue(new ApiError('Upgrade required', 402, null))
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isPlanBlocked).toBe(true)
  })

  it('sets isPlanBlocked on a 403 ApiError', async () => {
    mockGetStockPurchaseList.mockRejectedValue(new ApiError('Forbidden', 403, null))
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isPlanBlocked).toBe(true)
  })

  it('sets the ApiError message for other API errors', async () => {
    mockGetStockPurchaseList.mockRejectedValue(new ApiError('Erro interno.', 500, null))
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Erro interno.')
  })

  it('sets a generic error message for a non-ApiError failure', async () => {
    mockGetStockPurchaseList.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe(
      'Não foi possível carregar a lista de compras. Tente novamente.',
    )
  })

  it('refetch reloads the data', async () => {
    mockGetStockPurchaseList.mockResolvedValue({ items: [] } as never)
    const { result } = renderHook(() => useStockPurchaseList())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetStockPurchaseList).toHaveBeenCalledTimes(1)

    act(() => result.current.refetch())
    await waitFor(() => expect(mockGetStockPurchaseList).toHaveBeenCalledTimes(2))
  })
})
