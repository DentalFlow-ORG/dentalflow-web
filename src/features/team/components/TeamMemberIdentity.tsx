import { cn } from '@/lib/utils'

import { TeamMemberAvatar } from './TeamMemberAvatar'
import type { MemberListItem } from '../types/team.types'

type TeamMemberIdentitySize = 'sm' | 'md' | 'lg'

type TeamMemberIdentityProps = {
  member: MemberListItem
  size?: TeamMemberIdentitySize
  showPhone?: boolean
  className?: string
}

const TEXT_SIZE: Record<TeamMemberIdentitySize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

export function TeamMemberIdentity({
  member,
  size = 'md',
  showPhone = false,
  className,
}: TeamMemberIdentityProps) {
  const fullName = `${member.firstName} ${member.lastName}`

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <TeamMemberAvatar
        firstName={member.firstName}
        lastName={member.lastName}
        email={member.email}
        role={member.role}
        size={size}
      />
      <div className="min-w-0">
        <p className={cn('break-words font-semibold text-foreground', TEXT_SIZE[size])}>
          {fullName}
        </p>
        <p className="break-all text-xs text-muted-foreground">{member.email}</p>
        {showPhone && member.phone && (
          <p className="break-words text-xs text-muted-foreground">{member.phone}</p>
        )}
      </div>
    </div>
  )
}
