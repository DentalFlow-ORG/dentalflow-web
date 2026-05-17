export type ClinicProfile = {
  id: string
  name: string
  email: string | null
  phone: string | null
  logoUrl: string | null
  websiteUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  country: string
  postalCode: string | null
  timezone: string
  createdAt: string
}

export type UpdateClinicProfilePayload = {
  name?: string
  email?: string
  phone?: string
  websiteUrl?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
}
