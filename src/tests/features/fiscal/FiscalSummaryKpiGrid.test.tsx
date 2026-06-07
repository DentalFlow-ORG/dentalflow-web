import { render, screen } from '@/test-utils/render-utils'

import { FiscalSummaryKpiGrid } from '@/features/fiscal/components/FiscalSummaryKpiGrid'
import type { FiscalSummary } from '@/features/fiscal/types/fiscal.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSummary(overrides: Partial<FiscalSummary> = {}): FiscalSummary {
  return {
    counts: {
      DRAFT: 3,
      READY_TO_ISSUE: 2,
      SIMULATED: 1,
      PROCESSING: 0,
      ISSUED: 5,
      FAILED: 1,
      CANCELED: 4,
    },
    monthTotalCents: 150000,
    configurationPending: false,
    providerMode: 'LOCAL',
    realIssuingEnabled: false,
    ...overrides,
  }
}

const defaultSummary = makeSummary()

const allZeroSummary = makeSummary({
  counts: {
    DRAFT: 0,
    READY_TO_ISSUE: 0,
    SIMULATED: 0,
    PROCESSING: 0,
    ISSUED: 0,
    FAILED: 0,
    CANCELED: 0,
  },
  monthTotalCents: 0,
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FiscalSummaryKpiGrid', () => {
  // ── Labels ─────────────────────────────────────────────────────────────────

  it('renders "Rascunhos" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Rascunhos')).toBeInTheDocument()
  })

  it('renders "Prontas para emissão" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Prontas para emissão')).toBeInTheDocument()
  })

  it('renders "Em processamento" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Em processamento')).toBeInTheDocument()
  })

  it('renders "Emitidas" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Emitidas')).toBeInTheDocument()
  })

  it('renders "Falhas" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Falhas')).toBeInTheDocument()
  })

  it('renders "Canceladas" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Canceladas')).toBeInTheDocument()
  })

  it('renders "Total do mês" KPI label', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('Total do mês')).toBeInTheDocument()
  })

  // ── Configuration KPI not present ──────────────────────────────────────────

  it('does not render a "Configuração fiscal" KPI card', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.queryByText('Configuração fiscal')).not.toBeInTheDocument()
  })

  it('does not render "Pendente" or "Ok" as KPI values', () => {
    render(<FiscalSummaryKpiGrid summary={makeSummary({ configurationPending: true })} />)
    expect(screen.queryByText('Pendente')).not.toBeInTheDocument()
    render(<FiscalSummaryKpiGrid summary={makeSummary({ configurationPending: false })} />)
    expect(screen.queryByText('Ok')).not.toBeInTheDocument()
  })

  // ── Count values ───────────────────────────────────────────────────────────

  it('renders DRAFT count value', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders ISSUED count value', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders FAILED count value', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders PROCESSING count value', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    // PROCESSING is 0 in defaultSummary — still renders
    expect(screen.getByText('Em processamento')).toBeInTheDocument()
  })

  // ── Month total ────────────────────────────────────────────────────────────

  it('renders month total formatted in BRL', () => {
    render(<FiscalSummaryKpiGrid summary={defaultSummary} />)
    // 150000 cents = R$ 1.500,00
    expect(screen.getByText(/1\.500/)).toBeInTheDocument()
  })

  it('renders zero month total as formatted BRL', () => {
    render(<FiscalSummaryKpiGrid summary={allZeroSummary} />)
    // 0 cents = R$ 0,00
    expect(screen.getByText(/0,00/)).toBeInTheDocument()
  })

  // ── All zeros renders without crashing ─────────────────────────────────────

  it('renders all 7 KPI labels when all counts are zero', () => {
    render(<FiscalSummaryKpiGrid summary={allZeroSummary} />)
    expect(screen.getByText('Rascunhos')).toBeInTheDocument()
    expect(screen.getByText('Prontas para emissão')).toBeInTheDocument()
    expect(screen.getByText('Em processamento')).toBeInTheDocument()
    expect(screen.getByText('Emitidas')).toBeInTheDocument()
    expect(screen.getByText('Falhas')).toBeInTheDocument()
    expect(screen.getByText('Canceladas')).toBeInTheDocument()
    expect(screen.getByText('Total do mês')).toBeInTheDocument()
  })

  // ── ISSUED and PROCESSING are visible ──────────────────────────────────────

  it('renders ISSUED KPI with non-zero count', () => {
    const summary = makeSummary({ counts: { ...defaultSummary.counts, ISSUED: 8 } })
    render(<FiscalSummaryKpiGrid summary={summary} />)
    expect(screen.getByText('Emitidas')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders PROCESSING KPI with non-zero count', () => {
    const summary = makeSummary({ counts: { ...defaultSummary.counts, PROCESSING: 7 } })
    render(<FiscalSummaryKpiGrid summary={summary} />)
    expect(screen.getByText('Em processamento')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
