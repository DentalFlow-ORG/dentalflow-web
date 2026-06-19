import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// Mock the hook so the component doesn't hit the network
vi.mock('@/features/finance/hooks/useAiAssistantFinance', () => ({
  useAiAssistantFinance: () => ({
    savedAnalysis: null,
    quota: null,
    dataReadiness: null,
    visibility: undefined,
    isLoadingInitial: false,
    handleGenerate: vi.fn(),
  }),
}))

// Mock AiAssistantCard to capture the props passed to it
vi.mock('@/components/common/AiAssistantCard', () => ({
  AiAssistantCard: ({
    title,
    description,
    type,
    canGenerate,
    isLoadingInitial,
  }: {
    title: string
    description: string
    type: string
    canGenerate?: boolean
    isLoadingInitial?: boolean
  }) => (
    <div data-testid="ai-assistant-card">
      <span data-testid="ai-title">{title}</span>
      <span data-testid="ai-description">{description}</span>
      <span data-testid="ai-type">{type}</span>
      <span data-testid="ai-can-generate">{String(canGenerate)}</span>
      <span data-testid="ai-loading-initial">{String(isLoadingInitial)}</span>
    </div>
  ),
}))

// Mock useAuth — component uses isOwner = user?.role === 'OWNER'
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'OWNER' } }),
}))

import { FinancialAnalysisPanel } from '@/features/finance/components/FinancialAnalysisPanel'
import type { FinanceSummary } from '@/features/finance/types/finance.types'

const mockSummary: FinanceSummary = {
  period: { from: '2026-06-01', to: '2026-06-30', groupBy: 'day' },
  kpis: {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    pendingReceivables: 0,
    fixedExpensesTotal: 0,
  },
  incomeVsExpenses: [],
  expensesByCategory: [],
  incomeByService: [],
}

function renderPanel() {
  return render(<FinancialAnalysisPanel summary={mockSummary} />)
}

describe('FinancialAnalysisPanel', () => {
  // ── Premium copy ───────────────────────────────────────────────────────────

  it('renders the premium title', () => {
    renderPanel()
    expect(screen.getByTestId('ai-title')).toHaveTextContent('Análise inteligente do período')
  })

  it('renders the premium description', () => {
    renderPanel()
    expect(screen.getByTestId('ai-description')).toHaveTextContent(
      'Receba recomendações práticas para aumentar receita, reduzir custos e priorizar cobranças.',
    )
  })

  // ── Prop forwarding ────────────────────────────────────────────────────────

  it('passes type="finance" to AiAssistantCard', () => {
    renderPanel()
    expect(screen.getByTestId('ai-type')).toHaveTextContent('finance')
  })

  it('passes canGenerate=true when user is OWNER', () => {
    renderPanel()
    expect(screen.getByTestId('ai-can-generate')).toHaveTextContent('true')
  })

  it('passes isLoadingInitial from the hook', () => {
    renderPanel()
    expect(screen.getByTestId('ai-loading-initial')).toHaveTextContent('false')
  })

  // ── Structure ──────────────────────────────────────────────────────────────

  it('renders the AiAssistantCard', () => {
    renderPanel()
    expect(screen.getByTestId('ai-assistant-card')).toBeInTheDocument()
  })

  it('wraps content in a scroll-anchor div with id=ai-analysis', () => {
    const { container } = renderPanel()
    expect(container.querySelector('#ai-analysis')).toBeInTheDocument()
  })
})
