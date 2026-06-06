import { StatusBadge } from '@/components/common/StatusBadge'

import { TeamMemberActions } from './TeamMemberActions'
import { TeamMemberIdentity } from './TeamMemberIdentity'
import { TeamRoleBadge } from './TeamRoleBadge'
import type { MemberListItem } from '../types/team.types'

type TeamMemberCardsProps = {
  members: MemberListItem[]
  onEdit: (member: MemberListItem) => void
  onPassword: (member: MemberListItem) => void
  onDelete: (member: MemberListItem) => void
}

export function TeamMemberCards({
  members,
  onEdit,
  onPassword,
  onDelete,
}: TeamMemberCardsProps) {
  return (
    <div className="space-y-3 md:hidden">
      {members.map((member) => (
        <article
          key={member.id}
          className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <TeamMemberIdentity member={member} size="md" showPhone className="flex-1 basis-56" />
              <TeamRoleBadge role={member.role} className="shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                {member.isActive ? 'Ativo' : 'Inativo'}
              </StatusBadge>
            </div>

            <TeamMemberActions
              member={member}
              layout="mobile"
              onEdit={() => onEdit(member)}
              onPassword={() => onPassword(member)}
              onDelete={() => onDelete(member)}
            />
          </div>
        </article>
      ))}
    </div>
  )
}
