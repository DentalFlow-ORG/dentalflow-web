import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type { PatientHistoryResponse, PatientsListResponse } from '../types/patients.types'

export function listPatients(search?: string) {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  return apiRequest<PatientsListResponse>(`/patients${query}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getPatientHistory(identifier: string) {
  return apiRequest<PatientHistoryResponse>(
    `/patients/history?identifier=${encodeURIComponent(identifier)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function getPatientAvatar(identifier: string) {
  return apiRequest<{ avatarUrl: string | null }>(
    `/patients/avatar?identifier=${encodeURIComponent(identifier)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function upsertPatientAvatar(identifier: string, avatarBase64: string | null) {
  return apiRequest<void>('/patients/avatar', {
    method: 'PUT',
    accessToken: getAccessToken(),
    body: JSON.stringify({ identifier, avatarBase64 }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function batchGetPatientAvatars(identifiers: string[]) {
  return apiRequest<{ avatars: Record<string, string | null> }>('/patients/avatars/batch', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({ identifiers }),
    headers: { 'Content-Type': 'application/json' },
  })
}
