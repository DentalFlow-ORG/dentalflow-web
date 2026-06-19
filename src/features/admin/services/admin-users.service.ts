import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  AdminClinic,
  AdminUser,
  AdminUsersResponse,
  CreateAdminUserDto,
  UpdateAdminPasswordDto,
  UpdateAdminUserDto,
} from '../types/admin.types'

export function listAdminClinics() {
  return apiRequest<AdminClinic[]>('/admin/users/clinics', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function listAdminUsers(page = 1, limit = 20) {
  return apiRequest<AdminUsersResponse>(`/admin/users?page=${page}&limit=${limit}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createAdminUser(dto: CreateAdminUserDto) {
  return apiRequest<AdminUser>('/admin/users', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAdminUser(userId: string, dto: UpdateAdminUserDto) {
  return apiRequest<AdminUser>(`/admin/users/${userId}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateAdminUserPassword(userId: string, dto: UpdateAdminPasswordDto) {
  return apiRequest<void>(`/admin/users/${userId}/password`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deleteAdminUser(userId: string) {
  return apiRequest<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
