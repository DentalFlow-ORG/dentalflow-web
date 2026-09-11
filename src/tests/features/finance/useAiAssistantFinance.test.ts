import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

import { useAiAssistantFinance } from '@/features/finance/hooks/useAiAssistantFinance'

const mockAnalyzeFinanceWithAi = vi.fn()
const mockGetLatestFinanceAnalysis = vi.fn()
vi.mock('@/features/finance/services/finance-ai.service', () => ({
  analyzeFinanceWithAi: (...args: unknown[]) => mockAnalyzeFinanceWithAi(...args),
  getLatestFinanceAnalysis: (...args: unknown[]) => mockGetLatestFinanceAnalysis(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAiAssistantFinance', () => {
  it('ignores a saved-analysis failure after unmount', async () => {
    let reject!: (reason: Error) => void
    mockGetLatestFinanceAnalysis.mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail
      }),
    )
    const { result, unmount } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    unmount()
    await act(async () => reject(new Error('late failure')))
    expect(result.current.savedAnalysis).toBeNull()
    expect(result.current.quota).toBeNull()
    expect(mockAnalyzeFinanceWithAi).not.toHaveBeenCalled()
  })
  it('starts with isLoadingInitial true and no saved analysis', () => {
    mockGetLatestFinanceAnalysis.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    expect(result.current.isLoadingInitial).toBe(true)
    expect(result.current.savedAnalysis).toBeNull()
  })

  it('seeds state from a saved analysis on mount', async () => {
    mockGetLatestFinanceAnalysis.mockResolvedValue({
      data: { sections: [] },
      quota: { allowed: true },
      dataReadiness: { ready: true },
      visibility: 'FULL',
    })
    const { result } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).toEqual({ sections: [] })
    expect(result.current.quota).toEqual({ allowed: true })
    expect(result.current.visibility).toBe('FULL')
  })

  it('leaves state null when there is no saved analysis (null result)', async () => {
    mockGetLatestFinanceAnalysis.mockResolvedValue(null)
    const { result } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).toBeNull()
  })

  it('resets state when the initial fetch rejects', async () => {
    mockGetLatestFinanceAnalysis.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.savedAnalysis).toBeNull()
    expect(result.current.quota).toBeNull()
    expect(result.current.visibility).toBeUndefined()
  })

  it('generates a new analysis and marks visibility FULL', async () => {
    mockGetLatestFinanceAnalysis.mockResolvedValue(null)
    mockAnalyzeFinanceWithAi.mockResolvedValue({
      data: { sections: [{ title: 'x' }] },
      quota: { allowed: true, remaining: 3 },
    })
    const { result } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    const data = await result.current.handleGenerate()
    expect(data).toEqual({ sections: [{ title: 'x' }] })
    expect(mockAnalyzeFinanceWithAi).toHaveBeenCalledWith({
      from: '2026-06-01',
      to: '2026-06-30',
    })
  })

  it('does not update state after unmount when the initial fetch resolves late', async () => {
    let resolveLatest: (value: unknown) => void = () => {}
    mockGetLatestFinanceAnalysis.mockReturnValue(
      new Promise((resolve) => {
        resolveLatest = resolve
      }),
    )
    const { unmount } = renderHook(() => useAiAssistantFinance('2026-06-01', '2026-06-30'))
    unmount()
    expect(() =>
      resolveLatest({ data: {}, quota: {}, dataReadiness: {}, visibility: 'FULL' }),
    ).not.toThrow()
  })
})
