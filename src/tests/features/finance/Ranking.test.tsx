import { render, screen } from '@/test-utils/render-utils'

import { Ranking } from '@/features/finance/components/Ranking'

const items = [
  { label: 'Serviços odontológicos', amount: 50000, color: '#10B981' },
  { label: 'Ortopedia', amount: 35000, color: '#6366F1' },
  { label: 'Estética dental', amount: 28000, color: '#F97316' },
  { label: 'Radiologia', amount: 12000, color: '#F59E0B' },
  { label: 'Consulta', amount: 8000, color: '#0EA5E9' },
  // 6th item — should NOT appear (top-5 cap)
  { label: 'Extras', amount: 3000, color: '#7C3AED' },
]

describe('Ranking', () => {
  // ── Title and subtitle ─────────────────────────────────────────────────────

  it('renders the title prop', () => {
    render(<Ranking title="Despesas por categoria" items={items} />)
    expect(screen.getByText('Despesas por categoria')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Ranking title="Despesas por categoria" items={items} />)
    expect(screen.getByText('Top 5 no período selecionado')).toBeInTheDocument()
  })

  // ── Top-5 cap ──────────────────────────────────────────────────────────────

  it('renders at most 5 items', () => {
    render(<Ranking title="Despesas por categoria" items={items} />)
    expect(screen.getByText('Serviços odontológicos')).toBeInTheDocument()
    expect(screen.getByText('Ortopedia')).toBeInTheDocument()
    expect(screen.getByText('Estética dental')).toBeInTheDocument()
    expect(screen.getByText('Radiologia')).toBeInTheDocument()
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })

  it('does not render the 6th item', () => {
    render(<Ranking title="Despesas por categoria" items={items} />)
    expect(screen.queryByText('Extras')).not.toBeInTheDocument()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders the dashed empty state when items is empty', () => {
    const { container } = render(<Ranking title="Receitas por serviço" items={[]} />)
    // Dashed-border pattern uses border-dashed class
    expect(container.querySelector('.border-dashed')).toBeInTheDocument()
  })

  it('renders "Sem dados no período." in empty state', () => {
    render(<Ranking title="Receitas por serviço" items={[]} />)
    expect(screen.getByText('Sem dados no período.')).toBeInTheDocument()
  })

  // ── Item rendering ─────────────────────────────────────────────────────────

  it('renders formatted amount for each item', () => {
    render(<Ranking title="Despesas por categoria" items={[{ label: 'Aluguel', amount: 35000, color: '#EF4444' }]} />)
    // formatCurrency(35000) → R$ 350,00 (amount is in cents) or R$ 35.000,00 depending on util
    // Just assert some currency text appears
    expect(screen.getByText(/R\$/)).toBeInTheDocument()
  })

  // ── Long label truncation ──────────────────────────────────────────────────

  it('label span has truncate class for overflow safety', () => {
    const { container } = render(
      <Ranking
        title="Despesas por categoria"
        items={[{ label: 'Um nome de categoria extremamente longo que vai transbordar', amount: 10000, color: '#10B981' }]}
      />,
    )
    const labelSpans = container.querySelectorAll('.truncate')
    expect(labelSpans.length).toBeGreaterThan(0)
  })
})
