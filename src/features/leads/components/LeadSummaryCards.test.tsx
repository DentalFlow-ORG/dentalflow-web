import { renderWithProviders, screen, userEvent } from '@/test/render-utils'
import type { LeadSummary } from '../types/leads.types'
import { LeadSummaryCards } from './LeadSummaryCards'

const mockSummary: LeadSummary = {
  new: 5,
  contacted: 3,
  scheduled: 2,
  converted: 1,
  lost: 4,
  archived: 7,
}

function renderCards(props: Partial<Parameters<typeof LeadSummaryCards>[0]> = {}) {
  return renderWithProviders(
    <LeadSummaryCards summary={mockSummary} isLoading={false} {...props} />,
  )
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('LeadSummaryCards — rendering', () => {
  it('renders all 5 visible cards with correct counts', () => {
    renderCards()
    expect(screen.getByText('Novos')).toBeInTheDocument()
    expect(screen.getByText('Em contato')).toBeInTheDocument()
    expect(screen.getByText('Agendados')).toBeInTheDocument()
    expect(screen.getByText('Convertidos')).toBeInTheDocument()
    expect(screen.getByText('Perdidos')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('does not render ARCHIVED card or its count', () => {
    renderCards()
    expect(screen.queryByText('Arquivados')).not.toBeInTheDocument()
    // '7' is the archived count — must not appear
    expect(screen.queryByText('7')).not.toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading=true (no card labels visible)', () => {
    renderCards({ isLoading: true })
    expect(screen.queryByText('Novos')).not.toBeInTheDocument()
    expect(screen.queryByText('Perdidos')).not.toBeInTheDocument()
  })

  it('renders zero counts when summary is null', () => {
    renderCards({ summary: null })
    expect(screen.getAllByText('0')).toHaveLength(5)
  })

  it('renders as static divs (not buttons) when onCardClick is not provided', () => {
    renderCards()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

// ── Interactivity ─────────────────────────────────────────────────────────────

describe('LeadSummaryCards — interactivity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders as buttons when onCardClick is provided', () => {
    renderCards({ onCardClick: vi.fn() })
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('clicking a non-active card calls onCardClick with the correct LeadStatus', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    renderCards({ onCardClick })

    await user.click(screen.getByRole('button', { name: /Novos/i }))
    expect(onCardClick).toHaveBeenCalledWith('NEW')

    await user.click(screen.getByRole('button', { name: /Em contato/i }))
    expect(onCardClick).toHaveBeenCalledWith('CONTACTED')

    await user.click(screen.getByRole('button', { name: /Perdidos/i }))
    expect(onCardClick).toHaveBeenCalledWith('LOST')
  })

  it('clicking the active card calls onCardClick with undefined to clear the filter', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    renderCards({ activeStatus: 'NEW', onCardClick })

    await user.click(screen.getByRole('button', { name: /Novos/i }))
    expect(onCardClick).toHaveBeenCalledWith(undefined)
  })

  it('active card has aria-pressed=true', () => {
    renderCards({ activeStatus: 'CONVERTED', onCardClick: vi.fn() })
    expect(screen.getByRole('button', { name: /Convertidos/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('non-active cards have aria-pressed=false', () => {
    renderCards({ activeStatus: 'NEW', onCardClick: vi.fn() })
    expect(screen.getByRole('button', { name: /Em contato/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: /Agendados/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
