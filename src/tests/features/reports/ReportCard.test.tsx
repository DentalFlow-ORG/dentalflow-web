import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

import { ReportCard } from '@/features/reports/components/ReportCard'
import type { ReportPreviewResponse } from '@/features/reports/types/reports.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const noop = vi.fn(() => Promise.resolve())

function makePreviewData(overrides: Partial<ReportPreviewResponse> = {}): ReportPreviewResponse {
  return {
    reportType: 'finance',
    reportTitle: 'Relatório financeiro',
    clinic: { name: 'Clínica Teste', document: null },
    generatedAt: '2026-06-07T12:00:00.000Z',
    filters: [],
    period: { startDate: '2026-05-07', endDate: '2026-06-06', label: '07/05/2026 até 06/06/2026' },
    recordCount: 10,
    maxRecords: 5000,
    isTruncated: false,
    exportFormat: 'CSV',
    empty: false,
    previewNote: null,
    ...overrides,
  }
}

function renderCard(props: Partial<React.ComponentProps<typeof ReportCard>> = {}) {
  return render(
    <ReportCard
      title="Relatório financeiro"
      description="Receitas, despesas e resultado líquido por período."
      onExport={noop}
      {...props}
    />,
  )
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Title and description ─────────────────────────────────────────────────────

describe('ReportCard — title and description', () => {
  it('renders title as h3', () => {
    renderCard()
    expect(
      screen.getByRole('heading', { name: 'Relatório financeiro', level: 3 }),
    ).toBeInTheDocument()
  })

  it('renders description text', () => {
    renderCard()
    expect(screen.getByText(/receitas, despesas/i)).toBeInTheDocument()
  })
})

// ── CSV badge ─────────────────────────────────────────────────────────────────

describe('ReportCard — CSV badge', () => {
  it('renders CSV badge', () => {
    renderCard()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })
})

// ── Children / filters ───────────────────────────────────────────────────────

describe('ReportCard — children', () => {
  it('renders children content', () => {
    renderCard({ children: <div>Filtros de teste</div> })
    expect(screen.getByText('Filtros de teste')).toBeInTheDocument()
  })

  it('renders without children', () => {
    renderCard()
    expect(
      screen.getByRole('heading', { name: 'Relatório financeiro', level: 3 }),
    ).toBeInTheDocument()
  })
})

// ── Notice ────────────────────────────────────────────────────────────────────

describe('ReportCard — notice', () => {
  it('renders notice text when provided', () => {
    renderCard({ notice: 'Relatório interno apenas.' })
    expect(screen.getByText('Relatório interno apenas.')).toBeInTheDocument()
  })

  it('does not render notice element when not provided', () => {
    renderCard()
    expect(screen.queryByText(/relatório interno/i)).not.toBeInTheDocument()
  })
})

// ── Error ─────────────────────────────────────────────────────────────────────

describe('ReportCard — error', () => {
  it('renders error message when error prop is provided', () => {
    renderCard({ error: 'Intervalo máximo de 12 meses.' })
    expect(screen.getByText('Intervalo máximo de 12 meses.')).toBeInTheDocument()
  })

  it('does not render error element when error is null', () => {
    renderCard({ error: null })
    expect(screen.queryByText(/meses/i)).not.toBeInTheDocument()
  })

  it('does not render error element when error is undefined', () => {
    renderCard({ error: undefined })
    expect(screen.queryByText(/meses/i)).not.toBeInTheDocument()
  })
})

// ── Export button ─────────────────────────────────────────────────────────────

describe('ReportCard — export button', () => {
  it('renders "Exportar CSV" button', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
  })

  it('calls onExport when button is clicked', async () => {
    const onExport = vi.fn(() => Promise.resolve())
    renderCard({ onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1))
  })

  it('shows success alert after successful export', async () => {
    renderCard({ onExport: vi.fn(() => Promise.resolve()) })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' })),
    )
  })

  it('shows error alert when onExport rejects', async () => {
    const onExport = vi.fn(() => Promise.reject(new Error('Falha na rede.')))
    renderCard({ onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao exportar', tone: 'error' }),
      ),
    )
  })
})

// ── Disabled state ────────────────────────────────────────────────────────────

