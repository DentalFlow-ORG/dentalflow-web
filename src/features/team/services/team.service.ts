import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateMemberDto,
  CreateMemberResponse,
  MemberListItem,
  TeamMembersResponse,
  UpdateMemberDto,
  UpdateMemberPasswordDto,
} from '../types/team.types'

export function listClinicMembers() {
  return apiRequest<TeamMembersResponse>('/users/clinic/members', {
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

export function updateClinicMember(memberId: string, dto: UpdateMemberDto) {
  return apiRequest<MemberListItem>(`/users/clinic/members/${memberId}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateClinicMemberPassword(memberId: string, dto: UpdateMemberPasswordDto) {
  return apiRequest<void>(`/users/clinic/members/${memberId}/password`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteClinicMember(memberId: string) {
  return apiRequest<void>(`/users/clinic/members/${memberId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
