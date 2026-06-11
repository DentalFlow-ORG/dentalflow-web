import { render, screen } from '@/test-utils/render-utils'

import { TeamMemberAvatar } from '@/features/team/components/TeamMemberAvatar'

// ── Initials ──────────────────────────────────────────────────────────────────

describe('TeamMemberAvatar — initials', () => {
  it('derives initials from firstName and lastName', () => {
    render(<TeamMemberAvatar firstName="João" lastName="Silva" />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('uses first two characters when only firstName is provided', () => {
    render(<TeamMemberAvatar firstName="Ana" />)
    expect(screen.getByText('AN')).toBeInTheDocument()
  })

  it('falls back to email local-part when no name is provided', () => {
    render(<TeamMemberAvatar email="carlos@clinica.com" />)
    expect(screen.getByText('CA')).toBeInTheDocument()
  })

  it('renders "?" when no name or email is provided', () => {
    render(<TeamMemberAvatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('handles accented characters correctly', () => {
    render(<TeamMemberAvatar firstName="Érica" lastName="Ávila" />)
    expect(screen.getByText('ÉÁ')).toBeInTheDocument()
  })

  it('uses only firstName when lastName is an empty string', () => {
    render(<TeamMemberAvatar firstName="Pedro" lastName="" />)
    expect(screen.getByText('PE')).toBeInTheDocument()
  })
})

// ── Accessible label ──────────────────────────────────────────────────────────

describe('TeamMemberAvatar — accessibility', () => {
  it('sets aria-label to the full name', () => {
    render(<TeamMemberAvatar firstName="Maria" lastName="Costa" />)
    expect(screen.getByRole('img', { name: 'Maria Costa' })).toBeInTheDocument()
  })

  it('sets aria-label to firstName alone when lastName is absent', () => {
    render(<TeamMemberAvatar firstName="Lucas" />)
    expect(screen.getByRole('img', { name: 'Lucas' })).toBeInTheDocument()
  })

  it('sets aria-label to email when no name is provided', () => {
    render(<TeamMemberAvatar email="dr@example.com" />)
    expect(screen.getByRole('img', { name: 'dr@example.com' })).toBeInTheDocument()
  })

  it('falls back to "Membro da equipe" when nothing is provided', () => {
    render(<TeamMemberAvatar />)
    expect(screen.getByRole('img', { name: 'Membro da equipe' })).toBeInTheDocument()
  })
})

// ── Size variants ─────────────────────────────────────────────────────────────

describe('TeamMemberAvatar — size variants', () => {
  it('applies sm size classes', () => {
    const { container } = render(<TeamMemberAvatar firstName="A" size="sm" />)
    expect(container.firstElementChild).toHaveClass('h-8', 'w-8')
  })

  it('applies md size classes (default)', () => {
    const { container } = render(<TeamMemberAvatar firstName="A" />)
    expect(container.firstElementChild).toHaveClass('h-10', 'w-10')
  })

  it('applies lg size classes', () => {
    const { container } = render(<TeamMemberAvatar firstName="A" size="lg" />)
    expect(container.firstElementChild).toHaveClass('h-14', 'w-14')
  })
})

// ── Role-aware coloring ───────────────────────────────────────────────────────

describe('TeamMemberAvatar — role coloring', () => {
  it('applies primary color for DENTIST role', () => {
    const { container } = render(
      <TeamMemberAvatar firstName="Dr" lastName="Santos" role="DENTIST" />,
    )
    expect(container.firstElementChild?.className).toContain('text-primary')
  })

  it('applies slate color for ASSISTANT role', () => {
    const { container } = render(
      <TeamMemberAvatar firstName="Ana" lastName="Lima" role="ASSISTANT" />,
    )
    expect(container.firstElementChild?.className).toContain('text-slate-600')
  })

  it('applies muted color for unknown role', () => {
    const { container } = render(<TeamMemberAvatar firstName="X" role="UNKNOWN_ROLE" />)
    expect(container.firstElementChild?.className).toContain('text-muted-foreground')
  })

  it('applies muted color when role is omitted', () => {
    const { container } = render(<TeamMemberAvatar firstName="X" />)
    expect(container.firstElementChild?.className).toContain('text-muted-foreground')
  })
})
