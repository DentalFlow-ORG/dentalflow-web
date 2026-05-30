import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import type { LeadFilters } from '../types/leads.types'
import { LeadsFilters } from './LeadsFilters'

const baseFilters: LeadFilters = {
  search: '',
  status: '',
  source: '',
  assignedToUserId: '',
  hasFollowUp: false,
  page: 1,
  limit: 30,
}

function renderFilters(
  props: Partial<Parameters<typeof LeadsFilters>[0]> = {},
) {
  const onChange = vi.fn()
  const onClear = vi.fn()
  renderWithProviders(
    <LeadsFilters
      filters={baseFilters}
      onChange={onChange}
      onClear={onClear}
      hasActiveFilters={false}
      {...props}
    />,
  )
  return { onChange, onClear }
}

// ── Toggle rendering ──────────────────────────────────────────────────────────

describe('LeadsFilters — "Com retorno" toggle', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the "Com retorno" toggle button', () => {
    renderFilters()
    expect(screen.getByRole('button', { name: /Com retorno/i })).toBeInTheDocument()
  })

  it('toggle is not pressed by default (hasFollowUp=false)', () => {
    renderFilters()
    expect(screen.getByRole('button', { name: /Com retorno/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('toggle is pressed when hasFollowUp=true in filters', () => {
    renderFilters({ filters: { ...baseFilters, hasFollowUp: true } })
    expect(screen.getByRole('button', { name: /Com retorno/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('clicking inactive toggle calls onChange with hasFollowUp=true and page=1', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()

    await user.click(screen.getByRole('button', { name: /Com retorno/i }))

    expect(onChange).toHaveBeenCalledWith({ hasFollowUp: true, page: 1 })
  })

  it('clicking active toggle calls onChange with hasFollowUp=false and page=1', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters({ filters: { ...baseFilters, hasFollowUp: true } })

    await user.click(screen.getByRole('button', { name: /Com retorno/i }))

    expect(onChange).toHaveBeenCalledWith({ hasFollowUp: false, page: 1 })
  })
})

// ── Clear filters button ──────────────────────────────────────────────────────

describe('LeadsFilters — clear button', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clear button is visible when hasActiveFilters=true', () => {
    renderFilters({ hasActiveFilters: true })
    expect(screen.getByRole('button', { name: /Limpar filtros/i })).toBeInTheDocument()
  })

  it('clear button is absent when hasActiveFilters=false', () => {
    renderFilters({ hasActiveFilters: false })
    expect(screen.queryByRole('button', { name: /Limpar filtros/i })).not.toBeInTheDocument()
  })

  it('clicking clear button calls onClear', async () => {
    const user = userEvent.setup()
    const { onClear } = renderFilters({ hasActiveFilters: true })

    await user.click(screen.getByRole('button', { name: /Limpar filtros/i }))

    expect(onClear).toHaveBeenCalledOnce()
  })
})
