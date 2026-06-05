import { render, screen } from '@/test-utils/render-utils'

import { TeamRoleBadge } from '@/features/team/components/TeamRoleBadge'

// ── Known role labels ─────────────────────────────────────────────────────────

describe('TeamRoleBadge — known roles', () => {
  it('renders "Profissional" for DENTIST', () => {
    render(<TeamRoleBadge role="DENTIST" />)
    expect(screen.getByText('Profissional')).toBeInTheDocument()
  })

  it('renders "Profissional" for DOCTOR', () => {
    render(<TeamRoleBadge role="DOCTOR" />)
    expect(screen.getByText('Profissional')).toBeInTheDocument()
  })

  it('renders "Assistente" for ASSISTANT', () => {
    render(<TeamRoleBadge role="ASSISTANT" />)
    expect(screen.getByText('Assistente')).toBeInTheDocument()
  })

  it('renders "Dono" for OWNER', () => {
    render(<TeamRoleBadge role="OWNER" />)
    expect(screen.getByText('Dono')).toBeInTheDocument()
  })

  it('renders "Admin" for ADMIN', () => {
    render(<TeamRoleBadge role="ADMIN" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders "Paciente" for PATIENT', () => {
    render(<TeamRoleBadge role="PATIENT" />)
    expect(screen.getByText('Paciente')).toBeInTheDocument()
  })
})

// ── Unknown role fallback ─────────────────────────────────────────────────────

describe('TeamRoleBadge — unknown role fallback', () => {
  it('renders the raw role string for an unrecognised role', () => {
    render(<TeamRoleBadge role="SUPER_ADMIN" />)
    expect(screen.getByText('SUPER_ADMIN')).toBeInTheDocument()
  })

  it('does not throw for an empty string role', () => {
    expect(() => render(<TeamRoleBadge role="" />)).not.toThrow()
  })
})

// ── Visible text ──────────────────────────────────────────────────────────────

describe('TeamRoleBadge — visible text', () => {
  it('renders a visible span element (not color-only)', () => {
    const { container } = render(<TeamRoleBadge role="DENTIST" />)
    const badge = container.firstElementChild
    expect(badge?.tagName.toLowerCase()).toBe('span')
    expect(badge?.textContent).toBeTruthy()
  })
})
