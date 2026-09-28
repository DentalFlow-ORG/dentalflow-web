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

// Optional contact/address fields accept `null` to clear the stored value.
export type UpdateClinicProfilePayload = {
  name?: string
  email?: string | null
  phone?: string | null
  websiteUrl?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
}
