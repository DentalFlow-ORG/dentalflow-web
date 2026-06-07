import { render, screen } from '@/test-utils/render-utils'

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
    // The "Lucro líquido" label's parent card gets success tone → border-emerald-200
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
    // neutral = border-border, no amber/red/emerald/blue
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
    // MetricCard renders values with text-2xl; HomeKpiCard uses text-xl
    expect(container.querySelector('.text-2xl')).toBeNull()
  })
})
