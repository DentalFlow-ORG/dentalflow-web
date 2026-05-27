import { renderWithProviders, screen } from '@/test/render-utils'
import type { ProcedureMarginsState } from '../hooks/useProcedureMargins'
import type { ProcedureMarginItem, ProcedureMarginsResponse } from '../types/finance.types'
import { ProcedureMarginsSection } from './ProcedureMarginsSection'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockOnLoad = vi.fn()

const idleState: ProcedureMarginsState = {
  data: null,
  isLoading: false,
  isPlanBlocked: false,
  error: null,
}

const emptyTotals = {
  totalAppointments: 0,
  completedAppointments: 0,
  grossRevenueCents: 0,
  estimatedDirectCostCents: null,
  estimatedProfitCents: null,
  marginPercent: null,
}

const baseItem: ProcedureMarginItem = {
  serviceId: 'svc-1',
  serviceName: 'Limpeza',
  totalAppointments: 5,
  completedAppointments: 4,
  canceledOrNoShowCount: 1,
  grossRevenueCents: 60000,
  estimatedDirectCostCents: null,
  estimatedProfitCents: null,
  marginPercent: null,
  avgRevenueCents: 15000,
  status: 'HEALTHY',
}

function makeData(overrides: Partial<ProcedureMarginsResponse> = {}): ProcedureMarginsResponse {
  return {
    period: { from: '2025-01-01', to: '2025-01-31' },
    items: [],
    totals: emptyTotals,
    costDataAvailable: false,
    limitation: null,
    ...overrides,
  }
}

function renderSection(stateOverrides: Partial<ProcedureMarginsState> = {}) {
  return renderWithProviders(
    <ProcedureMarginsSection
      state={{ ...idleState, ...stateOverrides }}
      onLoad={mockOnLoad}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProcedureMarginsSection — banner conditions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no amber banner when items.length === 0 even if limitation is set', () => {
    renderSection({
      data: makeData({
        items: [],
        costDataAvailable: false,
        limitation: 'Custo direto não configurado. Adicione custos de materiais.',
      }),
    })
    expect(screen.queryByText(/Custo direto não configurado/i)).not.toBeInTheDocument()
  })

  it('amber banner appears when items exist and limitation is set', () => {
    renderSection({
      data: makeData({
        items: [baseItem],
        costDataAvailable: false,
        limitation: 'Custo direto não configurado. Adicione custos de materiais.',
      }),
    })
    expect(screen.getByText(/Custo direto não configurado/i)).toBeInTheDocument()
  })

  it('blue info banner appears when costDataAvailable=true and limitation is null', () => {
    renderSection({
      data: makeData({
        items: [baseItem],
        costDataAvailable: true,
        limitation: null,
      }),
    })
    expect(screen.getByText(/Custo direto configurado/i)).toBeInTheDocument()
  })

  it('no banners at all when items is empty', () => {
    renderSection({
      data: makeData({
        items: [],
        costDataAvailable: false,
        limitation: 'Custo direto não configurado.',
      }),
    })
    expect(screen.queryByText(/Custo direto não configurado/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Custo direto configurado/i)).not.toBeInTheDocument()
  })
})

describe('ProcedureMarginsSection — summary MetricCards', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hides cost/profit/margin cards when costDataAvailable=false', () => {
    renderSection({
      data: makeData({
        items: [baseItem],
        costDataAvailable: false,
        totals: emptyTotals,
      }),
    })
    expect(screen.queryByText(/Custo total est\./i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Lucro estimado/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Margem \(est\.\)/i)).not.toBeInTheDocument()
  })

  it('shows cost/profit/margin cards when costDataAvailable=true', () => {
    renderSection({
      data: makeData({
        items: [{ ...baseItem, estimatedDirectCostCents: 3000, estimatedProfitCents: 57000, marginPercent: 95 }],
        costDataAvailable: true,
        limitation: null,
        totals: {
          ...emptyTotals,
          estimatedDirectCostCents: 3000,
          estimatedProfitCents: 57000,
          marginPercent: 95,
        },
      }),
    })
    expect(screen.getByText(/Custo total est\./i, { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Lucro estimado', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText(/Margem \(est\.\)/i, { selector: 'p' })).toBeInTheDocument()
  })
})

describe('ProcedureMarginsSection — per-service row display', () => {
  beforeEach(() => vi.clearAllMocks())

  it('"Não configurado" appears when estimatedDirectCostCents is null', () => {
    renderSection({
      data: makeData({ items: [{ ...baseItem, estimatedDirectCostCents: null }] }),
    })
    expect(screen.getByText(/Não configurado/i)).toBeInTheDocument()
  })

  it('cost value shown and "Não configurado" absent when estimatedDirectCostCents is set', () => {
    renderSection({
      data: makeData({ items: [{ ...baseItem, estimatedDirectCostCents: 3000 }] }),
    })
    expect(screen.queryByText(/Não configurado/i)).not.toBeInTheDocument()
    // Cost display: 3000 cents = R$ 30,xx — match the numeric part robustly
    expect(screen.getByText(/30/)).toBeInTheDocument()
  })

  it('profit and margin labels render when values are non-null', () => {
    const item: ProcedureMarginItem = {
      ...baseItem,
      estimatedDirectCostCents: 12000,
      estimatedProfitCents: 48000,
      marginPercent: 80,
    }
    renderSection({ data: makeData({ items: [item] }) })
    expect(screen.getByText(/Lucro estimado:/i)).toBeInTheDocument()
    expect(screen.getByText(/Margem \(est\.\):/i)).toBeInTheDocument()
    // Margin value: 80.toFixed(2).replace('.', ',') + '%' = "80,00%"
    expect(screen.getByText(/80,00%/)).toBeInTheDocument()
  })

  it('profit and margin labels absent when values are null', () => {
    renderSection({
      data: makeData({ items: [{ ...baseItem, estimatedProfitCents: null, marginPercent: null }] }),
    })
    expect(screen.queryByText(/Lucro estimado:/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Margem \(est\.\):/i)).not.toBeInTheDocument()
  })

  it('negative profit renders with negative margin percent', () => {
    const item: ProcedureMarginItem = {
      ...baseItem,
      estimatedDirectCostCents: 80000,
      estimatedProfitCents: -20000,
      marginPercent: -50,
    }
    renderSection({ data: makeData({ items: [item] }) })
    expect(screen.getByText(/Lucro estimado:/i)).toBeInTheDocument()
    // Margin: (-50).toFixed(2).replace('.', ',') + '%' = "-50,00%"
    expect(screen.getByText(/-50,00%/)).toBeInTheDocument()
  })
})

describe('ProcedureMarginsSection — state-based display', () => {
  beforeEach(() => vi.clearAllMocks())

  it('plan-blocked state shows the plan restriction message', () => {
    renderSection({ isPlanBlocked: true })
    expect(
      screen.getByText(/planos Professional e Premium/i),
    ).toBeInTheDocument()
  })
})
