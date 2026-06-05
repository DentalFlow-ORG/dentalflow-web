import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { render, screen, userEvent } from '@/test-utils/render-utils'

import { TeamMemberCards } from '@/features/team/components/TeamMemberCards'
import type { MemberListItem } from '@/features/team/types/team.types'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: {
    to: string
    params?: unknown
    children: ReactNode
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    void params

    return (
      <a href={to} {...props}>
        {children}
      </a>
    )
  },
}))

function makeMember(overrides: Partial<MemberListItem> = {}): MemberListItem {
  return {
    id: 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@clinica.com',
    role: 'DENTIST',
    phone: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: null,
    ...overrides,
  }
}

const MEMBERS: MemberListItem[] = [
  makeMember({
    id: 'member-1',
    firstName: 'Ana',
    lastName: 'Silva',
    role: 'DENTIST',
    profile: {
      id: 'profile-1',
      userId: 'member-1',
      slug: 'ana-silva',
      displayName: 'Dra. Ana Silva',
      isPublished: true,
    },
  }),
  makeMember({
    id: 'member-2',
    firstName: 'Bruno',
    lastName: 'Lima',
    email: 'bruno.lima@clinica.com',
    role: 'ASSISTANT',
    isActive: false,
  }),
]

describe('TeamMemberCards', () => {
  it('renders mobile cards with member identity and badges', () => {
    render(
      <TeamMemberCards
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('Assistente')).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
    expect(screen.getByText('Sem perfil')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('shows profile links only for members with a profile', () => {
    render(
      <TeamMemberCards
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('link', { name: /ver perfil/i })).toHaveLength(1)
  })

  it('renders edit, password, and deactivate actions', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onPassword = vi.fn()
    const onDelete = vi.fn()

    render(
      <TeamMemberCards
        members={[MEMBERS[0]]}
        onEdit={onEdit}
        onPassword={onPassword}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: /editar/i }))
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))
    await user.click(screen.getByRole('button', { name: /desativar/i }))

    expect(onEdit).toHaveBeenCalledWith(MEMBERS[0])
    expect(onPassword).toHaveBeenCalledWith(MEMBERS[0])
    expect(onDelete).toHaveBeenCalledWith(MEMBERS[0])
  })

  it('does not expose publish or unpublish actions', () => {
    render(
      <TeamMemberCards
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByText(/publicar/i)).toBeNull()
    expect(screen.queryByText(/despublicar/i)).toBeNull()
  })
})
