export type MemberRole = 'DENTIST' | 'ASSISTANT'

export type CreateMemberDto = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: MemberRole
  phone?: string
  // DENTIST-only profile fields
  displayName?: string
  slug?: string
  crmNumber?: string
  crmState?: string
  specialtyIds?: string[]
}

export type UpdateMemberDto = {
  firstName?: string
  lastName?: string
  email?: string
  role?: MemberRole
  /** `null` clears the stored phone; omitted keeps it. */
  phone?: string | null
  isActive?: boolean
}

export type UpdateMemberPasswordDto = {
  password: string
}

type MemberProfile = {
  id: string
  userId: string | null
  slug: string
  displayName: string
  isPublished: boolean
}

export type MemberListItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: MemberRole
  phone: string | null
  isActive: boolean
  createdAt: string
  profile: MemberProfile | null
}

export type CreateMemberResponse = {
  user: MemberListItem
  profile: MemberProfile | null
}

export type UserLimitUsage = {
  limit: number
  used: number
  remaining: number
  planSlug: string
  planName: string | null
}

export type TeamMembersResponse = {
  members: MemberListItem[]
  usage: UserLimitUsage
}
