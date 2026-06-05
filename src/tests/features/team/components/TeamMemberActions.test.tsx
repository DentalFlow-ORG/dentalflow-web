import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { render, screen, userEvent } from '@/test-utils/render-utils'

import { TeamMemberActions } from '@/features/team/components/TeamMemberActions'
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
    profile: {
      id: 'profile-1',
      userId: 'member-1',
      slug: 'ana-silva',
      displayName: 'Dra. Ana Silva',
      isPublished: true,
    },
    ...overrides,
  }
}

describe('TeamMemberActions', () => {
  it('renders mobile actions and calls callbacks', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onPassword = vi.fn()
    const onDelete = vi.fn()

    render(
      <TeamMemberActions
        member={makeMember()}
        layout="mobile"
        onEdit={onEdit}
        onPassword={onPassword}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByRole('link', { name: /ver perfil/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /editar/i }))
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))
    await user.click(screen.getByRole('button', { name: /desativar/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onPassword).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('omits profile link when member has no profile', () => {
    render(
      <TeamMemberActions
        member={makeMember({ profile: null })}
        layout="mobile"
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByRole('link', { name: /ver perfil/i })).toBeNull()
  })

  it('does not expose publish or unpublish actions', () => {
    render(
      <TeamMemberActions
        member={makeMember()}
        layout="mobile"
        onEdit={vi.fn()}
        onPassword={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.queryByText(/publicar/i)).toBeNull()
    expect(screen.queryByText(/despublicar/i)).toBeNull()
  })
})
