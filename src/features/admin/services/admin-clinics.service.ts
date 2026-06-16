import { getAccessToken } from '@/features/auth/utils/session-storage'
import { ApiError, apiRequest } from '@/services/http'

import type {
  AdminClinic,
  AdminClinicsResponse,
  CreateAdminClinicDto,
  UpdateAdminClinicDto,
} from '../types/admin.types'

export async function listAdminClinicsPage(page = 1, limit = 20) {
  const response = await apiRequest<AdminClinicsResponse | AdminClinic[]>('/admin/users/clinics', {
    method: 'GET',
    accessToken: getAccessToken(),
  })

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page,
      limit,
    }
  }

  return response
}

export function createAdminClinic(dto: CreateAdminClinicDto) {
  return withAdminClinicsCrudMessage(
    apiRequest<AdminClinic>('/admin/clinics', {
      method: 'POST',
      accessToken: getAccessToken(),
      body: JSON.stringify(dto),
    }),
  )
}

export function updateAdminClinic(clinicId: string, dto: UpdateAdminClinicDto) {
  return withAdminClinicsCrudMessage(
    apiRequest<AdminClinic>(`/admin/clinics/${clinicId}`, {
      method: 'PATCH',
      accessToken: getAccessToken(),
      body: JSON.stringify(dto),
    }),
  )
}

export function deleteAdminClinic(clinicId: string) {
  return withAdminClinicsCrudMessage(
    apiRequest<void>(`/admin/clinics/${clinicId}`, {
      method: 'DELETE',
      accessToken: getAccessToken(),
    }),
  )
}

async function withAdminClinicsCrudMessage<T>(request: Promise<T>) {
  try {
    return await request
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new Error('O backend ainda não disponibiliza esta ação para clínicas.')
    }

    throw err
  }
}
