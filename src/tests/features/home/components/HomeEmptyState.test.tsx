import { CalendarDays } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'

// ── Full (non-compact) mode ───────────────────────────────────────────────────

describe('HomeEmptyState — full mode (default)', () => {
  it('renders the title', () => {
    render(<HomeEmptyState title="Nenhuma consulta hoje" />)
    expect(screen.getByText('Nenhuma consulta hoje')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<HomeEmptyState title="Sem leads" description="Crie o primeiro lead para começar." />)
    expect(screen.getByText('Crie o primeiro lead para começar.')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    const { container } = render(<HomeEmptyState title="Sem dados" />)
    // The description renders in a <p class="...text-muted-foreground...">
    // When omitted, only the title <p> should be present
    const allP = container.querySelectorAll('p')
    // title text should be the only non-empty text paragraph
    const textParagraphs = Array.from(allP).filter((p) => p.textContent?.trim())
    expect(textParagraphs).toHaveLength(1)
    expect(textParagraphs[0]).toHaveTextContent('Sem dados')
  })

  it('renders the icon when provided', () => {
    const { container } = render(
      <HomeEmptyState title="Sem consultas" icon={CalendarDays} />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('does not render icon container when icon is omitted', () => {
    const { container } = render(<HomeEmptyState title="Sem dados" />)
    // No aria-hidden icon
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('renders the action slot when provided', () => {
    render(
      <HomeEmptyState
        title="Sem agendamentos"
        action={<button type="button">Criar agendamento</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Criar agendamento' })).toBeInTheDocument()
  })
})

// ── Compact mode ──────────────────────────────────────────────────────────────

describe('HomeEmptyState — compact mode', () => {
  it('renders the title in compact mode', () => {
    render(<HomeEmptyState title="Nenhum produto crítico" compact />)
    expect(screen.getByText('Nenhum produto crítico')).toBeInTheDocument()
  })

  it('renders the description in compact mode', () => {
    render(
      <HomeEmptyState
        title="Sem alertas"
        description="Estoque normalizado"
        compact
      />,
    )
    expect(screen.getByText('Estoque normalizado')).toBeInTheDocument()
  })

  it('renders the icon in compact mode', () => {
    const { container } = render(
      <HomeEmptyState title="Sem dados" icon={CalendarDays} compact />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('renders the action slot in compact mode', () => {
    render(
      <HomeEmptyState
        title="Sem pagamentos"
        action={<a href="/app/financeiro">Ver financeiro</a>}
        compact
      />,
    )
    expect(screen.getByRole('link', { name: 'Ver financeiro' })).toBeInTheDocument()
  })
})