describe('ReportCard — disabled state', () => {
  it('disables button when disabled=true', () => {
    renderCard({ disabled: true })
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeDisabled()
  })

  it('does not call onExport when disabled', () => {
    const onExport = vi.fn(() => Promise.resolve())
    renderCard({ disabled: true, onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    expect(onExport).not.toHaveBeenCalled()
  })

  it('sets aria-describedby on button when disabled and error present', () => {
    renderCard({ disabled: true, error: 'Intervalo máximo de 12 meses.' })
    const button = screen.getByRole('button', { name: /exportar csv/i })
    expect(button).toHaveAttribute('aria-describedby')
  })

  it('does not set aria-describedby when disabled but no error', () => {
    renderCard({ disabled: true, error: undefined })
    const button = screen.getByRole('button', { name: /exportar csv/i })
    expect(button).not.toHaveAttribute('aria-describedby')
  })

  it('does not set aria-describedby when not disabled', () => {
    renderCard({ disabled: false, error: undefined })
    const button = screen.getByRole('button', { name: /exportar csv/i })
    expect(button).not.toHaveAttribute('aria-describedby')
  })
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('ReportCard — loading state', () => {
  it('shows "Gerando..." while export is in progress', async () => {
    let resolve!: () => void
    const onExport = vi.fn(
      () =>
        new Promise<void>((res) => {
          resolve = res
        }),
    )
    renderCard({ onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    expect(await screen.findByText('Gerando...')).toBeInTheDocument()
    resolve()
  })

  it('disables button while loading', async () => {
    let resolve!: () => void
    const onExport = vi.fn(
      () =>
        new Promise<void>((res) => {
          resolve = res
        }),
    )
    renderCard({ onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    await screen.findByText('Gerando...')
    expect(screen.getByRole('button', { name: /gerando/i })).toBeDisabled()
    resolve()
  })

  it('re-enables button after export completes', async () => {
    renderCard({ onExport: vi.fn(() => Promise.resolve()) })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /exportar csv/i })).not.toBeDisabled(),
    )
  })
})

// ── Tone / accent ─────────────────────────────────────────────────────────────

describe('ReportCard — tone classes', () => {
  it('applies primary tone border-t class', () => {
    const { container } = renderCard({ tone: 'primary' })
    expect(container.firstChild).toHaveClass('border-t-2')
    expect(container.firstChild).toHaveClass('border-t-primary')
  })

  it('applies info tone border-t class', () => {
    const { container } = renderCard({ tone: 'info' })
    expect(container.firstChild).toHaveClass('border-t-2')
    expect(container.firstChild).toHaveClass('border-t-blue-400')
  })

  it('does not add extra border-t class for neutral tone', () => {
    const { container } = renderCard({ tone: 'neutral' })
    expect(container.firstChild).not.toHaveClass('border-t-primary')
    expect(container.firstChild).not.toHaveClass('border-t-blue-400')
  })

  it('applies shadow-sm to all cards', () => {
    const { container } = renderCard()
    expect(container.firstChild).toHaveClass('shadow-sm')
  })
})

// ── Footer separator ──────────────────────────────────────────────────────────

describe('ReportCard — footer action area', () => {
  it('footer section has border-t class', () => {
    const { container } = renderCard()
    const footer = container.querySelector('.border-t.border-border')
    expect(footer).toBeInTheDocument()
  })
})

// ── Without onPreview (direct-export behavior) ───────────────────────────────

describe('ReportCard — direct export (no onPreview)', () => {
  it('renders "Exportar CSV" button when onPreview is absent', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
  })

  it('does not render "Pré-visualizar relatório" when onPreview is absent', () => {
    renderCard()
    expect(screen.queryByRole('button', { name: /pré-visualizar/i })).not.toBeInTheDocument()
  })
})

// ── Preview button ────────────────────────────────────────────────────────────

describe('ReportCard — preview button', () => {
  it('renders "Pré-visualizar relatório" button when onPreview is provided', () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData()) })
    expect(screen.getByRole('button', { name: /pré-visualizar relatório/i })).toBeInTheDocument()
  })

  it('does not render "Exportar CSV" initially when onPreview is provided', () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData()) })
    expect(screen.queryByRole('button', { name: /exportar csv/i })).not.toBeInTheDocument()
  })
})

// ── Preview flow ──────────────────────────────────────────────────────────────

