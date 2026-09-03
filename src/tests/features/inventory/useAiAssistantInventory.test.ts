import { act, renderHook, waitFor } from '@/test-utils/render-utils'

vi.mock('@/features/inventory/services/inventory-ai.service', () => ({
  getLatestInventoryAnalysis: vi.fn(),
  analyzeInventoryWithAi: vi.fn(),
}))

import { useAiAssistantInventory } from '@/features/inventory/hooks/useAiAssistantInventory'
import {
  analyzeInventoryWithAi,
  getLatestInventoryAnalysis,
} from '@/features/inventory/services/inventory-ai.service'

const mockGetLatest = vi.mocked(getLatestInventoryAnalysis)
const mockAnalyze = vi.mocked(analyzeInventoryWithAi)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAiAssistantInventory', () => {
  it('starts in loading state', () => {
    mockGetLatest.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAiAssistantInventory())
    expect(result.current.isLoadingInitial).toBe(true)
    expect(result.current.savedAnalysis).toBeNull()
  })

  it('seeds state from the latest saved analysis on mount', async () => {
    mockGetLatest.mockResolvedValue({
      data: { sections: [], disclaimer: '', generatedAt: '2026-01-01', model: 'x' },
      quota: { allowed: true } as never,
      dataReadiness: { ready: true } as never,
      visibility: 'FULL',
    })
    const { result } = renderHook(() => useAiAssistantInventory())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).not.toBeNull()
    expect(result.current.visibility).toBe('FULL')
  })

  it('resets state when the latest analysis request resolves with no result', async () => {
    mockGetLatest.mockResolvedValue(null)
    const { result } = renderHook(() => useAiAssistantInventory())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).toBeNull()
    expect(result.current.quota).toBeNull()
  })

  it('resets state when the latest analysis request rejects', async () => {
    mockGetLatest.mockRejectedValue(new Error('network error'))
    const { result } = renderHook(() => useAiAssistantInventory())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).toBeNull()
    expect(result.current.dataReadiness).toBeNull()
    expect(result.current.visibility).toBeUndefined()
  })

  it('does not update state after unmount', async () => {
    let resolveLatest: (value: Awaited<ReturnType<typeof getLatestInventoryAnalysis>>) => void =
      () => {}
    mockGetLatest.mockReturnValue(
      new Promise((resolve) => {
        resolveLatest = resolve
      }),
    )
    const { result, unmount } = renderHook(() => useAiAssistantInventory())
    unmount()
    resolveLatest({
      data: { sections: [], disclaimer: '', generatedAt: '2026-01-01', model: 'x' },
      quota: { allowed: true } as never,
      dataReadiness: { ready: true },
      visibility: 'FULL',
    })
    await new Promise((r) => setTimeout(r, 0))
    expect(result.current.isLoadingInitial).toBe(true)
  })

  it('handleGenerate calls analyzeInventoryWithAi and sets state to FULL visibility', async () => {
    mockGetLatest.mockResolvedValue(null)
    const analysisData = { sections: [], disclaimer: '', generatedAt: '2026-01-01', model: 'x' }
    mockAnalyze.mockResolvedValue({ data: analysisData, quota: { allowed: true } as never })

    const { result } = renderHook(() => useAiAssistantInventory())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    await act(async () => {
      const data = await result.current.handleGenerate()
      expect(data).toEqual(analysisData)
    })

    expect(result.current.savedAnalysis).toEqual(analysisData)
    expect(result.current.visibility).toBe('FULL')
  })
})
