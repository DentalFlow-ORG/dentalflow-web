import { useAbnormalConsumptionCopilot } from '@/features/inventory/hooks/useAbnormalConsumptionCopilot'
import { useStockCopilot } from '@/features/inventory/hooks/useStockCopilot'
import {
  generateAbnormalConsumptionCopilotSummary,
  getLatestAbnormalConsumptionSummary,
} from '@/features/inventory/services/stock-abnormal-consumption.service'
import {
  generateCopilotSummary,
  getLatestCopilotSummary,
} from '@/features/inventory/services/stock-copilot.service'
import type { StockCopilotResult } from '@/features/inventory/types/inventory.types'
import { ApiError } from '@/services/http'
import { act, renderHook, waitFor } from '@/test-utils/render-utils'

vi.mock('@/features/inventory/services/stock-copilot.service', () => ({
  getLatestCopilotSummary: vi.fn(),
  generateCopilotSummary: vi.fn(),
}))
vi.mock('@/features/inventory/services/stock-abnormal-consumption.service', () => ({
  getLatestAbnormalConsumptionSummary: vi.fn(),
  generateAbnormalConsumptionCopilotSummary: vi.fn(),
}))

const saved: StockCopilotResult = {
  summary: 'Resumo existente',
  highlights: [],
  recommendedActions: [],
  generatedAt: '2026-06-01T12:00:00Z',
  cached: true,
  source: 'CACHE',
}

describe.each([
  {
    name: 'purchase list',
    useCopilot: useStockCopilot,
    latest: vi.mocked(getLatestCopilotSummary),
    generate: vi.mocked(generateCopilotSummary),
  },
  {
    name: 'abnormal consumption',
    useCopilot: useAbnormalConsumptionCopilot,
    latest: vi.mocked(getLatestAbnormalConsumptionSummary),
    generate: vi.mocked(generateAbnormalConsumptionCopilotSummary),
  },
])('$name copilot lifecycle', ({ useCopilot, latest, generate }) => {
  beforeEach(() => {
    vi.resetAllMocks()
    latest.mockResolvedValue(saved)
    generate.mockResolvedValue({ ...saved, summary: 'Novo resumo', cached: false, source: 'AI' })
  })

  it.each([403, 429, 500])(
    'handles initial HTTP %s without automatically generating',
    async (status) => {
      latest.mockRejectedValue(new ApiError('Limite de acesso', status, null))
      const { result } = renderHook(useCopilot)
      await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
      expect(result.current.isPlanBlocked).toBe(status === 403)
      expect(result.current.isQuotaExceeded).toBe(status === 429)
      expect(result.current.quotaMessage).toBe(status === 429 ? 'Limite de acesso' : null)
      expect(result.current.error).toBeNull()
      expect(generate).not.toHaveBeenCalled()
    },
  )

  it.each([403, 429, 500])(
    'preserves the saved analysis after generation HTTP %s',
    async (status) => {
      generate.mockRejectedValueOnce(new ApiError('Serviço indisponível', status, null))
      const { result } = renderHook(useCopilot)
      await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
      await act(async () => result.current.handleGenerate())
      expect(result.current.result).toEqual(saved)
      expect(result.current.isPlanBlocked).toBe(status === 403)
      expect(result.current.isQuotaExceeded).toBe(status === 429)
      expect(result.current.error).toBe(status === 500 ? 'Serviço indisponível' : null)
      expect(result.current.isGenerating).toBe(false)
      if (status !== 403) {
        await act(async () => result.current.handleGenerate())
        expect(result.current.result?.summary).toBe('Novo resumo')
        expect(result.current.isQuotaExceeded).toBe(false)
        expect(result.current.error).toBeNull()
      }
    },
  )

  it('does not issue a second generation request while one is pending', async () => {
    let resolveGeneration: (value: StockCopilotResult) => void = () => {}
    generate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveGeneration = resolve
      }),
    )
    const { result } = renderHook(useCopilot)
    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false))
    let request: Promise<void> | undefined
    act(() => {
      request = result.current.handleGenerate()
    })
    expect(result.current.isGenerating).toBe(true)
    await act(async () => result.current.handleGenerate())
    expect(generate).toHaveBeenCalledOnce()
    await act(async () => {
      resolveGeneration(saved)
      await request
    })
    expect(result.current.isGenerating).toBe(false)
  })
})
