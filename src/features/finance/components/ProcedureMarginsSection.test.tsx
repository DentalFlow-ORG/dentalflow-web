import { within } from '@testing-library/react'
import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
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
    // Exact match avoids collision with InsightCard "Maior margem (est.)" label
    expect(screen.getByText('Margem (est.)', { selector: 'p' })).toBeInTheDocument()
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

// ── Insight cards ─────────────────────────────────────────────────────────────

describe('ProcedureMarginsSection — insight cards', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cards hidden when items is empty', () => {
    renderSection({ data: makeData({ items: [] }) })
    expect(screen.queryByText('Maior receita')).not.toBeInTheDocument()
    expect(screen.queryByText('Mais realizado')).not.toBeInTheDocument()
    expect(screen.queryByText('Maior margem (est.)')).not.toBeInTheDocument()
  })

  it('"Maior receita" card shows the service with the highest grossRevenueCents', () => {
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', grossRevenueCents: 30000 },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', grossRevenueCents: 90000 },
    ]
    renderSection({ data: makeData({ items }) })
    expect(screen.getByText('Maior receita').closest('div')).toHaveTextContent('Consulta')
  })

  it('"Mais realizado" card shows the service with the most totalAppointments', () => {
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', totalAppointments: 3 },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', totalAppointments: 10 },
    ]
    renderSection({ data: makeData({ items }) })
    expect(screen.getByText('Mais realizado').closest('div')).toHaveTextContent('Consulta')
  })

  it('"Maior margem (est.)" absent when costDataAvailable is false', () => {
    renderSection({ data: makeData({ items: [baseItem], costDataAvailable: false }) })
    expect(screen.queryByText('Maior margem (est.)')).not.toBeInTheDocument()
  })

  it('"Maior margem (est.)" shows the service with the highest marginPercent', () => {
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', estimatedDirectCostCents: 6000, estimatedProfitCents: 54000, marginPercent: 90 },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', estimatedDirectCostCents: 20000, estimatedProfitCents: 40000, marginPercent: 67 },
    ]
    renderSection({ data: makeData({ items, costDataAvailable: true, limitation: null }) })
    expect(screen.getByText('Maior margem (est.)').closest('div')).toHaveTextContent('Limpeza')
  })
})

// ── Sort control ──────────────────────────────────────────────────────────────

describe('ProcedureMarginsSection — sort control', () => {
  beforeEach(() => vi.clearAllMocks())

  const twoItems: ProcedureMarginItem[] = [
    { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', grossRevenueCents: 30000, totalAppointments: 3 },
    { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', grossRevenueCents: 90000, totalAppointments: 10 },
  ]

  it('sort select renders all four options when items.length > 1', () => {
    renderSection({ data: makeData({ items: twoItems }) })
    expect(screen.getByRole('combobox', { name: /Ordenar/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Receita/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Realizações/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Margem/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Nome/i })).toBeInTheDocument()
  })

  it('sort select hidden when items.length === 1', () => {
    renderSection({ data: makeData({ items: [baseItem] }) })
    expect(screen.queryByRole('combobox', { name: /Ordenar/i })).not.toBeInTheDocument()
  })

  it('margin option is disabled when costDataAvailable is false', () => {
    renderSection({ data: makeData({ items: twoItems, costDataAvailable: false }) })
    expect(screen.getByRole('option', { name: /Margem/i })).toBeDisabled()
  })

  it('default sort (revenue) shows the highest-revenue item first', () => {
    renderSection({ data: makeData({ items: twoItems }) })
    // Scoped to service-list to exclude ranking panel spans which also use <span> for names
    const list = screen.getByTestId('service-list')
    const nameSpans = within(list).getAllByText(/^(Limpeza|Consulta)$/, { selector: 'span' })
    expect(nameSpans[0]).toHaveTextContent('Consulta')
  })

  it('sorting by name shows items in alphabetical order', async () => {
    const user = userEvent.setup()
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Profilaxia', grossRevenueCents: 50000 },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', grossRevenueCents: 40000 },
    ]
    renderSection({ data: makeData({ items }) })
    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar/i }), 'name')
    // Scoped to service-list — ranking panel renders Profilaxia first (higher revenue)
    const list = screen.getByTestId('service-list')
    const nameSpans = within(list).getAllByText(/^(Profilaxia|Consulta)$/, { selector: 'span' })
    expect(nameSpans[0]).toHaveTextContent('Consulta')
  })

  it('null margins sort to the bottom when sorting by margin', async () => {
    const user = userEvent.setup()
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', estimatedDirectCostCents: null, estimatedProfitCents: null, marginPercent: null },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', estimatedDirectCostCents: 10000, estimatedProfitCents: 50000, marginPercent: 83 },
    ]
    renderSection({ data: makeData({ items, costDataAvailable: true, limitation: null }) })
    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar/i }), 'margin')
    // Scoped to service-list — both Ranking and MarginsRanking also render name spans
    const list = screen.getByTestId('service-list')
    const nameSpans = within(list).getAllByText(/^(Limpeza|Consulta)$/, { selector: 'span' })
    expect(nameSpans[0]).toHaveTextContent('Consulta')
  })
})