describe('ReportCard — preview flow', () => {
  it('calls onPreview (not onExport) when preview button is clicked', async () => {
    const onExport = vi.fn(() => Promise.resolve())
    const onPreview = vi.fn().mockResolvedValue(makePreviewData())
    renderCard({ onPreview, onExport })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(onPreview).toHaveBeenCalledTimes(1))
    expect(onExport).not.toHaveBeenCalled()
  })

  it('shows preview panel title after successful preview', async () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData()) })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText('Prévia do relatório')).toBeInTheDocument())
  })

  it('shows clinic name in preview panel', async () => {
    renderCard({
      onPreview: vi
        .fn()
        .mockResolvedValue(
          makePreviewData({ clinic: { name: 'Clínica Sorriso', document: null } }),
        ),
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText('Clínica Sorriso')).toBeInTheDocument())
  })

  it('shows record count in preview panel', async () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData({ recordCount: 42 })) })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText(/42/)).toBeInTheDocument())
  })

  it('shows applied filters in preview panel', async () => {
    renderCard({
      onPreview: vi
        .fn()
        .mockResolvedValue(makePreviewData({ filters: [{ label: 'Tipo', value: 'Receita' }] })),
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText('Receita')).toBeInTheDocument())
  })

  it('shows "Baixar CSV" after non-empty preview', async () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData({ recordCount: 5 })) })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /baixar csv/i })).toBeInTheDocument(),
    )
  })

  it('shows empty message and hides "Baixar CSV" after zero-record preview', async () => {
    renderCard({
      onPreview: vi.fn().mockResolvedValue(makePreviewData({ recordCount: 0, empty: true })),
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() =>
      expect(
        screen.getByText(/nenhum registro encontrado para os filtros aplicados/i),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /baixar csv/i })).not.toBeInTheDocument()
  })

  it('calls onExport when "Baixar CSV" is clicked', async () => {
    const onExport = vi.fn(() => Promise.resolve())
    renderCard({
      onPreview: vi.fn().mockResolvedValue(makePreviewData({ recordCount: 5 })),
      onExport,
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /baixar csv/i })).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByRole('button', { name: /baixar csv/i }))
    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1))
  })

  it('shows "Nova prévia" ghost button after preview completes', async () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData()) })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /nova prévia/i })).toBeInTheDocument(),
    )
  })

  it('clicking "Nova prévia" resets to idle and shows preview button again', async () => {
    renderCard({ onPreview: vi.fn().mockResolvedValue(makePreviewData()) })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => screen.getByRole('button', { name: /nova prévia/i }))
    fireEvent.click(screen.getByRole('button', { name: /nova prévia/i }))
    expect(screen.getByRole('button', { name: /pré-visualizar relatório/i })).toBeInTheDocument()
  })
})

// ── Preview loading state ─────────────────────────────────────────────────────

describe('ReportCard — preview loading state', () => {
  it('shows "Carregando prévia..." while preview is in progress', async () => {
    let resolve!: (v: ReportPreviewResponse) => void
    const onPreview = vi.fn(
      () =>
        new Promise<ReportPreviewResponse>((res) => {
          resolve = res
        }),
    )
    renderCard({ onPreview })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    expect(await screen.findByText(/carregando prévia/i)).toBeInTheDocument()
    resolve(makePreviewData())
  })

  it('disables preview button while previewing', async () => {
    let resolve!: (v: ReportPreviewResponse) => void
    const onPreview = vi.fn(
      () =>
        new Promise<ReportPreviewResponse>((res) => {
          resolve = res
        }),
    )
    renderCard({ onPreview })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await screen.findByText(/carregando prévia/i)
    expect(screen.getByRole('button', { name: /carregando prévia/i })).toBeDisabled()
    resolve(makePreviewData())
  })
})

// ── Preview error ─────────────────────────────────────────────────────────────

describe('ReportCard — preview error', () => {
  it('shows error message when preview call fails', async () => {
    const onPreview = vi.fn().mockRejectedValue(new Error('Falha ao carregar prévia.'))
    renderCard({ onPreview })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText(/falha ao carregar prévia/i)).toBeInTheDocument())
  })

  it('shows "Nova prévia" button after a preview error', async () => {
    const onPreview = vi.fn().mockRejectedValue(new Error('Erro de rede.'))
    renderCard({ onPreview })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /nova prévia/i })).toBeInTheDocument(),
    )
  })
})

// ── Truncation warning ────────────────────────────────────────────────────────

describe('ReportCard — truncation warning', () => {
  it('shows truncation warning when isTruncated is true', async () => {
    renderCard({
      onPreview: vi
        .fn()
        .mockResolvedValue(makePreviewData({ isTruncated: true, recordCount: 6000 })),
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => expect(screen.getByText(/mais de 5\.000 registros/i)).toBeInTheDocument())
  })

  it('does not show truncation warning when isTruncated is false', async () => {
    renderCard({
      onPreview: vi.fn().mockResolvedValue(makePreviewData({ isTruncated: false })),
    })
    fireEvent.click(screen.getByRole('button', { name: /pré-visualizar relatório/i }))
    await waitFor(() => screen.getByText('Prévia do relatório'))
    expect(screen.queryByText(/mais de 5\.000 registros/i)).not.toBeInTheDocument()
  })
})
