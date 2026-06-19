import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { KpiGrid } from '@/features/finance/components/KpiGrid'
import type { FinanceSummary } from '@/features/finance/types/finance.types'

function makeSummary(kpis: Partial<FinanceSummary['kpis']> = {}): FinanceSummary {
  return {
    period: { from: '2026-06-01', to: '2026-06-30', groupBy: 'day' },
    kpis: {
      totalIncome: 10000,
      totalExpenses: 4000,
      netProfit: 6000,
      profitMargin: 60,
      pendingReceivables: 500,
      fixedExpensesTotal: 2000,
      ...kpis,
    },
    incomeVsExpenses: [],
    expensesByCategory: [],
    incomeByService: [],
  }
}

describe('KpiGrid', () => {
  // ── Labels ────────────────────────────────────────────────────────────────

  it('renders all 6 KPI labels', () => {
    render(<KpiGrid summary={makeSummary()} />)

    expect(screen.getByText('Entradas pagas')).toBeInTheDocument()
    expect(screen.getByText('Saídas pagas')).toBeInTheDocument()
    expect(screen.getByText('Lucro líquido')).toBeInTheDocument()
    expect(screen.getByText('Margem de lucro')).toBeInTheDocument()
    expect(screen.getByText('Recebíveis pendentes')).toBeInTheDocument()
    expect(screen.getByText('Despesas fixas ativas')).toBeInTheDocument()
  })

  // ── Values ────────────────────────────────────────────────────────────────

  it('renders all 6 formatted values', () => {
    render(<KpiGrid summary={makeSummary()} />)

    // totalIncome = 10000 → R$ 10.000,00
    expect(screen.getByText(/10\.000/)).toBeInTheDocument()
    // totalExpenses = 4000 → R$ 4.000,00
    expect(screen.getByText(/4\.000/)).toBeInTheDocument()
    // netProfit = 6000 → R$ 6.000,00
    expect(screen.getByText(/6\.000/)).toBeInTheDocument()
    // profitMargin = 60 → 60.0%
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    // pendingReceivables = 500 → R$ 500,00
    expect(screen.getByText(/500,00/)).toBeInTheDocument()
    // fixedExpensesTotal = 2000 → R$ 2.000,00
    expect(screen.getByText(/2\.000/)).toBeInTheDocument()
  })

  // ── Tones ─────────────────────────────────────────────────────────────────

  it('positive netProfit card uses success tone (emerald border)', () => {
    render(<KpiGrid summary={makeSummary({ netProfit: 1000 })} />)
    const label = screen.getByText('Lucro líquido')
    const card = label.closest('[class*="border-emerald"]')
    expect(card).toBeInTheDocument()
  })

  it('negative netProfit card uses danger tone (red border)', () => {
    render(<KpiGrid summary={makeSummary({ netProfit: -500 })} />)
    const label = screen.getByText('Lucro líquido')
    const card = label.closest('[class*="border-red"]')
    expect(card).toBeInTheDocument()
  })

  it('zero pendingReceivables card uses neutral tone (no colored border)', () => {
    render(<KpiGrid summary={makeSummary({ pendingReceivables: 0 })} />)
    const label = screen.getByText('Recebíveis pendentes')
    const card = label.closest('div[class*="rounded-lg"]')
    expect(card).toBeInTheDocument()
    expect(card?.className).not.toMatch(/border-amber/)
    expect(card?.className).not.toMatch(/border-emerald/)
    expect(card?.className).not.toMatch(/border-red/)
  })

  it('non-zero pendingReceivables card uses warning tone (amber border)', () => {
    render(<KpiGrid summary={makeSummary({ pendingReceivables: 100 })} />)
    const label = screen.getByText('Recebíveis pendentes')
    const card = label.closest('[class*="border-amber"]')
    expect(card).toBeInTheDocument()
  })

  it('zero profitMargin card uses success tone (≥ 0 → emerald border)', () => {
    render(<KpiGrid summary={makeSummary({ profitMargin: 0 })} />)
    const label = screen.getByText('Margem de lucro')
    const card = label.closest('[class*="border-emerald"]')
    expect(card).toBeInTheDocument()
  })

  // ── No legacy MetricCard ──────────────────────────────────────────────────

  it('does not render MetricCard value classes (text-2xl absent; HomeKpiCard uses text-xl)', () => {
    const { container } = render(<KpiGrid summary={makeSummary()} />)
    expect(container.querySelector('.text-2xl')).toBeNull()
  })

  // ── Delta descriptions ─────────────────────────────────────────────────────

  it('omits delta descriptions when previousSummary is not provided', () => {
    render(<KpiGrid summary={makeSummary()} />)
    expect(screen.queryByText(/vs\. período anterior/)).not.toBeInTheDocument()
  })

  it('omits delta descriptions when previousSummary is null', () => {
    render(<KpiGrid summary={makeSummary()} previousSummary={null} />)
    expect(screen.queryByText(/vs\. período anterior/)).not.toBeInTheDocument()
  })

  it('renders positive delta with plus sign', () => {
    const current = makeSummary({ totalIncome: 12000 })
    const previous = makeSummary({ totalIncome: 10000 })
    render(<KpiGrid summary={current} previousSummary={previous} />)
    // (12000 - 10000) / 10000 * 100 = +20.0%
    expect(screen.getByText('+20,0% vs. período anterior')).toBeInTheDocument()
  })

  it('renders negative delta with minus sign', () => {
    const current = makeSummary({ totalIncome: 8000 })
    const previous = makeSummary({ totalIncome: 10000 })
    render(<KpiGrid summary={current} previousSummary={previous} />)
    // (8000 - 10000) / 10000 * 100 = -20.0%
    expect(screen.getByText('-20,0% vs. período anterior')).toBeInTheDocument()
  })

  it('renders "Sem variação vs. período anterior" when current and previous are equal', () => {
    const summary = makeSummary({ totalIncome: 10000 })
    render(<KpiGrid summary={summary} previousSummary={summary} />)
    // all kpis equal → all 6 cards should show Sem variação
    const items = screen.getAllByText('Sem variação vs. período anterior')
    expect(items.length).toBe(6)
  })

  it('renders "Sem variação vs. período anterior" when both current and previous are zero', () => {
    const current = makeSummary({ totalIncome: 0 })
    const previous = makeSummary({ totalIncome: 0 })
    render(<KpiGrid summary={current} previousSummary={previous} />)
    expect(screen.getAllByText('Sem variação vs. período anterior').length).toBeGreaterThan(0)
  })

  it('renders "Novo valor vs. período anterior" when previous is zero and current is non-zero', () => {
    const current = makeSummary({ totalIncome: 5000 })
    const previous = makeSummary({ totalIncome: 0 })
    render(<KpiGrid summary={current} previousSummary={previous} />)
    expect(screen.getByText('Novo valor vs. período anterior')).toBeInTheDocument()
  })

  // ── Pending receivables drill-down ────────────────────────────────────────

  it('renders Recebíveis pendentes as a button when onPendingReceivablesClick is provided', () => {
    render(<KpiGrid summary={makeSummary()} onPendingReceivablesClick={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Filtrar recebíveis pendentes' })
    expect(btn).toBeInTheDocument()
  })

  it('calls onPendingReceivablesClick when the button is clicked', () => {
    const handler = vi.fn()
    render(<KpiGrid summary={makeSummary()} onPendingReceivablesClick={handler} />)
    const btn = screen.getByRole('button', { name: 'Filtrar recebíveis pendentes' })
    fireEvent.click(btn)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('button has aria-label "Filtrar recebíveis pendentes"', () => {
    render(<KpiGrid summary={makeSummary()} onPendingReceivablesClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Filtrar recebíveis pendentes' })).toHaveAttribute(
      'aria-label',
      'Filtrar recebíveis pendentes',
    )
  })

  it('does not render a button for Recebíveis pendentes when onPendingReceivablesClick is not provided', () => {
    render(<KpiGrid summary={makeSummary()} />)
    expect(
      screen.queryByRole('button', { name: 'Filtrar recebíveis pendentes' }),
    ).not.toBeInTheDocument()
  })

  it('renders 6 delta descriptions when previousSummary is provided', () => {
    const summary = makeSummary()
    const previous = makeSummary({
      totalIncome: 9000,
      totalExpenses: 3500,
      netProfit: 5500,
      profitMargin: 55,
      pendingReceivables: 400,
      fixedExpensesTotal: 1900,
    })
    render(<KpiGrid summary={summary} previousSummary={previous} />)
    const deltas = screen.getAllByText(/vs\. período anterior/)
    expect(deltas).toHaveLength(6)
  })
})
