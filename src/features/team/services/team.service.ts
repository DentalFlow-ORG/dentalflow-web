import { apiRequest } from '@/services/http'
import { getAccessToken } from '@/features/auth/utils/session-storage'

import type {
  CreateMemberDto,
  CreateMemberResponse,
  MemberListItem,
  Specialty,
} from '../types/team.types'

export function listSpecialties() {
  return apiRequest<Specialty[]>('/specialties', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listClinicMembers() {
  return apiRequest<MemberListItem[]>('/users/clinic/members', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createMember(dto: CreateMemberDto) {
  return apiRequest<CreateMemberResponse>('/users/clinic/members', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}
