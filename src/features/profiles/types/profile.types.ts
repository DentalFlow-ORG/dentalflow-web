export type ProfileListItem = {
  id: string
  clinicId: string
  userId: string | null
  slug: string
  displayName: string
  avatarUrl: string | null
  isPublished: boolean
  viewsCount: number
  city: string | null
  state: string | null
  createdAt: string
  updatedAt: string
}

export type ProfileSpecialty = {
  specialty: {
    id: string
    name: string
    slug: string
  }
}

export type ProfileService = {
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
  createdAt: string
  updatedAt: string
}

export type ProfileDetail = ProfileListItem & {
  bio: string | null
  crmNumber: string | null
  crmState: string | null
  phone: string | null
  whatsappNumber: string | null
  publicEmail: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  websiteUrl: string | null
  addressLine1: string | null
  country: string
  postalCode: string | null
  services: ProfileService[]
  profileSpecialties: ProfileSpecialty[]
}

export type ProfilePayload = {
  displayName: string
  slug: string
  bio?: string
  crmNumber?: string
  crmState?: string
  phone?: string
  whatsappNumber?: string
  publicEmail?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  addressLine1?: string
  city?: string
  state?: string
  postalCode?: string
}

export type ServicePayload = {
  name: string
  description?: string
  priceFrom?: number
  priceTo?: number
  durationMinutes?: number
  isPriceDisplayed?: boolean
  isActive?: boolean
  displayOrder?: number
}

export type PublishResponse = {
  id: string
  slug: string
  isPublished: boolean
}
