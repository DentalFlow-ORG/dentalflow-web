import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// Recharts uses SVG which JSDOM doesn't support — stub all exports used by the chart
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Area: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
  linearGradient: () => null,
  stop: () => null,
  defs: () => null,
}))

// useTheme is used to derive chart colors
vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

import { IncomeExpensesChart } from '@/features/finance/components/IncomeExpensesChart'
import type { FinanceSummary } from '@/features/finance/types/finance.types'

function makeSummary(overrides: Partial<FinanceSummary['incomeVsExpenses'][0]>[] = []): FinanceSummary {
  return {
    period: { from: '2026-06-01', to: '2026-06-30', groupBy: 'day' },
    kpis: {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      pendingReceivables: 0,
      fixedExpensesTotal: 0,
    },
    incomeVsExpenses: overrides.map((o, i) => ({
      date: `2026-06-0${i + 1}`,
      income: 10000,
      expenses: 5000,
      netProfit: 5000,
      ...o,
    })),
    expensesByCategory: [],
    incomeByService: [],
  }
}

const summaryWithData = makeSummary([
  { date: '2026-06-01', income: 35000, expenses: 15000, netProfit: 20000 },
  { date: '2026-06-15', income: 50000, expenses: 30000, netProfit: 20000 },
  { date: '2026-06-30', income: 20000, expenses: 25000, netProfit: -5000 },
])

const summaryEmpty: FinanceSummary = {
  ...summaryWithData,
  incomeVsExpenses: [],
}

describe('IncomeExpensesChart', () => {
  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders empty state message when no data', () => {
    render(<IncomeExpensesChart summary={summaryEmpty} />)
    expect(
      screen.getByText('Nenhuma movimentação paga neste período.'),
    ).toBeInTheDocument()
  })

  it('does not render the chart when no data', () => {
    const { container } = render(<IncomeExpensesChart summary={summaryEmpty} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  // ── Section label ──────────────────────────────────────────────────────────

  it('renders the "Resumo do período" section label', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('Resumo do período')).toBeInTheDocument()
  })

  // ── Insight cards ──────────────────────────────────────────────────────────

  it('renders the "Último resultado" insight label', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('Último resultado')).toBeInTheDocument()
  })

  it('renders the "Melhor período" insight label', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('Melhor período')).toBeInTheDocument()
  })

  it('renders the "Maior pressão" insight label', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('Maior pressão')).toBeInTheDocument()
  })

  // ── Series toggle buttons ──────────────────────────────────────────────────

  it('renders Entradas toggle button', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    const btn = screen.getByRole('button', { name: /entradas/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders Saídas toggle button', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    const btn = screen.getByRole('button', { name: /saídas/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders Resultado toggle button', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    const btn = screen.getByRole('button', { name: /resultado/i })
    expect(btn).toBeInTheDocument()
  })

  it('all series toggle buttons start with aria-pressed=true', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    const toggles = screen
      .getAllByRole('button')
      .filter((btn) => btn.hasAttribute('aria-pressed'))
    expect(toggles).toHaveLength(3)
    toggles.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  // ── Data table ─────────────────────────────────────────────────────────────

  it('data table area has app-scrollbar class', () => {
    const { container } = render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(container.querySelector('.app-scrollbar')).toBeInTheDocument()
  })

  it('renders data table column headers', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('Data')).toBeInTheDocument()
    // These labels appear both in the series toggle buttons and the table header
    expect(screen.getAllByText('Entradas').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Saídas').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Resultado').length).toBeGreaterThanOrEqual(2)
  })

  it('renders data rows for each period point', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    // "01/06" (bestPoint) and "30/06" (worstPoint) appear both in insight details
    // and data table rows — getAllByText handles the duplicates
    expect(screen.getAllByText('01/06').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('15/06')).toBeInTheDocument()
    expect(screen.getAllByText('30/06').length).toBeGreaterThanOrEqual(2)
  })
})
