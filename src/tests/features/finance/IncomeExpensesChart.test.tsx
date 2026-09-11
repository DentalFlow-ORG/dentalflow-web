import { render, screen, userEvent } from '@/test-utils/render-utils'
import { type ReactElement, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { vi } from 'vitest'

const tooltipState = vi.hoisted(() => ({
  active: false,
  payload: [] as Array<{
    name: string
    value: number
    color?: string
    payload?: { fullDate: string }
  }>,
}))
let mockTheme = 'light'

beforeEach(() => {
  tooltipState.active = false
  tooltipState.payload = []
  mockTheme = 'light'
})

// Stub chart layout, but render the application's actual tooltip through the
// same content/payload boundary used by Recharts (outside the SVG).
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <svg>
      <title>chart</title>
      {children}
    </svg>
  ),
  Area: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: ({ content }: { content: ReactElement<typeof tooltipState> }) =>
    createPortal(cloneElement(content, tooltipState), document.body),
  ReferenceLine: () => null,
  linearGradient: () => null,
  stop: () => null,
  defs: () => null,
}))

// useTheme is used to derive chart colors
vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

import { IncomeExpensesChart } from '@/features/finance/components/IncomeExpensesChart'
import type { FinanceSummary } from '@/features/finance/types/finance.types'

function makeSummary(
  overrides: Partial<FinanceSummary['incomeVsExpenses'][0]>[] = [],
): FinanceSummary {
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
  it('identifies a later best period and presents a break-even latest result', () => {
    render(
      <IncomeExpensesChart
        summary={makeSummary([{ netProfit: -100 }, { netProfit: 500 }, { netProfit: 0 }])}
      />,
    )
    expect(screen.getByText('Melhor período').parentElement).toHaveTextContent('500,00')
    expect(screen.getByText('Último resultado').parentElement).toHaveTextContent('0,00')
    expect(screen.getByText('Maior pressão').parentElement).toHaveTextContent('-R$ 100,00')
  })

  it('renders a tooltip without optional date and color data', () => {
    tooltipState.active = true
    tooltipState.payload = [{ name: 'income', value: 120 }]
    render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(screen.getByText('R$ 120,00')).toBeInTheDocument()
    expect(screen.queryByText(/undefined|NaN/)).not.toBeInTheDocument()
  })
  it('allows toggling series while keeping at least one series visible', async () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    const income = screen.getByRole('button', { name: 'Entradas' })
    const expenses = screen.getByRole('button', { name: 'Saídas' })
    const profit = screen.getByRole('button', { name: 'Resultado' })
    await userEvent.click(income)
    await userEvent.click(expenses)
    expect(income).toHaveAttribute('aria-pressed', 'false')
    expect(expenses).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(profit)
    expect(profit).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(income)
    await userEvent.click(profit)
    expect(income).toHaveAttribute('aria-pressed', 'true')
    expect(profit).toHaveAttribute('aria-pressed', 'false')
  })

  it.each([
    { theme: 'light', value: 25, text: '+R$ 25,00' },
    { theme: 'dark', value: -25, text: '-R$ 25,00' },
    { theme: 'light', value: 0, text: 'R$ 0,00' },
  ])('shows signed tooltip results for $value in $theme mode', ({ theme, value, text }) => {
    mockTheme = theme
    tooltipState.active = true
    tooltipState.payload = [
      { name: 'income', value: 1000, color: '#10B981', payload: { fullDate: '01/06/2026' } },
      { name: 'expenses', value: -1200, color: '#EF4444' },
      { name: 'netProfit', value },
    ]
    render(<IncomeExpensesChart summary={summaryWithData} />)
    // The tooltip is portalled independently from the chart's data table.
    const values = Array.from(document.body.children).filter((node) => !node.querySelector('svg'))
    const tooltip = values.find((node) => node.textContent?.includes('01/06/2026'))
    expect(tooltip).toHaveTextContent('EntradasR$ 1.000,00')
    expect(tooltip).toHaveTextContent('SaídasR$ 1.200,00')
    expect(tooltip).toHaveTextContent(`Resultado${text}`)
  })

  it('renders no tooltip content while there is no selected data point', () => {
    tooltipState.active = true
    tooltipState.payload = []
    const { container } = render(<IncomeExpensesChart summary={summaryWithData} />)
    expect(Array.from(document.body.children).filter((node) => node !== container)).toHaveLength(0)
  })
  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders empty state message when no data', () => {
    render(<IncomeExpensesChart summary={summaryEmpty} />)
    expect(screen.getByText('Nenhuma movimentação paga neste período.')).toBeInTheDocument()
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
    const toggles = screen.getAllByRole('button').filter((btn) => btn.hasAttribute('aria-pressed'))
    expect(toggles).toHaveLength(3)
    for (const btn of toggles) {
      expect(btn).toHaveAttribute('aria-pressed', 'true')
    }
  })

  it('does not render a Recharts Legend — toggle buttons are the only series legend', () => {
    render(<IncomeExpensesChart summary={summaryWithData} />)
    // Exactly 3 series labels from toggle buttons + 3 from the data table header = 6 total.
    // If Recharts Legend were present it would add a third set, making count > 2 per label.
    // We assert the toggle buttons are exactly 3 (no extras from a Legend component).
    const toggles = screen.getAllByRole('button').filter((btn) => btn.hasAttribute('aria-pressed'))
    expect(toggles).toHaveLength(3)
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
