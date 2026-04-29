export type MemberRole = 'DENTIST' | 'ASSISTANT'

export type Specialty = {
  id: string
  name: string
  slug: string
}

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

export type MemberProfile = {
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
