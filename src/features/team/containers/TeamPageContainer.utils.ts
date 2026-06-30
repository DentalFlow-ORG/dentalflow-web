import type { MemberListItem, UserLimitUsage } from '../types/team.types'

export type TeamKpis = {
  usageValue: string
  dentistCount: number
  assistantCount: number
  isAtLimit: boolean
}

export function computeTeamKpis(members: MemberListItem[], usage: UserLimitUsage): TeamKpis {
  return {
    usageValue: usage.limit > 0 ? `${usage.used}/${usage.limit}` : String(usage.used),
    dentistCount: members.filter((m) => m.role === 'DENTIST').length,
    assistantCount: members.filter((m) => m.role === 'ASSISTANT').length,
    isAtLimit: usage.remaining <= 0 && usage.limit > 0,
  }
}
