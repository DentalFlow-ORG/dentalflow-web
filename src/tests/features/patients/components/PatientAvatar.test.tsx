import { render, screen } from '@/test-utils/render-utils'

import { PatientAvatar } from '@/features/patients/components/PatientAvatar'

// ── Image rendering ───────────────────────────────────────────────────────────

describe('PatientAvatar — image', () => {
  it('renders an img element when avatarUrl is provided', () => {
    const { container } = render(<PatientAvatar name="Ana Lima" avatarUrl="abc123base64" />)
    // The outer div carries role="img"; the inner <img> is aria-hidden
    const wrapper = screen.getByRole('img', { name: 'Ana Lima' })
    expect(wrapper.tagName).toBe('DIV')
    const innerImg = container.querySelector('img')
    expect(innerImg).toBeTruthy()
    expect(innerImg?.getAttribute('src')).toContain('abc123base64')
    expect(innerImg?.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('renders initials when avatarUrl is null', () => {
    render(<PatientAvatar name="Pedro Martins" avatarUrl={null} />)
    expect(screen.getByText('PM')).toBeInTheDocument()
    expect(screen.queryByRole('img', { hidden: false })?.querySelector('img')).toBeFalsy()
  })

  it('renders initials when avatarUrl is undefined', () => {
    render(<PatientAvatar name="Carla Santos" />)
    expect(screen.getByText('CS')).toBeInTheDocument()
  })
})

// ── Initials edge cases ───────────────────────────────────────────────────────

describe('PatientAvatar — initials fallback', () => {
  it('renders first two letters for a single-word name', () => {
    render(<PatientAvatar name="Maria" />)
    expect(screen.getByText('MA')).toBeInTheDocument()
  })

  it('renders first + last initial for a multi-word name', () => {
    render(<PatientAvatar name="João Paulo Silva" />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renders "?" for an empty name', () => {
    render(<PatientAvatar name="" />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders "?" for a whitespace-only name', () => {
    render(<PatientAvatar name="   " />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})

// ── Accessible label ──────────────────────────────────────────────────────────

describe('PatientAvatar — accessibility', () => {
  it('has an accessible label matching the patient name', () => {
    render(<PatientAvatar name="Fernanda Rocha" />)
    expect(screen.getByRole('img', { name: 'Fernanda Rocha' })).toBeInTheDocument()
  })

  it('uses "Paciente" as label when name is empty', () => {
    render(<PatientAvatar name="" />)
    expect(screen.getByRole('img', { name: 'Paciente' })).toBeInTheDocument()
  })
})

// ── Size variants ─────────────────────────────────────────────────────────────

describe('PatientAvatar — size variants', () => {
  it('renders without error for size sm', () => {
    render(<PatientAvatar name="Test" size="sm" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders without error for size md (default)', () => {
    render(<PatientAvatar name="Test" size="md" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders without error for size lg', () => {
    render(<PatientAvatar name="Test" size="lg" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
