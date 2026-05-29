import { renderWithProviders, screen } from '@/test/render-utils'
import type { LeadSummary } from '../types/leads.types'
import { LeadFunnelPanel } from './LeadFunnelPanel'

function makeSummary(overrides: Partial<LeadSummary> = {}): LeadSummary {
  return {
    new: 0,
    contacted: 0,
    scheduled: 0,
    converted: 0,
    lost: 0,
    archived: 0,
    ...overrides,
  }
}

function renderPanel(summary: LeadSummary | null) {
  return renderWithProviders(<LeadFunnelPanel summary={summary} />)
}

// ── Visibility guards ─────────────────────────────────────────────────────────

describe('LeadFunnelPanel — visibility', () => {
  it('is hidden when summary is null', () => {
    renderPanel(null)
    expect(screen.queryByText('Pipeline total')).not.toBeInTheDocument()
  })

  it('is hidden when total pipeline is 0', () => {
    renderPanel(makeSummary())
    expect(screen.queryByText('Pipeline total')).not.toBeInTheDocument()
  })

  it('is hidden when only ARCHIVED leads exist (total excludes ARCHIVED)', () => {
    renderPanel(makeSummary({ archived: 10 }))
    expect(screen.queryByText('Pipeline total')).not.toBeInTheDocument()
  })

  it('renders when at least one non-archived lead exists', () => {
    renderPanel(makeSummary({ new: 1 }))
    expect(screen.getByText('Pipeline total')).toBeInTheDocument()
  })
})

// ── Total calculation ─────────────────────────────────────────────────────────

describe('LeadFunnelPanel — total', () => {
  it('excludes ARCHIVED from total', () => {
    renderPanel(makeSummary({ new: 3, archived: 10 }))
    expect(screen.queryByText('13')).not.toBeInTheDocument()
    // total of 3 appears somewhere in the panel
    expect(screen.getByText('Pipeline total')).toBeInTheDocument()
  })

  it('sums new + contacted + scheduled + converted + lost', () => {
    // total = 1+2+3+4+5 = 15
    renderPanel(makeSummary({ new: 1, contacted: 2, scheduled: 3, converted: 4, lost: 5 }))
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})

// ── Conversion rate ───────────────────────────────────────────────────────────

describe('LeadFunnelPanel — conversion rate', () => {
  it('calculates conversion rate correctly', () => {
    // 2 converted out of 8 total = 25,0%
    renderPanel(makeSummary({ new: 4, contacted: 2, converted: 2 }))
    expect(screen.getByText('25,0%')).toBeInTheDocument()
  })

  it('renders 0,0% conversion rate safely when no leads are converted', () => {
    renderPanel(makeSummary({ new: 5 }))
    // conversion: 0/5 = 0,0%; lost: 0/5 = 0,0% — two elements showing "0,0%"
    expect(screen.getAllByText('0,0%')).toHaveLength(2)
  })
})

// ── Lost rate ─────────────────────────────────────────────────────────────────

describe('LeadFunnelPanel — lost rate', () => {
  it('calculates lost rate correctly', () => {
    // 1 lost out of 5 total = 20,0%
    renderPanel(makeSummary({ new: 4, lost: 1 }))
    expect(screen.getByText('20,0%')).toBeInTheDocument()
  })

  it('renders 100,0% lost rate when all leads are lost', () => {
    renderPanel(makeSummary({ lost: 5 }))
    expect(screen.getByText('100,0%')).toBeInTheDocument()
  })
})

// ── Stage labels ──────────────────────────────────────────────────────────────

describe('LeadFunnelPanel — stage labels', () => {
  it('renders all four stage labels', () => {
    renderPanel(makeSummary({ new: 5 }))
    expect(screen.getByText('Novos')).toBeInTheDocument()
    expect(screen.getByText('Em contato')).toBeInTheDocument()
    expect(screen.getByText('Agendados')).toBeInTheDocument()
    expect(screen.getByText('Convertidos')).toBeInTheDocument()
  })

  it('renders stage counts including zeros', () => {
    renderPanel(makeSummary({ new: 3, converted: 1 }))
    // Multiple zeros appear (contacted=0, scheduled=0)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
