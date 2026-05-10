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
