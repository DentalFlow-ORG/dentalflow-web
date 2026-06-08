import { render, screen, userEvent } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

import { InventoryCopilotCard } from '@/features/inventory/components/InventoryCopilotCard'
import type { InventoryCopilotCardProps } from '@/features/inventory/components/InventoryCopilotCard'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildResult(overrides: Partial<InventoryCopilotCardProps['result'] & object> = {}): NonNullable<InventoryCopilotCardProps['result']> {
  return {
    summary: 'Análise do estoque concluída.',
    highlights: ['Produto A com estoque baixo.'],
    recommendedActions: ['Comprar produto A urgentemente.'],
    generatedAt: '2026-05-15T17:30:00.000Z',
    source: 'CACHE',
    ...overrides,
  }
}

function defaultProps(overrides: Partial<InventoryCopilotCardProps> = {}): InventoryCopilotCardProps {
  return {
    title: 'Copiloto de teste',
    description: 'Descrição do copiloto.',
    planBlockedMessage: 'Disponível nos planos Professional e Premium.',
    result: null,
    isLoadingInitial: false,
    isGenerating: false,
    error: null,
    isPlanBlocked: false,
    isQuotaExceeded: false,
    quotaMessage: null,
    onGenerate: vi.fn(),
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InventoryCopilotCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Header ─────────────────────────────────────────────────────────────────

  it('renders the title and description', () => {
    render(<InventoryCopilotCard {...defaultProps()} />)

    expect(screen.getByText('Copiloto de teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição do copiloto.')).toBeInTheDocument()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows empty state when no result and not generating', () => {
    render(<InventoryCopilotCard {...defaultProps()} />)

    expect(screen.getByText('Nenhuma análise gerada ainda.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gerar nova análise/i })).toBeInTheDocument()
  })

  it('calls onGenerate when generate button is clicked', async () => {
    const onGenerate = vi.fn()
    const user = userEvent.setup()
    render(<InventoryCopilotCard {...defaultProps({ onGenerate })} />)

    await user.click(screen.getByRole('button', { name: /Gerar nova análise/i }))

    expect(onGenerate).toHaveBeenCalledOnce()
  })

  // ── Loading states ─────────────────────────────────────────────────────────

  it('shows initial loading spinner', () => {
    render(<InventoryCopilotCard {...defaultProps({ isLoadingInitial: true })} />)

    expect(screen.getByText(/Verificando resumo/i)).toBeInTheDocument()
  })

  it('shows generating spinner when no result yet', () => {
    render(<InventoryCopilotCard {...defaultProps({ result: null, isGenerating: true })} />)

    expect(screen.getByText(/Gerando resumo com IA/i)).toBeInTheDocument()
  })

  // ── Plan / quota states ────────────────────────────────────────────────────

  it('shows plan-blocked message when isPlanBlocked is true', () => {
    render(<InventoryCopilotCard {...defaultProps({ isPlanBlocked: true })} />)

    expect(screen.getByText('Disponível nos planos Professional e Premium.')).toBeInTheDocument()
  })

  it('shows default quota message when isQuotaExceeded and no quotaMessage', () => {
    render(<InventoryCopilotCard {...defaultProps({ isQuotaExceeded: true })} />)

    expect(screen.getByText(/Limite mensal/i)).toBeInTheDocument()
  })

  it('shows custom quota message when provided', () => {
    render(
      <InventoryCopilotCard
        {...defaultProps({
          isQuotaExceeded: true,
          quotaMessage: 'Você atingiu o limite de 5 análises.',
        })}
      />,
    )

    expect(screen.getByText('Você atingiu o limite de 5 análises.')).toBeInTheDocument()
  })

  it('shows error message when error is present and quota not exceeded', () => {
    render(<InventoryCopilotCard {...defaultProps({ error: 'Falha ao gerar análise.' })} />)

    expect(screen.getByText('Falha ao gerar análise.')).toBeInTheDocument()
  })

  // ── Result display ─────────────────────────────────────────────────────────

  it('renders the analysis summary', () => {
    render(<InventoryCopilotCard {...defaultProps({ result: buildResult() })} />)

    expect(screen.getByText('Análise do estoque concluída.')).toBeInTheDocument()
  })

  it('renders highlights list', () => {
    const result = buildResult({ highlights: ['Produto A baixo.', 'Produto B zerado.'] })
    render(<InventoryCopilotCard {...defaultProps({ result })} />)

    expect(screen.getByText('Produto A baixo.')).toBeInTheDocument()
    expect(screen.getByText('Produto B zerado.')).toBeInTheDocument()
  })

  it('renders recommended actions', () => {
    const result = buildResult({ recommendedActions: ['Comprar produto A.'] })
    render(<InventoryCopilotCard {...defaultProps({ result })} />)

    expect(screen.getByText('Comprar produto A.')).toBeInTheDocument()
  })

  it('keeps result visible while generating a new analysis', () => {
    const result = buildResult()
    render(<InventoryCopilotCard {...defaultProps({ result, isGenerating: true })} />)

    expect(screen.getByText(result.summary)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gerar nova análise/i })).toBeInTheDocument()
  })

  // ── Timestamp and source badge ─────────────────────────────────────────────

  it('shows the generatedAt label', () => {
    render(<InventoryCopilotCard {...defaultProps({ result: buildResult() })} />)

    expect(screen.getByText(/Última análise gerada em/i)).toBeInTheDocument()
  })

  it('formats generatedAt in Brazilian date with "às" separator', () => {
    // 2026-05-15T17:30:00.000Z → 14:30 BRT (UTC-3)
    const result = buildResult({ generatedAt: '2026-05-15T17:30:00.000Z' })
    render(<InventoryCopilotCard {...defaultProps({ result })} />)

    expect(screen.getByText(/15\/05\/2026 às 14:30/)).toBeInTheDocument()
  })

  it('shows "Cache" badge when source is CACHE', () => {
    render(<InventoryCopilotCard {...defaultProps({ result: buildResult({ source: 'CACHE' }) })} />)

    expect(screen.getByText('Cache')).toBeInTheDocument()
  })

  it('shows "IA" badge when source is AI', () => {
    render(<InventoryCopilotCard {...defaultProps({ result: buildResult({ source: 'AI' }) })} />)

    expect(screen.getByText('IA')).toBeInTheDocument()
  })
})
