import { onlyDigits } from '@/lib/field-formatters'
import { parseOptionalNumber } from '@/lib/number-formatters'

import type {
  ProfileDetail,
  ProfilePayload,
  ProfileService,
  ServicePayload,
} from '../types'

export type ProfileFormValues = {
  displayName: string
  slug: string
  bio: string
  crmNumber: string
  crmState: string
  phone: string
  whatsappNumber: string
  publicEmail: string
  instagramUrl: string
  facebookUrl: string
  websiteUrl: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
}

export type ServiceFormValues = {
  name: string
  description: string
  priceFrom: string
  priceTo: string
  durationMinutes: string
  isPriceDisplayed: boolean
  isActive: boolean
  displayOrder: string
}

export const emptyProfileForm: ProfileFormValues = {
  displayName: '',
  slug: '',
  bio: '',
  crmNumber: '',
  crmState: '',
  phone: '',
  whatsappNumber: '',
  publicEmail: '',
  instagramUrl: '',
  facebookUrl: '',
  websiteUrl: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
}

export const emptyServiceForm: ServiceFormValues = {
  name: '',
  description: '',
  priceFrom: '',
  priceTo: '',
  durationMinutes: '',
  isPriceDisplayed: true,
  isActive: true,
  displayOrder: '0',
}

export function profileToFormValues(profile: ProfileDetail): ProfileFormValues {
  return {
    displayName: profile.displayName,
    slug: profile.slug,
    bio: profile.bio ?? '',
    crmNumber: profile.crmNumber ?? '',
    crmState: profile.crmState ?? '',
    phone: profile.phone ?? '',
    whatsappNumber: profile.whatsappNumber ?? '',
    publicEmail: profile.publicEmail ?? '',
    instagramUrl: profile.instagramUrl ?? '',
    facebookUrl: profile.facebookUrl ?? '',
    websiteUrl: profile.websiteUrl ?? '',
    addressLine1: profile.addressLine1 ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    postalCode: profile.postalCode ?? '',
  }
}

export function profileFormToPayload(values: ProfileFormValues): ProfilePayload {
  return compactPayload({
    ...values,
    crmState: values.crmState.toUpperCase(),
    phone: onlyDigits(values.phone),
    whatsappNumber: onlyDigits(values.whatsappNumber),
  })
}

export function serviceFormToPayload(values: ServiceFormValues): ServicePayload {
  const payload: ServicePayload = {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    isPriceDisplayed: values.isPriceDisplayed,
    isActive: values.isActive,
  }

  const priceFrom = parseOptionalNumber(values.priceFrom)
  const priceTo = parseOptionalNumber(values.priceTo)
  const durationMinutes = parseOptionalNumber(values.durationMinutes)
  const displayOrder = parseOptionalNumber(values.displayOrder)

  if (priceFrom !== undefined) payload.priceFrom = priceFrom
  if (priceTo !== undefined) payload.priceTo = priceTo
  if (durationMinutes !== undefined) payload.durationMinutes = durationMinutes
  if (displayOrder !== undefined) payload.displayOrder = displayOrder

  return payload
}

export function serviceToFormValues(service: ProfileService): ServiceFormValues {
  return {
    name: service.name,
    description: service.description ?? '',
    priceFrom: service.priceFrom?.toString() ?? '',
    priceTo: service.priceTo?.toString() ?? '',
    durationMinutes: service.durationMinutes?.toString() ?? '',
    isPriceDisplayed: service.isPriceDisplayed,
    isActive: service.isActive,
    displayOrder: service.displayOrder.toString(),
  }
}

export function toPublicProfileUrl(slug: string) {
  return `/p/${slug}`
}

function compactPayload(values: ProfileFormValues): ProfilePayload {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value.trim() || undefined,
    ]),
  ) as ProfilePayload
}
