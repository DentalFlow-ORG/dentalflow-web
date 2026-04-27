import { apiRequest } from '@/services/http'

import { getAccessToken } from '@/features/auth/utils/session-storage'

import type {
  ProfileDetail,
  ProfileListItem,
  ProfilePayload,
  ProfileService,
  PublishResponse,
  ServicePayload,
} from '../types'

export function listProfiles() {
  return apiRequest<ProfileListItem[]>('/profiles', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getProfile(id: string) {
  return apiRequest<ProfileDetail>(`/profiles/${id}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getPublicProfile(slug: string) {
  return apiRequest<ProfileDetail>(`/profiles/p/${slug}`, {
    method: 'GET',
  })
}

export function createProfile(payload: ProfilePayload) {
  return apiRequest<ProfileDetail>('/profiles', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function updateProfile(id: string, payload: ProfilePayload) {
  return apiRequest<ProfileDetail>(`/profiles/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function toggleProfilePublish(id: string) {
  return apiRequest<PublishResponse>(`/profiles/${id}/publish`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
  })
}

export function deleteProfile(id: string) {
  return apiRequest<void>(`/profiles/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

export function createProfileService(profileId: string, payload: ServicePayload) {
  return apiRequest<ProfileService>(`/profiles/${profileId}/services`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}

export function updateProfileService(
  profileId: string,
  serviceId: string,
  payload: ServicePayload,
) {
  return apiRequest<ProfileService>(
    `/profiles/${profileId}/services/${serviceId}`,
    {
      method: 'PATCH',
      accessToken: getAccessToken(),
      body: JSON.stringify(payload),
    },
  )
}

export function deleteProfileService(profileId: string, serviceId: string) {
  return apiRequest<void>(`/profiles/${profileId}/services/${serviceId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
