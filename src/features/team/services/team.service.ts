import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  CreateMemberDto,
  CreateMemberResponse,
  CreateServiceDto,
  MemberListItem,
  ProfileDetail,
  ServiceItem,
  Specialty,
  TeamMembersResponse,
  UpdateMemberDto,
  UpdateMemberPasswordDto,
  UpdateServiceDto,
} from '../types/team.types'

export function listSpecialties() {
  return apiRequest<Specialty[]>('/specialties', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

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

export function getClinicProfile(profileId: string) {
  return apiRequest<ProfileDetail>(`/profiles/${profileId}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createService(profileId: string, dto: CreateServiceDto) {
  return apiRequest<ServiceItem>(`/profiles/${profileId}/services`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateService(profileId: string, serviceId: string, dto: UpdateServiceDto) {
  return apiRequest<ServiceItem>(`/profiles/${profileId}/services/${serviceId}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteService(profileId: string, serviceId: string) {
  return apiRequest<void>(`/profiles/${profileId}/services/${serviceId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
