import { Calendar } from 'lucide-react'

import { fireEvent, render, screen } from '@/test-utils/render-utils'

import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

// ── Link variant ──────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — link variant', () => {
  it('renders as an anchor when `to` is provided', () => {
    render(<HomeQuickActionCard title="Agendamentos" to="/app/agendamentos" />)
    const link = screen.getByRole('link', { name: /agendamentos/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/app/agendamentos')
  })

  it('renders the title text', () => {
    render(<HomeQuickActionCard title="Leads" to="/app/leads" />)
    expect(screen.getByText('Leads')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<HomeQuickActionCard title="Agenda" description="Ver consultas do dia" to="/app/agendamentos" />)
    expect(screen.getByText('Ver consultas do dia')).toBeInTheDocument()
  })

  it('renders a chevron icon', () => {
    const { container } = render(<HomeQuickActionCard title="Leads" to="/app/leads" />)
    // ChevronRight is aria-hidden
    const chevron = container.querySelector('[aria-hidden="true"]')
    expect(chevron).toBeTruthy()
  })
})

// ── Button variant ────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — button variant', () => {
  it('renders as a button when `onClick` is provided', () => {
    render(<HomeQuickActionCard title="Criar agendamento" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /criar agendamento/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<HomeQuickActionCard title="Criar agendamento" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ── Icon ──────────────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — icon', () => {
  it('renders the icon when provided', () => {
    const { container } = render(
      <HomeQuickActionCard title="Agenda" to="/app/agendamentos" icon={Calendar} />,
    )
    // Icon container is aria-hidden
    const iconBox = container.querySelector('[aria-hidden="true"]')
    expect(iconBox).toBeTruthy()
  })
})

// ── Badge ─────────────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — badge', () => {
  it('renders a numeric badge when provided', () => {
    render(<HomeQuickActionCard title="Pendentes" to="/app/agendamentos" badge={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders a string badge when provided', () => {
    render(<HomeQuickActionCard title="Leads" to="/app/leads" badge="5 novos" />)
    expect(screen.getByText('5 novos')).toBeInTheDocument()
  })

  it('does not render a badge when omitted', () => {
    render(<HomeQuickActionCard title="Agenda" to="/app/agendamentos" />)
    // No span with badge styling classes
    const { container } = render(<HomeQuickActionCard title="Agenda" to="/app/agendamentos" />)
    expect(container.querySelectorAll('[class*="rounded-full"]').length).toBe(0)
  })
})

// ── Disabled state ────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — disabled', () => {
  it('disables the button and does not call onClick', () => {
    const onClick = vi.fn()
    render(<HomeQuickActionCard title="Ação" onClick={onClick} disabled />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('marks link as aria-disabled when disabled', () => {
    render(<HomeQuickActionCard title="Leads" to="/app/leads" disabled />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-disabled', 'true')
  })
})

// ── Tones ─────────────────────────────────────────────────────────────────────

describe('HomeQuickActionCard — tones', () => {
  it('accepts all valid tones without error', () => {
    const tones = ['neutral', 'primary', 'warning', 'danger'] as const
    tones.forEach((tone) => {
      const { unmount } = render(
        <HomeQuickActionCard title="Test" to="/app" tone={tone} />,
      )
      expect(screen.getByText('Test')).toBeInTheDocument()
      unmount()
    })
  })
})
