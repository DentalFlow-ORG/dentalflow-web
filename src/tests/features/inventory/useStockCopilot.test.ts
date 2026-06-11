import { act, renderHook, waitFor } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { useStockCopilot } from '@/features/inventory/hooks/useStockCopilot'
import type { StockCopilotResult } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

// ── Service mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/services/stock-copilot.service', () => ({
  getLatestCopilotSummary: vi.fn(),
  generateCopilotSummary: vi.fn(),
}))

import {
  generateCopilotSummary,
  getLatestCopilotSummary,
} from '@/features/inventory/services/stock-copilot.service'

const mockGetLatestCopilotSummary = vi.mocked(getLatestCopilotSummary)
const mockGenerateCopilotSummary = vi.mocked(generateCopilotSummary)

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCopilotResult(overrides: Partial<StockCopilotResult> = {}): StockCopilotResult {
  return {
    summary: 'Seu estoque precisa de atenção.',
    highlights: ['2 itens críticos.'],
    recommendedActions: ['Comprar luvas urgentemente.'],
    generatedAt: '2026-05-15T14:30:00.000Z',
    cached: true,
    source: 'CACHE',
    // purchaseListSnapshot is intentionally omitted — /latest does not include it
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useStockCopilot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Mount: latest persisted analysis is displayed regardless of purchase list ─

  it('shows a persisted result from any previous date on mount', async () => {
    // Key scenario: analysis generated several days ago — must still be visible
    // even if the purchase list is currently empty.
    const persistedResult = buildCopilotResult({
      generatedAt: '2026-05-15T14:30:00.000Z',
      source: 'CACHE',
    })
    mockGetLatestCopilotSummary.mockResolvedValue(persistedResult)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(persistedResult)
    expect(result.current.isPlanBlocked).toBe(false)
    expect(result.current.isQuotaExceeded).toBe(false)
  })

  it('shows result from today on mount', async () => {
    const todayResult = buildCopilotResult({ generatedAt: new Date().toISOString(), source: 'AI' })
    mockGetLatestCopilotSummary.mockResolvedValue(todayResult)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(todayResult)
  })

  // ── Mount: empty state when no analysis exists ────────────────────────────

  it('sets result to null and shows empty state when no analysis has been generated', async () => {
    mockGetLatestCopilotSummary.mockResolvedValue(undefined)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toBeNull()
  })

  // ── Mount: plan blocked ───────────────────────────────────────────────────

  it('sets isPlanBlocked when getLatestCopilotSummary throws 403', async () => {
    mockGetLatestCopilotSummary.mockRejectedValue(new ApiError('Plano não permite.', 403, null))

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.isPlanBlocked).toBe(true)
    expect(result.current.result).toBeNull()
  })

  // ── Generate: updates result, keeps previous on failure ──────────────────

  it('updates result after handleGenerate is called', async () => {
    mockGetLatestCopilotSummary.mockResolvedValue(undefined)

    const newResult = buildCopilotResult({
      source: 'AI',
      cached: false,
      generatedAt: new Date().toISOString(),
    })
    mockGenerateCopilotSummary.mockResolvedValue(newResult)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.result).toBeNull()

    await act(async () => {
      await result.current.handleGenerate()
    })

    expect(result.current.result).toEqual(newResult)
    expect(result.current.isGenerating).toBe(false)
  })

  it('keeps previous result visible when generation fails', async () => {
    const existingResult = buildCopilotResult({ generatedAt: '2026-05-01T10:00:00.000Z' })
    mockGetLatestCopilotSummary.mockResolvedValue(existingResult)
    mockGenerateCopilotSummary.mockRejectedValue(new ApiError('Erro interno.', 500, null))

    const { result } = renderHook(() => useStockCopilot())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    // Previous result is shown
    expect(result.current.result).toEqual(existingResult)

    await act(async () => {
      await result.current.handleGenerate()
    })

    // Previous result is still visible — not cleared on failure
    expect(result.current.result).toEqual(existingResult)
    expect(result.current.error).toBeTruthy()
  })

  it('sets isQuotaExceeded when generateCopilotSummary throws 429', async () => {
    mockGetLatestCopilotSummary.mockResolvedValue(undefined)
    mockGenerateCopilotSummary.mockRejectedValue(new ApiError('Limite atingido.', 429, null))

    const { result } = renderHook(() => useStockCopilot())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    await act(async () => {
      await result.current.handleGenerate()
    })

    expect(result.current.isQuotaExceeded).toBe(true)
    expect(result.current.result).toBeNull()
  })
})
