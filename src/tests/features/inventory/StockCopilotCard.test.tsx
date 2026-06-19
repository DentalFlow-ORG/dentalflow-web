import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import type { StockCopilotResult } from '@/features/inventory/types/inventory.types'

// ── Hook mock ─────────────────────────────────────────────────────────────────

vi.mock('@/features/inventory/hooks/useStockCopilot', () => ({
  useStockCopilot: vi.fn(),
}))

// Link from @tanstack/react-router is used only in the plan-blocked branch.
// Stub it so the import doesn't require a full router context in unit tests.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

import { StockCopilotCard } from '@/features/inventory/components/StockCopilotCard'
import { useStockCopilot } from '@/features/inventory/hooks/useStockCopilot'

const mockUseStockCopilot = vi.mocked(useStockCopilot)

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildResult(overrides: Partial<StockCopilotResult> = {}): StockCopilotResult {
  return {
    summary: 'Seu estoque precisa de atenção em alguns itens.',
    highlights: ['2 produtos em estoque crítico.'],
    recommendedActions: ['Comprar luvas cirúrgicas urgentemente.'],
    generatedAt: '2026-05-15T17:30:00.000Z',
    cached: true,
    source: 'CACHE',
    ...overrides,
  }
}

function defaultHookState(overrides: Partial<ReturnType<typeof useStockCopilot>> = {}) {
  return {
    result: null,
    isLoadingInitial: false,
    isGenerating: false,
    error: null,
    isPlanBlocked: false,
    isQuotaExceeded: false,
    quotaMessage: null,
    handleGenerate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useStockCopilot>
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StockCopilotCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows empty state text when no analysis exists', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result: null }))
    render(<StockCopilotCard />)
    expect(screen.getByText('Nenhuma análise gerada ainda.')).toBeInTheDocument()
  })

  it('shows the generate button in empty state', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result: null }))
    render(<StockCopilotCard />)
    expect(screen.getByRole('button', { name: /Gerar nova análise/i })).toBeInTheDocument()
  })

  // ── Result display ─────────────────────────────────────────────────────────

  it('shows the analysis summary when a result is available', () => {
    const result = buildResult({ summary: 'Estoque em situação crítica em 2 produtos.' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText('Estoque em situação crítica em 2 produtos.')).toBeInTheDocument()
  })

  it('shows a highlights list when the result includes highlights', () => {
    const result = buildResult({ highlights: ['Produto A zerado.', 'Produto B baixo.'] })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText('Produto A zerado.')).toBeInTheDocument()
    expect(screen.getByText('Produto B baixo.')).toBeInTheDocument()
  })

  it('shows recommended actions when the result includes them', () => {
    const result = buildResult({ recommendedActions: ['Comprar luvas urgentemente.'] })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText('Comprar luvas urgentemente.')).toBeInTheDocument()
  })

  // ── Brazilian date/time format ─────────────────────────────────────────────

  it('shows the generatedAt label in Portuguese', () => {
    const result = buildResult({ generatedAt: '2026-05-15T17:30:00.000Z' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    // The label prefix must always be present when a result exists.
    expect(screen.getByText(/Última análise gerada em/i)).toBeInTheDocument()
  })

  it('displays the generatedAt date in Brazilian DD/MM/YYYY format', () => {
    // 2026-05-15T17:30:00.000Z is 14:30 BRT (UTC-3); so the date remains 15/05/2026.
    const result = buildResult({ generatedAt: '2026-05-15T17:30:00.000Z' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    // Match the day/month/year portion of the Brazilian date format.
    expect(screen.getByText(/15\/05\/2026/)).toBeInTheDocument()
  })

  it('displays the generatedAt time in HH:mm format', () => {
    // 2026-05-15T17:30:00.000Z → 14:30 BRT
    const result = buildResult({ generatedAt: '2026-05-15T17:30:00.000Z' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/14:30/)).toBeInTheDocument()
  })

  it('uses "às" as the separator between date and time', () => {
    const result = buildResult({ generatedAt: '2026-05-15T17:30:00.000Z' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/15\/05\/2026 às 14:30/)).toBeInTheDocument()
  })

  // ── Source badge ───────────────────────────────────────────────────────────

  it('shows "Cache" badge when source is CACHE', () => {
    const result = buildResult({ source: 'CACHE' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText('Cache')).toBeInTheDocument()
  })

  it('shows "IA" badge when source is AI', () => {
    const result = buildResult({ source: 'AI' })
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result }))
    render(<StockCopilotCard />)
    expect(screen.getByText('IA')).toBeInTheDocument()
  })

  // ── Loading / generating states ────────────────────────────────────────────

  it('shows loading text during initial fetch', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ isLoadingInitial: true }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/Verificando resumo/i)).toBeInTheDocument()
  })

  it('shows generating text when no result exists and generation is in progress', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result: null, isGenerating: true }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/Gerando resumo com IA/i)).toBeInTheDocument()
  })

  it('keeps the result visible while generating a new analysis', () => {
    const result = buildResult()
    mockUseStockCopilot.mockReturnValue(defaultHookState({ result, isGenerating: true }))
    render(<StockCopilotCard />)
    // The previous result must remain visible — not replaced by a spinner.
    expect(screen.getByText(result.summary)).toBeInTheDocument()
    // Refresh button should be in the document (spinning state).
    expect(screen.getByRole('button', { name: /Gerar nova análise/i })).toBeInTheDocument()
  })

  // ── Plan / quota states ────────────────────────────────────────────────────

  it('shows plan-blocked message when isPlanBlocked is true', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ isPlanBlocked: true }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/Professional e Premium/i)).toBeInTheDocument()
  })

  it('shows quota-exceeded message when isQuotaExceeded is true', () => {
    mockUseStockCopilot.mockReturnValue(defaultHookState({ isQuotaExceeded: true }))
    render(<StockCopilotCard />)
    expect(screen.getByText(/Limite mensal/i)).toBeInTheDocument()
  })

  it('shows a custom quota message when provided', () => {
    mockUseStockCopilot.mockReturnValue(
      defaultHookState({
        isQuotaExceeded: true,
        quotaMessage: 'Você atingiu o limite de 10 análises este mês.',
      }),
    )
    render(<StockCopilotCard />)
    expect(screen.getByText('Você atingiu o limite de 10 análises este mês.')).toBeInTheDocument()
  })

  it('shows error message when generation fails', () => {
    mockUseStockCopilot.mockReturnValue(
      defaultHookState({ error: 'Não foi possível gerar a análise.' }),
    )
    render(<StockCopilotCard />)
    expect(screen.getByText('Não foi possível gerar a análise.')).toBeInTheDocument()
  })
})
