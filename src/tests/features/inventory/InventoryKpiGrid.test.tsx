import { render, screen } from '@/test-utils/render-utils'

import { InventoryKpiGrid } from '@/features/inventory/components/InventoryKpiGrid'
import type { StockSummary } from '@/features/inventory/types/inventory.types'

const summary: StockSummary = {
  totalActive: 42,
  lowStock: 3,
  emptyStock: 1,
  expiring: 2,
  expired: 0,
  inactive: 5,
  estimatedValue: 125000,
  totalCategories: 4,
}

const allZeroAlerts: StockSummary = {
  ...summary,
  lowStock: 0,
  emptyStock: 0,
  expiring: 0,
  expired: 0,
}

describe('InventoryKpiGrid', () => {
  it('renders all 6 KPI labels', () => {
    render(<InventoryKpiGrid summary={summary} />)

    expect(screen.getByText('Produtos ativos')).toBeInTheDocument()
    expect(screen.getByText('Baixo estoque')).toBeInTheDocument()
    expect(screen.getByText('Sem estoque')).toBeInTheDocument()
    expect(screen.getByText('Vencendo em breve')).toBeInTheDocument()
    expect(screen.getByText('Vencidos')).toBeInTheDocument()
    expect(screen.getByText('Valor estimado')).toBeInTheDocument()
  })

  it('renders KPI values derived from summary', () => {
    render(<InventoryKpiGrid summary={{ ...summary, expired: 7 }} />)

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    // estimatedValue = 125000 cents = R$ 1.250,00
    expect(screen.getByText(/1\.250/)).toBeInTheDocument()
  })

  it('renders all 6 description lines', () => {
    render(<InventoryKpiGrid summary={summary} />)

    expect(screen.getByText('Total em estoque')).toBeInTheDocument()
    expect(screen.getByText('Abaixo do mínimo')).toBeInTheDocument()
    expect(screen.getByText('Reposição urgente')).toBeInTheDocument()
    expect(screen.getByText('Próximos 30 dias')).toBeInTheDocument()
    expect(screen.getByText('Retire do estoque')).toBeInTheDocument()
    expect(screen.getByText('Estoque ativo')).toBeInTheDocument()
  })

  it('renders neutral values for all-zero alert KPIs without crashing', () => {
    render(<InventoryKpiGrid summary={allZeroAlerts} />)

    expect(screen.getByText('Baixo estoque')).toBeInTheDocument()
    expect(screen.getByText('Sem estoque')).toBeInTheDocument()
    expect(screen.getByText('Vencendo em breve')).toBeInTheDocument()
    expect(screen.getByText('Vencidos')).toBeInTheDocument()
  })
})
