import { renderHook, waitFor } from '@/test-utils/render-utils'

import { useProductivitySummary } from '@/features/dashboard/hooks/useProductivitySummary'

const mockGetProductivitySummary = vi.fn()

vi.mock('@/features/dashboard/services/productivity.service', () => ({
  getProductivitySummary: () => mockGetProductivitySummary(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProductivitySummary', () => {
  it('starts in a loading state with no data or error', () => {
    mockGetProductivitySummary.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useProductivitySummary())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('loads and exposes the productivity summary', async () => {
    const summary = { totalAppointments: 10 }
    mockGetProductivitySummary.mockResolvedValue(summary)

    const { result } = renderHook(() => useProductivitySummary())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toBe(summary)
    expect(result.current.error).toBeNull()
  })

  it('sets an error message when the fetch fails', async () => {
    mockGetProductivitySummary.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useProductivitySummary())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe(
      'Não foi possível carregar os dados de produtividade. Tente recarregar.',
    )
    expect(result.current.data).toBeNull()
  })
})
