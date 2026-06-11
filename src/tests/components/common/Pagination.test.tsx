import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import { Pagination } from '@/components/common/Pagination'

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPagination(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const defaults = {
    page: 1,
    totalPages: 3,
    filteredCount: 25,
    pageSize: 10,
    onPageChange: vi.fn(),
  }
  return render(<Pagination {...defaults} {...overrides} />)
}

// ── Visibility ────────────────────────────────────────────────────────────────

describe('Pagination — visibility', () => {
  it('returns null when totalPages is 1 and no onPageSizeChange', () => {
    const { container } = renderPagination({ totalPages: 1, onPageSizeChange: undefined })
    expect(container.firstChild).toBeNull()
  })

  it('renders when totalPages > 1', () => {
    renderPagination({ totalPages: 2 })
    expect(screen.getByTitle('Página anterior')).toBeInTheDocument()
  })

  it('renders when totalPages is 1 but onPageSizeChange is provided', () => {
    renderPagination({ totalPages: 1, onPageSizeChange: vi.fn() })
    expect(screen.getByText('Por página')).toBeInTheDocument()
  })
})

// ── Items-per-page selector ───────────────────────────────────────────────────

describe('Pagination — items-per-page selector', () => {
  it('renders "Por página" label when onPageSizeChange is provided', () => {
    renderPagination({ onPageSizeChange: vi.fn() })
    expect(screen.getByText('Por página')).toBeInTheDocument()
  })

  it('does not render "Por página" label when onPageSizeChange is absent', () => {
    renderPagination()
    expect(screen.queryByText('Por página')).not.toBeInTheDocument()
  })

  it('displays the current pageSize in the trigger', () => {
    renderPagination({ pageSize: 25, onPageSizeChange: vi.fn() })
    expect(screen.getByRole('combobox')).toHaveTextContent('25')
  })

  it('shows default options when the selector is opened', async () => {
    const user = userEvent.setup()
    renderPagination({ onPageSizeChange: vi.fn() })

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument()
  })

  it('calls onPageSizeChange and resets page when an option is selected', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    const onPageChange = vi.fn()
    renderPagination({ onPageSizeChange, onPageChange })

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: '25' }))

    expect(onPageSizeChange).toHaveBeenCalledWith(25)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('renders custom pageSizeOptions when provided', async () => {
    const user = userEvent.setup()
    renderPagination({ pageSizeOptions: [5, 15, 30], onPageSizeChange: vi.fn() })

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '15' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '30' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '10' })).not.toBeInTheDocument()
  })
})

// ── Results count text ────────────────────────────────────────────────────────

describe('Pagination — results text', () => {
  it('shows range and total for current page', () => {
    renderPagination({ page: 2, totalPages: 3, filteredCount: 25, pageSize: 10 })
    expect(screen.getByText('11–20 de 25 resultados')).toBeInTheDocument()
  })

  it('uses singular "resultado" when filteredCount is 1', () => {
    renderPagination({
      page: 1,
      totalPages: 1,
      filteredCount: 1,
      pageSize: 10,
      onPageSizeChange: vi.fn(),
    })
    expect(screen.getByText('1–1 de 1 resultado')).toBeInTheDocument()
  })

  it('does not show results text when filteredCount is 0', () => {
    renderPagination({ page: 1, totalPages: 2, filteredCount: 0, pageSize: 10 })
    expect(screen.queryByText(/resultados/)).not.toBeInTheDocument()
  })
})

// ── Page navigation ───────────────────────────────────────────────────────────

describe('Pagination — page navigation', () => {
  it('renders previous and next buttons when totalPages > 1', () => {
    renderPagination()
    expect(screen.getByTitle('Página anterior')).toBeInTheDocument()
    expect(screen.getByTitle('Próxima página')).toBeInTheDocument()
  })

  it('disables previous button on the first page', () => {
    renderPagination({ page: 1 })
    expect(screen.getByTitle('Página anterior')).toBeDisabled()
  })

  it('disables next button on the last page', () => {
    renderPagination({ page: 3, totalPages: 3 })
    expect(screen.getByTitle('Próxima página')).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when previous is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ page: 2, onPageChange })

    await user.click(screen.getByTitle('Página anterior'))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with page + 1 when next is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderPagination({ page: 1, onPageChange })

    await user.click(screen.getByTitle('Próxima página'))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('shows current page and total pages', () => {
    renderPagination({ page: 2, totalPages: 5 })
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
