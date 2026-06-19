import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { ProfileListItem, ProfileService } from '../types/profile.types'

type ProfileDetail = ProfileListItem & {
  services: ProfileService[]
}

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
