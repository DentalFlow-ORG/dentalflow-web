import { render, screen } from '@/test-utils/render-utils'

import { PatientIdentityBadge } from '@/features/patients/components/PatientIdentityBadge'

// ── Name ──────────────────────────────────────────────────────────────────────

describe('PatientIdentityBadge — name', () => {
  it('renders the patient name', () => {
    render(<PatientIdentityBadge name="Ana Silveira" />)
    expect(screen.getByText('Ana Silveira')).toBeInTheDocument()
  })

  it('renders "Paciente" when name is empty', () => {
    render(<PatientIdentityBadge name="" />)
    expect(screen.getByText('Paciente')).toBeInTheDocument()
  })
})

// ── Contact info ──────────────────────────────────────────────────────────────

describe('PatientIdentityBadge — contact info', () => {
  it('renders email when provided and showContact is true', () => {
    render(<PatientIdentityBadge name="Ana" email="ana@email.com" />)
    expect(screen.getByText('ana@email.com')).toBeInTheDocument()
  })

  it.each(['(11) 99999-0000', '11999990000', '+55 (11) 99999-0000'])(
    'formats phone %s when showContact is true',
    (phone) => {
      render(<PatientIdentityBadge name="Ana" phone={phone} />)
      expect(screen.getByText('(11) 99999-0000')).toBeInTheDocument()
    },
  )

  it('renders both email and phone when both provided', () => {
    render(<PatientIdentityBadge name="Ana" email="ana@email.com" phone="(11) 99999-0000" />)
    expect(screen.getByText('ana@email.com')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-0000')).toBeInTheDocument()
  })

  it('hides email when email is null', () => {
    render(<PatientIdentityBadge name="Ana" email={null} phone="(11) 99999-0000" />)
    expect(screen.queryByText('@')).not.toBeInTheDocument()
    expect(screen.getByText('(11) 99999-0000')).toBeInTheDocument()
  })

  it('hides phone when phone is null', () => {
    render(<PatientIdentityBadge name="Ana" email="ana@email.com" phone={null} />)
    expect(screen.getByText('ana@email.com')).toBeInTheDocument()
  })

  it('renders no contact section when both email and phone are null', () => {
    const { container } = render(<PatientIdentityBadge name="Ana" email={null} phone={null} />)
    expect(container.querySelector('[aria-hidden="true"].h-3')).toBeNull()
  })

  it('hides contact section when showContact is false', () => {
    render(
      <PatientIdentityBadge
        name="Ana"
        email="ana@email.com"
        phone="(11) 99999-0000"
        showContact={false}
      />,
    )
    expect(screen.queryByText('ana@email.com')).not.toBeInTheDocument()
    expect(screen.queryByText('(11) 99999-0000')).not.toBeInTheDocument()
  })
})

// ── Avatar ────────────────────────────────────────────────────────────────────

describe('PatientIdentityBadge — avatar', () => {
  it('renders the avatar component with the patient name', () => {
    render(<PatientIdentityBadge name="Lucas Pereira" />)
    // PatientAvatar renders role=img with the name as accessible label
    expect(screen.getByRole('img', { name: 'Lucas Pereira' })).toBeInTheDocument()
  })

  it('falls back to initials when no avatarUrl', () => {
    render(<PatientIdentityBadge name="Lucas Pereira" avatarUrl={null} />)
    expect(screen.getByText('LP')).toBeInTheDocument()
  })
})
