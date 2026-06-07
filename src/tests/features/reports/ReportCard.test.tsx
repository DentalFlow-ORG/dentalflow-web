import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

import { ReportCard } from '@/features/reports/components/ReportCard'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockShowAlert = vi.fn()

vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const noop = vi.fn(() => Promise.resolve())

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
    expect(screen.getByRole('heading', { name: 'Relatório financeiro', level: 3 })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Relatório financeiro', level: 3 })).toBeInTheDocument()
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
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'success' }),
      ),
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
      () => new Promise<void>((res) => { resolve = res }),
    )
    renderCard({ onExport })
    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))
    expect(await screen.findByText('Gerando...')).toBeInTheDocument()
    resolve()
  })

  it('disables button while loading', async () => {
    let resolve!: () => void
    const onExport = vi.fn(
      () => new Promise<void>((res) => { resolve = res }),
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