// ── Rankings panel ────────────────────────────────────────────────────────────

describe('ProcedureMarginsSection — rankings panel', () => {
  beforeEach(() => vi.clearAllMocks())

  const twoItems: ProcedureMarginItem[] = [
    { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', marginPercent: 75 },
    { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', grossRevenueCents: 90000, marginPercent: 60 },
  ]

  it('revenue ranking renders when items.length > 1', () => {
    renderSection({ data: makeData({ items: twoItems }) })
    expect(screen.getByText('Receita por procedimento')).toBeInTheDocument()
  })

  it('revenue ranking is absent when items.length === 1', () => {
    renderSection({ data: makeData({ items: [baseItem] }) })
    expect(screen.queryByText('Receita por procedimento')).not.toBeInTheDocument()
  })

  it('revenue ranking is absent when items is empty', () => {
    renderSection({ data: makeData({ items: [] }) })
    expect(screen.queryByText('Receita por procedimento')).not.toBeInTheDocument()
  })

  it('margin ranking renders when costDataAvailable=true and items.length > 1', () => {
    renderSection({ data: makeData({ items: twoItems, costDataAvailable: true, limitation: null }) })
    expect(screen.getByText('Margem estimada (%)')).toBeInTheDocument()
  })

  it('margin ranking is absent when costDataAvailable=false', () => {
    renderSection({ data: makeData({ items: twoItems, costDataAvailable: false }) })
    expect(screen.queryByText('Margem estimada (%)')).not.toBeInTheDocument()
  })

  it('margin ranking is absent when costDataAvailable=true but all marginPercent values are null', () => {
    const allNullItems: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', marginPercent: null },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', marginPercent: null },
    ]
    renderSection({ data: makeData({ items: allNullItems, costDataAvailable: true, limitation: null }) })
    expect(screen.queryByText('Margem estimada (%)')).not.toBeInTheDocument()
  })

  it('null margin item renders "—" placeholder in the margin ranking', () => {
    const items: ProcedureMarginItem[] = [
      { ...baseItem, serviceId: 'svc-1', serviceName: 'Limpeza', marginPercent: null, estimatedDirectCostCents: null, estimatedProfitCents: null },
      { ...baseItem, serviceId: 'svc-2', serviceName: 'Consulta', marginPercent: 80, estimatedDirectCostCents: 10000, estimatedProfitCents: 50000 },
    ]
    renderSection({ data: makeData({ items, costDataAvailable: true, limitation: null }) })
    expect(screen.getByText('Margem estimada (%)')).toBeInTheDocument()
    // baseItem has completedAppointments: 4, so no "—" from avg revenue — only the null-margin item
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
