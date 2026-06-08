import { render, screen } from '@/test-utils/render-utils'

import { TeamMemberIdentity } from '@/features/team/components/TeamMemberIdentity'
import type { MemberListItem } from '@/features/team/types/team.types'

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@clinica.com',
    role: 'DENTIST',
    phone: '(61) 99999-0000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: null,
    ...overrides,
  }
}

describe('TeamMemberIdentity', () => {
  it('renders name, email, phone, and avatar initials', () => {
    render(<TeamMemberIdentity member={makeMember()} showPhone />)

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana.silva@clinica.com')).toBeInTheDocument()
    expect(screen.getByText('(61) 99999-0000')).toBeInTheDocument()
    expect(screen.getByText('AS')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ana Silva' })).toBeInTheDocument()
  })

  it('does not render phone when showPhone is false', () => {
    render(<TeamMemberIdentity member={makeMember()} />)

    expect(screen.queryByText('(61) 99999-0000')).toBeNull()
  })
})
