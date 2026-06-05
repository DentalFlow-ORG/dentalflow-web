import { StatusBadge } from '@/components/common/StatusBadge'

import { ProfilePublishBadge } from './ProfilePublishBadge'
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
          className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <TeamMemberIdentity member={member} size="md" showPhone className="flex-1" />
              <TeamRoleBadge role={member.role} className="shrink-0" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                {member.isActive ? 'Ativo' : 'Inativo'}
              </StatusBadge>
              <ProfilePublishBadge
                hasProfile={!!member.profile}
                isPublished={member.profile?.isPublished}
              />
            </div>

            {member.profile && (
              <p className="truncate text-xs text-muted-foreground">
                {member.profile.displayName}
              </p>
            )}

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
