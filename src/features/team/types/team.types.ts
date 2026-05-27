export type MemberRole = 'DENTIST' | 'ASSISTANT'

export type ServiceItem = {
  id: string
  profileId: string
  clinicId: string
  name: string
  description: string | null
  priceFrom: number | null
  priceTo: number | null
  durationMinutes: number | null
  isPriceDisplayed: boolean
  isActive: boolean
  displayOrder: number
  estimatedDirectCostCents: number | null
  createdAt: string
  updatedAt: string
}

export type CreateServiceDto = {
  name: string
  description?: string
  priceFrom?: number
  priceTo?: number
  durationMinutes?: number
  isActive?: boolean
  estimatedDirectCostCents?: number
}

export type UpdateServiceDto = {
  name?: string
  description?: string
  priceFrom?: number
  priceTo?: number
  durationMinutes?: number
  isActive?: boolean
  estimatedDirectCostCents?: number
}

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

export type UpdateMemberDto = {
  firstName?: string
  lastName?: string
  email?: string
  role?: MemberRole
  phone?: string
  isActive?: boolean
}

export type UpdateMemberPasswordDto = {
  password: string
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

export type ProfileSpecialtyItem = {
  specialty: {
    id: string
    name: string
    slug: string
  }
}

export type ProfileDetail = {
  id: string
  userId: string | null
  slug: string
  displayName: string
  bio: string | null
  crmNumber: string | null
  crmState: string | null
  phone: string | null
  isPublished: boolean
  profileSpecialties: ProfileSpecialtyItem[]
  services: ServiceItem[]
}
