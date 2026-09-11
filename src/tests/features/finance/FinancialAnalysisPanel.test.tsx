import { act, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

const analysisMocks = vi.hoisted(() => ({ role: 'OWNER' as string | null, useAnalysis: vi.fn() }))
// Mock the hook so the component doesn't hit the network
vi.mock('@/features/finance/hooks/useAiAssistantFinance', () => ({
  useAiAssistantFinance: (...args: unknown[]) => analysisMocks.useAnalysis(...args),
}))

// Mock AiAssistantCard to capture the props passed to it
vi.mock('@/components/common/AiAssistantCard', () => ({
  AiAssistantCard: ({
    title,
    description,
    type,
    canGenerate,
    isLoadingInitial,
    disabledReason,
  }: {
    title: string
    description: string
    type: string
    canGenerate?: boolean
    isLoadingInitial?: boolean
    disabledReason?: string
  }) => (
    <div data-testid="ai-assistant-card">
      <span data-testid="ai-title">{title}</span>
      <span data-testid="ai-description">{description}</span>
      <span data-testid="ai-type">{type}</span>
      <span data-testid="ai-can-generate">{String(canGenerate)}</span>
      <span data-testid="ai-loading-initial">{String(isLoadingInitial)}</span>
      {disabledReason && <p role="alert">{disabledReason}</p>}
    </div>
  ),
}))

// Mock useAuth — component uses isOwner = user?.role === 'OWNER'
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: analysisMocks.role ? { role: analysisMocks.role } : null }),
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

beforeEach(() => {
  analysisMocks.role = 'OWNER'
  analysisMocks.useAnalysis.mockReturnValue({
    savedAnalysis: null,
    quota: null,
    dataReadiness: null,
    visibility: undefined,
    isLoadingInitial: false,
    handleGenerate: vi.fn(),
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  window.history.replaceState(null, '', window.location.pathname)
})

describe('FinancialAnalysisPanel', () => {
  it.each(['DENTIST', 'ASSISTANT', null])('does not enable generation for role %s', (role) => {
    analysisMocks.role = role
    renderPanel()
    expect(screen.getByTestId('ai-can-generate')).toHaveTextContent('false')
  })

  it.each([true, false])('forwards readiness restrictions when ready=%s', (ready) => {
    analysisMocks.useAnalysis.mockReturnValue({
      dataReadiness: { ready, reason: 'Registre movimentações no período.' },
      isLoadingInitial: true,
    })
    renderPanel()
    expect(screen.getByTestId('ai-loading-initial')).toHaveTextContent('true')
    if (ready) expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    else expect(screen.getByRole('alert')).toHaveTextContent('Registre movimentações no período.')
  })

  it.each(['#ai-analysis', '#finance-ai'])(
    'focuses the requested analysis anchor %s after loading',
    async (hash) => {
      vi.useFakeTimers()
      window.history.replaceState(null, '', hash)
      const scroll = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
      renderPanel()
      await act(async () => vi.advanceTimersByTimeAsync(0))
      expect(document.getElementById('ai-analysis')).toHaveFocus()
      expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    },
  )
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
