import { render, screen } from '@/test-utils/render-utils'

import { ReportPreviewPanel } from '@/features/reports/components/ReportPreviewPanel'
import type { ReportPreviewResponse } from '@/features/reports/types/reports.types'

function makeData(overrides: Partial<ReportPreviewResponse> = {}): ReportPreviewResponse {
  return {
    reportType: 'finance',
    reportTitle: 'Relatório financeiro',
    clinic: { name: 'Clínica Demo', document: null },
    generatedAt: '2026-06-01T12:00:00.000Z',
    filters: [],
    period: null,
    recordCount: 10,
    maxRecords: 5000,
    isTruncated: false,
    exportFormat: 'CSV',
    empty: false,
    previewNote: null,
    ...overrides,
  }
}

describe('ReportPreviewPanel', () => {
  it('renders the clinic name and generated timestamp', () => {
    render(<ReportPreviewPanel data={makeData()} />)
    expect(screen.getByText('Clínica Demo')).toBeInTheDocument()
    expect(screen.getByText(/gerado em:/i)).toBeInTheDocument()
  })

  it('does not render a period line when period is null', () => {
    render(<ReportPreviewPanel data={makeData({ period: null })} />)
    expect(screen.queryByText(/período:/i)).not.toBeInTheDocument()
  })

  it('renders the period label when present', () => {
    render(
      <ReportPreviewPanel
        data={makeData({
          period: { startDate: '2026-06-01', endDate: '2026-06-30', label: 'Junho de 2026' },
        })}
      />,
    )
    expect(screen.getByText(/período:/i)).toBeInTheDocument()
    expect(screen.getByText('Junho de 2026')).toBeInTheDocument()
  })

  it('does not render applied filters when the list is empty', () => {
    render(<ReportPreviewPanel data={makeData({ filters: [] })} />)
    expect(screen.queryByText(/status/i)).not.toBeInTheDocument()
  })

  it('renders each applied filter label/value pair', () => {
    render(
      <ReportPreviewPanel data={makeData({ filters: [{ label: 'Status', value: 'Pago' }] })} />,
    )
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('Pago')).toBeInTheDocument()
  })

  it('shows the empty-state message when empty is true', () => {
    render(<ReportPreviewPanel data={makeData({ empty: true })} />)
    expect(
      screen.getByText('Nenhum registro encontrado para os filtros aplicados.'),
    ).toBeInTheDocument()
  })

  it('shows the singular record count message', () => {
    render(<ReportPreviewPanel data={makeData({ recordCount: 1 })} />)
    expect(screen.getByText(/registro encontrado/)).toBeInTheDocument()
    expect(screen.queryByText(/registros encontrados/)).not.toBeInTheDocument()
  })

  it('shows the plural record count message', () => {
    render(<ReportPreviewPanel data={makeData({ recordCount: 5 })} />)
    expect(screen.getByText(/registros encontrados/)).toBeInTheDocument()
  })

  it('does not show the truncation warning when isTruncated is false', () => {
    render(<ReportPreviewPanel data={makeData({ isTruncated: false })} />)
    expect(screen.queryByText(/mais de 5\.000 registros/i)).not.toBeInTheDocument()
  })

  it('shows the truncation warning when isTruncated is true', () => {
    render(<ReportPreviewPanel data={makeData({ isTruncated: true })} />)
    expect(screen.getByText(/mais de 5\.000 registros/i)).toBeInTheDocument()
  })
})
