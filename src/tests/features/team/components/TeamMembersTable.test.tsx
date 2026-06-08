import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { fireEvent, render, screen, userEvent, within } from '@/test-utils/render-utils'

import { TeamMembersTable } from '@/features/team/components/TeamMembersTable'
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

describe('TeamMembersTable', () => {
  it('renders members with role and status badges', () => {
    render(
      <TeamMembersTable
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('table', { name: /usuários da clínica/i })).toBeInTheDocument()
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('Assistente')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
    expect(screen.queryByText('Publicado')).toBeNull()
    expect(screen.queryByText('Não publicado')).toBeNull()
    expect(screen.queryByText('Sem perfil')).toBeNull()
  })

  it('does not show publication status in any row', () => {
    render(
      <TeamMembersTable
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByText('Publicado')).toBeNull()
    expect(screen.queryByText('Não publicado')).toBeNull()
    expect(screen.queryByText('Sem perfil')).toBeNull()
  })

  it('calls edit callback when a row is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <TeamMembersTable
        members={[MEMBERS[0]]}
        onEdit={onEdit}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /editar ana silva/i }))

    expect(onEdit).toHaveBeenCalledWith(MEMBERS[0])
  })

  it('calls edit callback from Enter and Space on the row', () => {
    const onEdit = vi.fn()

    render(
      <TeamMembersTable
        members={[MEMBERS[0]]}
        onEdit={onEdit}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const row = screen.getByRole('button', { name: /editar ana silva/i })
    fireEvent.keyDown(row, { key: 'Enter' })
    fireEvent.keyDown(row, { key: ' ' })

    expect(onEdit).toHaveBeenCalledTimes(2)
  })

  it('does not trigger row edit twice when the action edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <TeamMembersTable
        members={[MEMBERS[0]]}
        onEdit={onEdit}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const row = screen.getByRole('button', { name: /editar ana silva/i })
    await user.click(within(row).getByRole('button', { name: /^editar$/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('does not expose publish or unpublish actions', () => {
    render(
      <TeamMembersTable
        members={MEMBERS}
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: /publicar/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /despublicar/i })).toBeNull()
  })
})
