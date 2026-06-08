import { render, screen } from '@/test-utils/render-utils'

import { InventorySummaryChip } from '@/features/inventory/components/InventorySummaryChip'

describe('InventorySummaryChip', () => {
  it('renders label and value', () => {
    render(<InventorySummaryChip label="Total de itens" value="12" />)

    expect(screen.getByText('Total de itens')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('supports numeric string values', () => {
    render(<InventorySummaryChip label="Alta atenção" value="0" />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders with danger tone without crashing', () => {
    render(<InventorySummaryChip label="Críticos" value="3" tone="danger" />)

    expect(screen.getByText('Críticos')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders with warning tone without crashing', () => {
    render(<InventorySummaryChip label="Alta prioridade" value="2" tone="warning" />)

    expect(screen.getByText('Alta prioridade')).toBeInTheDocument()
  })

  it('renders with info tone without crashing', () => {
    render(<InventorySummaryChip label="Baixa atenção" value="5" tone="info" />)

    expect(screen.getByText('Baixa atenção')).toBeInTheDocument()
  })

  it('defaults to neutral tone when tone is omitted', () => {
    render(<InventorySummaryChip label="Custo estimado" value="R$ 1.250,00" />)

    expect(screen.getByText('Custo estimado')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,00')).toBeInTheDocument()
  })
})
