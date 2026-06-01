import { act, renderHook, waitFor } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { useStockCopilot } from '@/features/inventory/hooks/useStockCopilot'
import type { StockCopilotResult } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

// ── Service mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/services/stock-copilot.service', () => ({
  checkCopilotCache: vi.fn(),
  generateCopilotSummary: vi.fn(),
}))

import {
  checkCopilotCache,
  generateCopilotSummary,
} from '@/features/inventory/services/stock-copilot.service'

const mockCheckCopilotCache = vi.mocked(checkCopilotCache)
const mockGenerateCopilotSummary = vi.mocked(generateCopilotSummary)

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCopilotResult(overrides: Partial<StockCopilotResult> = {}): StockCopilotResult {
  return {
    summary: 'Seu estoque precisa de atenção.',
    highlights: ['2 itens críticos.'],
    recommendedActions: ['Comprar luvas urgentemente.'],
    generatedAt: '2026-05-15T14:30:00.000Z', // a previous day
    cached: true,
    source: 'CACHE',
    purchaseListSnapshot: {
      totalItems: 2,
      criticalItems: 1,
      highPriorityItems: 1,
      mediumPriorityItems: 0,
      totalEstimatedCostCents: 5000,
    },
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useStockCopilot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Mount: cached result from any date is displayed ──────────────────────

  it('shows a cached result from a previous day on mount', async () => {
    const previousDayResult = buildCopilotResult({
      generatedAt: '2026-05-15T14:30:00.000Z', // generated several days ago
      source: 'CACHE',
    })
    mockCheckCopilotCache.mockResolvedValue(previousDayResult)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(previousDayResult)
    expect(result.current.isPlanBlocked).toBe(false)
    expect(result.current.isQuotaExceeded).toBe(false)
  })

  it('shows result from today on mount', async () => {
    const todayResult = buildCopilotResult({ generatedAt: new Date().toISOString(), source: 'AI' })
    mockCheckCopilotCache.mockResolvedValue(todayResult)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(todayResult)
  })

  // ── Mount: no cache → empty state ────────────────────────────────────────

  it('sets result to null when no cached analysis exists', async () => {
    mockCheckCopilotCache.mockResolvedValue(undefined)

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toBeNull()
  })

  // ── Mount: plan blocked ───────────────────────────────────────────────────

  it('sets isPlanBlocked when checkCopilotCache throws 403', async () => {
    mockCheckCopilotCache.mockRejectedValue(new ApiError('Plano não permite.', 403, null))

    const { result } = renderHook(() => useStockCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.isPlanBlocked).toBe(true)
    expect(result.current.result).toBeNull()
  })

  // ── Generate: updates result ──────────────────────────────────────────────

  it('updates result after handleGenerate is called', async () => {
    mockCheckCopilotCache.mockResolvedValue(undefined)

    const newResult = buildCopilotResult({ source: 'AI', cached: false, generatedAt: new Date().toISOString() })
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

  it('sets isQuotaExceeded when generateCopilotSummary throws 429', async () => {
    mockCheckCopilotCache.mockResolvedValue(undefined)
    mockGenerateCopilotSummary.mockRejectedValue(
      new ApiError('Limite atingido.', 429, null),
    )

    const { result } = renderHook(() => useStockCopilot())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    await act(async () => {
      await result.current.handleGenerate()
    })

    expect(result.current.isQuotaExceeded).toBe(true)
    expect(result.current.result).toBeNull()
  })
})
