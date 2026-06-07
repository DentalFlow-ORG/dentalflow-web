import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// Stable month so internal useState(currentMonth) is deterministic
vi.mock('@/lib/brazil-timezone', () => ({
  brazilCurrentIsoMonth: () => '2026-06',
}))

// MonthPickerInput is a complex date widget — stub with a native input
vi.mock('@/components/common/MonthPickerInput', () => ({
  MonthPickerInput: ({
    value,
    onValueChange,
    className,
  }: {
    value: string
    onValueChange: (v: string) => void
    className?: string
  }) => (
    <input
      type="month"
      data-testid="month-picker"
      value={value}
      className={className}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
}))

import { MonthlyFinanceDiagnosisCard } from '@/features/finance/components/MonthlyFinanceDiagnosisCard'
import type { DiagnosisState } from '@/features/finance/hooks/useMonthlyFinanceDiagnosis'
import type { MonthlyFinanceDiagnosis } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const idleState: DiagnosisState = {
  diagnosis: null,
  isGenerating: false,
  isPlanBlocked: false,
  isQuotaExceeded: false,
  error: null,
}

const generatingState: DiagnosisState = {
  ...idleState,
  isGenerating: true,
}

const planBlockedState: DiagnosisState = {
  ...idleState,
  isPlanBlocked: true,
}

const quotaExceededState: DiagnosisState = {
  ...idleState,
  isQuotaExceeded: true,
}

const errorState: DiagnosisState = {
  ...idleState,
  error: 'Erro interno do servidor.',
}

const mockDiagnosis: MonthlyFinanceDiagnosis = {
  summary: 'Mês com resultado positivo e boa margem.',
  financialHealth: 'HEALTHY',
  highlights: ['Receita acima da meta', 'Despesas controladas'],
  risks: ['Inadimplência levemente elevada'],
  recommendedActions: ['Cobrar recebíveis pendentes'],
  generatedAt: '2026-06-01T10:00:00Z',
  cached: false,
  source: 'AI',
  financeSnapshot: {
    month: '2026-06',
    revenueCents: 5000000,
    expenseCents: 3000000,
    profitCents: 2000000,
    profitMarginPercent: 40,
    transactionCount: 80,
    incomeTransactionCount: 40,
    expenseTransactionCount: 40,
    uncategorizedExpenseCount: 2,
    topExpenseCategories: [],
    cashflowByWeek: [],
    alerts: [],
  },
}

const successState: DiagnosisState = {
  ...idleState,
  diagnosis: mockDiagnosis,
}

function renderCard(
  state: DiagnosisState = idleState,
  onGenerate = vi.fn(),
) {
  return { onGenerate, ...render(<MonthlyFinanceDiagnosisCard state={state} onGenerate={onGenerate} />) }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MonthlyFinanceDiagnosisCard', () => {
  // ── Header ─────────────────────────────────────────────────────────────────

  it('renders the title', () => {
    renderCard()
    expect(screen.getByText('Diagnóstico financeiro mensal')).toBeInTheDocument()
  })

  it('renders the new premium description', () => {
    renderCard()
    expect(
      screen.getByText(
        'Entenda a saúde financeira da clínica, riscos do mês e ações prioritárias para proteger o caixa.',
      ),
    ).toBeInTheDocument()
  })

  // ── Idle state ─────────────────────────────────────────────────────────────

  it('renders idle prompt when no diagnosis and not loading', () => {
    renderCard(idleState)
    expect(screen.getByText(/Diagnóstico não gerado para/)).toBeInTheDocument()
  })

  it('renders the generate button in idle state', () => {
    renderCard(idleState)
    expect(screen.getByRole('button', { name: /gerar diagnóstico/i })).toBeInTheDocument()
  })

  it('generate button calls onGenerate with selectedMonth', () => {
    const { onGenerate } = renderCard(idleState)
    fireEvent.click(screen.getByRole('button', { name: /gerar diagnóstico/i }))
    expect(onGenerate).toHaveBeenCalledWith('2026-06', false)
  })

  // ── Generating state ───────────────────────────────────────────────────────

  it('renders loading spinner when generating', () => {
    renderCard(generatingState)
    expect(screen.getByText(/Analisando dados financeiros/)).toBeInTheDocument()
  })

  it('generate button is absent while generating without a result', () => {
    renderCard(generatingState)
    expect(screen.queryByRole('button', { name: /gerar diagnóstico/i })).not.toBeInTheDocument()
  })

  // ── Plan blocked state ─────────────────────────────────────────────────────

  it('renders plan-blocked message when isPlanBlocked', () => {
    renderCard(planBlockedState)
    expect(
      screen.getByText(/Diagnóstico financeiro mensal disponível nos planos/),
    ).toBeInTheDocument()
  })

  it('plan-blocked state has a bordered container', () => {
    const { container } = renderCard(planBlockedState)
    // The plan-blocked div uses rounded-lg border class
    const box = container.querySelector('.rounded-lg.border')
    expect(box).toBeInTheDocument()
  })

  // ── Quota exceeded state ───────────────────────────────────────────────────

  it('renders quota-exceeded message when isQuotaExceeded', () => {
    renderCard(quotaExceededState)
    expect(
      screen.getByText(/Você atingiu o limite de diagnósticos financeiros deste mês/),
    ).toBeInTheDocument()
  })

  it('quota-exceeded state renders in a styled amber box', () => {
    const { container } = renderCard(quotaExceededState)
    // Must be a div with amber border — not a bare <p>
    const box = container.querySelector('.border-amber-200')
    expect(box).toBeInTheDocument()
    expect(box?.tagName).toBe('DIV')
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders error message when error is set', () => {
    renderCard(errorState)
    expect(screen.getByText('Não foi possível gerar o diagnóstico')).toBeInTheDocument()
    expect(screen.getByText('Erro interno do servidor.')).toBeInTheDocument()
  })

  it('error state has a retry link', () => {
    renderCard(errorState)
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  // ── Success state ──────────────────────────────────────────────────────────

  it('renders health badge in success state', () => {
    renderCard(successState)
    expect(screen.getByText('Situação saudável')).toBeInTheDocument()
  })

  it('renders diagnosis summary text', () => {
    renderCard(successState)
    expect(screen.getByText('Mês com resultado positivo e boa margem.')).toBeInTheDocument()
  })

  it('renders metric card labels in success state', () => {
    renderCard(successState)
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Resultado')).toBeInTheDocument()
    expect(screen.getByText('Margem')).toBeInTheDocument()
  })

  it('renders section headings in success state', () => {
    renderCard(successState)
    expect(screen.getByText('Pontos positivos')).toBeInTheDocument()
    expect(screen.getByText('Pontos de atenção')).toBeInTheDocument()
    expect(screen.getByText('Ações recomendadas')).toBeInTheDocument()
  })

  it('renders highlight items from diagnosis', () => {
    renderCard(successState)
    expect(screen.getByText('Receita acima da meta')).toBeInTheDocument()
  })

  it('renders the refresh button in success state', () => {
    renderCard(successState)
    expect(screen.getByRole('button', { name: /atualizar diagnóstico/i })).toBeInTheDocument()
  })

  it('refresh button calls onGenerate with forceRefresh=true', () => {
    const { onGenerate } = renderCard(successState)
    fireEvent.click(screen.getByRole('button', { name: /atualizar diagnóstico/i }))
    expect(onGenerate).toHaveBeenCalledWith('2026-06', true)
  })
})
