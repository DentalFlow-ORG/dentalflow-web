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

/**
 * `patientId` is the identity the API keys on. `identifier` is sent alongside
 * it only so records that predate the identity migration still resolve; the
 * API ignores it whenever a patientId is present.
 */
function patientQuery(identifier: string, patientId?: string | null) {
  const query = `identifier=${encodeURIComponent(identifier)}`
  return patientId ? `${query}&patientId=${encodeURIComponent(patientId)}` : query
}

export function getPatientHistory(identifier: string, patientId?: string | null) {
  return apiRequest<PatientHistoryResponse>(
    `/patients/history?${patientQuery(identifier, patientId)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function getPatientAvatar(identifier: string, patientId?: string | null) {
  return apiRequest<{ avatarUrl: string | null }>(
    `/patients/avatar?${patientQuery(identifier, patientId)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function upsertPatientAvatar(
  identifier: string,
  avatarBase64: string | null,
  patientId?: string | null,
) {
  return apiRequest<void>('/patients/avatar', {
    method: 'PUT',
    accessToken: getAccessToken(),
    body: JSON.stringify({ identifier, avatarBase64, patientId: patientId ?? undefined }),
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
