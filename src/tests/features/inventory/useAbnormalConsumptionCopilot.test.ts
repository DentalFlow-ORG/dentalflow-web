import { act, renderHook, waitFor } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { useAbnormalConsumptionCopilot } from '@/features/inventory/hooks/useAbnormalConsumptionCopilot'
import type { AbnormalConsumptionCopilotResult } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'

// ── Service mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/services/stock-abnormal-consumption.service', () => ({
  getLatestAbnormalConsumptionSummary: vi.fn(),
  generateAbnormalConsumptionCopilotSummary: vi.fn(),
}))

import {
  getLatestAbnormalConsumptionSummary,
  generateAbnormalConsumptionCopilotSummary,
} from '@/features/inventory/services/stock-abnormal-consumption.service'

const mockGetLatest = vi.mocked(getLatestAbnormalConsumptionSummary)
const mockGenerate = vi.mocked(generateAbnormalConsumptionCopilotSummary)

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildResult(overrides: Partial<AbnormalConsumptionCopilotResult> = {}): AbnormalConsumptionCopilotResult {
  return {
    summary: 'Consumo dentro do padrão na maioria dos produtos.',
    highlights: ['Produto X com pico de saída.'],
    recommendedActions: ['Investigar movimentações do produto X.'],
    generatedAt: '2026-05-20T09:00:00.000Z',
    cached: true,
    source: 'CACHE',
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAbnormalConsumptionCopilot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Mount: latest persisted analysis is displayed ─────────────────────────

  it('shows a persisted result from any previous date on mount', async () => {
    const persistedResult = buildResult({ generatedAt: '2026-05-20T09:00:00.000Z', source: 'CACHE' })
    mockGetLatest.mockResolvedValue(persistedResult)

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(persistedResult)
    expect(result.current.isPlanBlocked).toBe(false)
    expect(result.current.isQuotaExceeded).toBe(false)
  })

  it('shows result from today on mount', async () => {
    const todayResult = buildResult({ generatedAt: new Date().toISOString(), source: 'AI' })
    mockGetLatest.mockResolvedValue(todayResult)

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(todayResult)
  })

  // ── Mount: empty state when no analysis exists ────────────────────────────

  it('sets result to null when no analysis has been generated', async () => {
    mockGetLatest.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toBeNull()
  })

  // ── Mount: plan blocked ───────────────────────────────────────────────────

  it('sets isPlanBlocked when getLatestAbnormalConsumptionSummary throws 403', async () => {
    mockGetLatest.mockRejectedValue(new ApiError('Plano não permite.', 403, null))

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.isPlanBlocked).toBe(true)
    expect(result.current.result).toBeNull()
  })

  // ── Generate: updates result, keeps previous on failure ──────────────────

  it('updates result after handleGenerate is called', async () => {
    mockGetLatest.mockResolvedValue(undefined)

    const newResult = buildResult({ source: 'AI', cached: false, generatedAt: new Date().toISOString() })
    mockGenerate.mockResolvedValue(newResult)

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    expect(result.current.result).toBeNull()

    await act(async () => {
      await result.current.handleGenerate()
    })

    expect(result.current.result).toEqual(newResult)
    expect(result.current.isGenerating).toBe(false)
  })

  it('keeps previous result visible when generation fails', async () => {
    const existingResult = buildResult({ generatedAt: '2026-05-01T10:00:00.000Z' })
    mockGetLatest.mockResolvedValue(existingResult)
    mockGenerate.mockRejectedValue(new ApiError('Erro interno.', 500, null))

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    expect(result.current.result).toEqual(existingResult)

    await act(async () => {
      await result.current.handleGenerate()
    })

    // Previous result must survive the failure
    expect(result.current.result).toEqual(existingResult)
    expect(result.current.error).toBeTruthy()
  })

  it('sets isQuotaExceeded when generateAbnormalConsumptionCopilotSummary throws 429', async () => {
    mockGetLatest.mockResolvedValue(undefined)
    mockGenerate.mockRejectedValue(new ApiError('Limite atingido.', 429, null))

    const { result } = renderHook(() => useAbnormalConsumptionCopilot())
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))

    await act(async () => {
      await result.current.handleGenerate()
    })

    expect(result.current.isQuotaExceeded).toBe(true)
    expect(result.current.result).toBeNull()
  })
})
