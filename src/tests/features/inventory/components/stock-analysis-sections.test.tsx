import type { ReactNode } from 'react'

import { StockAbnormalConsumptionSection } from '@/features/inventory/components/StockAbnormalConsumptionSection'
import { StockPurchaseListSection } from '@/features/inventory/components/StockPurchaseListSection'
import type { useStockAbnormalConsumption } from '@/features/inventory/hooks/useStockAbnormalConsumption'
import type { useStockPurchaseList } from '@/features/inventory/hooks/useStockPurchaseList'
import type {
  GetAbnormalConsumptionResponse,
  StockPurchaseList,
} from '@/features/inventory/types/inventory.types'
import { renderWithProviders, screen, userEvent } from '@/test-utils/render-utils'

let purchase: ReturnType<typeof useStockPurchaseList>
let consumption: ReturnType<typeof useStockAbnormalConsumption>
vi.mock('@/features/inventory/hooks/useStockPurchaseList', () => ({
  useStockPurchaseList: () => purchase,
}))
vi.mock('@/features/inventory/hooks/useStockAbnormalConsumption', () => ({
  useStockAbnormalConsumption: () => consumption,
}))
vi.mock('@/features/inventory/components/StockCopilotCard', () => ({
  StockCopilotCard: () => <p>Análise de compras salva</p>,
}))
vi.mock('@/features/inventory/components/StockAbnormalConsumptionCopilotCard', () => ({
  StockAbnormalConsumptionCopilotCard: () => <p>Análise de consumo salva</p>,
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

function purchaseData(): StockPurchaseList {
  return {
    summary: {
      totalItems: 3,
      criticalItems: 1,
      highPriorityItems: 1,
      mediumPriorityItems: 1,
      totalEstimatedCostCents: 12500,
    },
    items: [
      {
        productId: 'p1',
        productName: 'Resina',
        categoryName: 'Restauração',
        supplier: 'Fornecedor A',
        currentQuantity: 0,
        minQuantity: 5,
        unit: 'caixas',
        deficitQuantity: 5,
        suggestedPurchaseQuantity: 5,
        estimatedCostCents: 12500,
        priority: 'CRITICAL',
        reason: 'Sem estoque',
      },
      {
        productId: 'p2',
        productName: 'Luvas',
        categoryName: null,
        supplier: null,
        currentQuantity: 1,
        minQuantity: 3,
        unit: null,
        deficitQuantity: 2,
        suggestedPurchaseQuantity: 2,
        estimatedCostCents: null,
        priority: 'HIGH',
        reason: 'Reposição necessária',
      },
      {
        productId: 'p3',
        productName: 'Máscaras',
        categoryName: 'Proteção',
        supplier: null,
        currentQuantity: 2,
        minQuantity: 3,
        unit: 'pacotes',
        deficitQuantity: 1,
        suggestedPurchaseQuantity: 1,
        estimatedCostCents: 0,
        priority: 'MEDIUM',
        reason: 'Próximo do mínimo',
      },
    ],
  }
}

function consumptionData(): GetAbnormalConsumptionResponse {
  return {
    summary: {
      totalAnomalies: 3,
      highSeverity: 1,
      mediumSeverity: 1,
      lowSeverity: 1,
      recentDays: 7,
      baselineDays: 30,
      analyzedProducts: 3,
      generatedAt: '2026-06-01T12:00:00Z',
    },
    items: [
      {
        productId: 'p1',
        productName: 'Resina',
        categoryName: 'Restauração',
        currentQuantity: 2,
        minQuantity: 3,
        unit: 'caixas',
        anomalyType: 'CONSUMPTION_SPIKE',
        severity: 'HIGH',
        recentQuantity: 20,
        baselineQuantity: 10,
        changePercent: 100,
        movementCount: 2,
        reason: 'Consumo acima do histórico',
        suggestedAction: 'Revisar saídas',
      },
      {
        productId: 'p2',
        productName: 'Luvas',
        categoryName: null,
        currentQuantity: 1,
        minQuantity: 3,
        unit: null,
        anomalyType: 'LOSS_SPIKE',
        severity: 'MEDIUM',
        recentQuantity: 1,
        baselineQuantity: 0,
        changePercent: null,
        movementCount: 1,
        reason: 'Perda registrada',
        suggestedAction: 'Conferir perdas',
      },
      {
        productId: 'p3',
        productName: 'Máscaras',
        categoryName: null,
        currentQuantity: 1,
        minQuantity: 3,
        unit: null,
        anomalyType: 'FREQUENT_ADJUSTMENTS',
        severity: 'LOW',
        recentQuantity: 2,
        baselineQuantity: 2,
        changePercent: 0,
        movementCount: 3,
        reason: 'Ajustes frequentes',
        suggestedAction: 'Conferir inventário',
      },
    ],
  }
}

beforeEach(() => {
  purchase = { data: null, isLoading: false, error: null, isPlanBlocked: false, refetch: vi.fn() }
  consumption = {
    data: null,
    isLoading: false,
    error: null,
    isPlanBlocked: false,
    refetch: vi.fn(),
  }
})

describe.each([
  {
    name: 'purchases',
    Component: StockPurchaseListSection,
    state: () => purchase,
    loading: 'Carregando lista de compras...',
    saved: 'Análise de compras salva',
  },
  {
    name: 'consumption',
    Component: StockAbnormalConsumptionSection,
    state: () => consumption,
    loading: 'Analisando padrões de consumo...',
    saved: 'Análise de consumo salva',
  },
])('$name section', ({ Component, state, loading, saved }) => {
  it('shows loading until data is available', () => {
    state().isLoading = true
    renderWithProviders(<Component />)
    expect(screen.getByText(loading)).toBeInTheDocument()
    expect(screen.queryByText(saved)).not.toBeInTheDocument()
  })

  it('retains saved analysis with no current results', () => {
    renderWithProviders(<Component />)
    expect(screen.getByText(saved)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('offers a retry for a failed list without hiding saved analysis', async () => {
    state().error = 'Serviço indisponível'
    renderWithProviders(<Component />)
    expect(screen.getByText('Serviço indisponível')).toBeInTheDocument()
    expect(screen.getByText(saved)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(state().refetch).toHaveBeenCalledOnce()
  })

  it('prioritizes plan gating over errors and links to the subscription route', () => {
    state().isPlanBlocked = true
    state().error = 'Detalhes indisponíveis'
    renderWithProviders(<Component />)
    expect(screen.getByRole('link', { name: 'Ver planos' })).toHaveAttribute(
      'href',
      '/app/assinatura',
    )
    expect(screen.queryByText('Detalhes indisponíveis')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })
})

it('renders purchase priorities, quantities, cents, and missing-cost fallbacks', () => {
  purchase.data = purchaseData()
  renderWithProviders(<StockPurchaseListSection />)
  expect(screen.getByText('Crítico')).toBeInTheDocument()
  expect(screen.getByText('Fornecedor A')).toBeInTheDocument()
  expect(screen.getByText('Comprar 5 caixas')).toBeInTheDocument()
  expect(screen.getByText('Comprar 2 un.')).toBeInTheDocument()
  expect(screen.getAllByText('R$ 125,00')).toHaveLength(2)
  expect(screen.getByText('Custo não informado')).toBeInTheDocument()
  expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
})

it('shows an unknown purchase estimate rather than a fabricated cost', () => {
  purchase.data = purchaseData()
  purchase.data.summary = {
    totalItems: 1,
    criticalItems: 0,
    highPriorityItems: 0,
    mediumPriorityItems: 0,
    totalEstimatedCostCents: 0,
  }
  purchase.data.items = [purchase.data.items[1]]
  renderWithProviders(<StockPurchaseListSection />)
  expect(screen.getByText('—')).toBeInTheDocument()
  expect(screen.getByText('Custo não informado')).toBeInTheDocument()
})

it('renders populated consumption severities, percentages, and singular/plural movements', () => {
  consumption.data = consumptionData()
  renderWithProviders(<StockAbnormalConsumptionSection />)
  expect(screen.getByText('Consumo aumentou')).toBeInTheDocument()
  expect(screen.getByText('Perdas incomuns')).toBeInTheDocument()
  expect(screen.getByText('+100%')).toBeInTheDocument()
  expect(screen.getByText('+0%')).toBeInTheDocument()
  expect(screen.getByText('1 mov. recente')).toBeInTheDocument()
  expect(screen.getByText('2 mov. recentes')).toBeInTheDocument()
  expect(screen.getByText('Conferir perdas')).toBeInTheDocument()
})

it('uses the returned analysis window for an empty consumption list', () => {
  consumption.data = consumptionData()
  consumption.data.summary.totalAnomalies = 0
  consumption.data.items = []
  renderWithProviders(<StockAbnormalConsumptionSection />)
  expect(
    screen.getByText('O consumo dos últimos 7 dias está dentro dos padrões históricos.'),
  ).toBeInTheDocument()
})

it.each(['HIGH', 'LOW'] as const)(
  'shows zero counts for severities absent from a %s-only dataset',
  (severity) => {
    consumption.data = consumptionData()
    consumption.data.items = consumption.data.items.filter((item) => item.severity === severity)
    consumption.data.summary = {
      ...consumption.data.summary,
      totalAnomalies: 1,
      highSeverity: severity === 'HIGH' ? 1 : 0,
      mediumSeverity: 0,
      lowSeverity: severity === 'LOW' ? 1 : 0,
    }
    renderWithProviders(<StockAbnormalConsumptionSection />)
    expect(screen.getByText('Alta atenção', { selector: 'p' }).parentElement).toHaveTextContent(
      severity === 'HIGH' ? '1' : '0',
    )
    expect(screen.getByText('Atenção média', { selector: 'p' }).parentElement).toHaveTextContent(
      '0',
    )
    expect(screen.getByText('Baixa atenção', { selector: 'p' }).parentElement).toHaveTextContent(
      severity === 'LOW' ? '1' : '0',
    )
  },
)

it('shows empty purchases when the summary reports no items', () => {
  purchase.data = purchaseData()
  purchase.data.summary.totalItems = 0
  purchase.data.items = []
  renderWithProviders(<StockPurchaseListSection />)
  expect(
    screen.getByText('Seu estoque está dentro dos níveis mínimos definidos.'),
  ).toBeInTheDocument()
})
