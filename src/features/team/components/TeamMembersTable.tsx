import { StatusBadge } from '@/components/common/StatusBadge'

import { ProfilePublishBadge } from './ProfilePublishBadge'
import { TeamMemberActions } from './TeamMemberActions'
import { TeamMemberIdentity } from './TeamMemberIdentity'
import { TeamRoleBadge } from './TeamRoleBadge'
import type { MemberListItem } from '../types/team.types'

type TeamMembersTableProps = {
  members: MemberListItem[]
  onEdit: (member: MemberListItem) => void
  onPassword: (member: MemberListItem) => void
  onDelete: (member: MemberListItem) => void
}

export function TeamMembersTable({
  members,
  onEdit,
  onPassword,
  onDelete,
}: TeamMembersTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm" aria-label="Usuários da clínica">
          <thead>
            <tr className="border-b border-border bg-muted/70 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3">
                Membro
              </th>
              <th scope="col" className="px-4 py-3">
                Papel
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Perfil
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                role="button"
                tabIndex={0}
                aria-label={`Editar ${member.firstName} ${member.lastName}`}
                className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                onClick={() => onEdit(member)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onEdit(member)
                  }
                }}
              >
                <td className="max-w-[340px] px-4 py-4">
                  <TeamMemberIdentity member={member} showPhone />
                </td>
                <td className="px-4 py-4">
                  <TeamRoleBadge role={member.role} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                    {member.isActive ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex min-w-0 flex-col items-start gap-1.5">
                    {member.role === 'DENTIST' && (
                      <ProfilePublishBadge
                        hasProfile={!!member.profile}
                        isPublished={member.profile?.isPublished}
                      />
                    )}
                    {member.profile && (
                      <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {member.profile.displayName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                  <TeamMemberActions
                    member={member}
                    onEdit={() => onEdit(member)}
                    onPassword={() => onPassword(member)}
                    onDelete={() => onDelete(member)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
