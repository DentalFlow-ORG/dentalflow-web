import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  ClinicalRecord,
  ClinicalRecordAttachment,
  CreateClinicalRecordDto,
  OdontogramData,
  OdontogramRecord,
  PatientClinicalTimeline,
  PrintData,
  UpdateClinicalRecordDto,
} from '../types/clinical-record.types'

const BASE = '/clinical-records'

export function listClinicalRecords(filters?: {
  status?: string
  dentistProfileId?: string
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.dentistProfileId) params.set('dentistProfileId', filters.dentistProfileId)
  const qs = params.toString()
  return apiRequest<ClinicalRecord[]>(qs ? `${BASE}?${qs}` : BASE, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getClinicalRecord(id: string) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function getClinicalRecordByAppointment(appointmentId: string) {
  return apiRequest<ClinicalRecord | null>(`${BASE}/by-appointment/${appointmentId}`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createClinicalRecord(dto: CreateClinicalRecordDto) {
  return apiRequest<ClinicalRecord>(BASE, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateClinicalRecord(id: string, dto: UpdateClinicalRecordDto) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function completeClinicalRecord(id: string) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}/complete`, {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function lockClinicalRecord(id: string) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}/lock`, {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function cancelClinicalRecord(id: string) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}/cancel`, {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function restoreClinicalRecord(id: string) {
  return apiRequest<ClinicalRecord>(`${BASE}/${id}/restore`, {
    method: 'POST',
    accessToken: getAccessToken(),
  })
}

export function getClinicalRecordPrintData(id: string) {
  return apiRequest<PrintData>(`${BASE}/${id}/print-data`, {
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

export function getPatientClinicalTimeline(identifier: string, patientId?: string | null) {
  return apiRequest<PatientClinicalTimeline>(
    `${BASE}/patient-timeline?${patientQuery(identifier, patientId)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

// Attachments

export function listAttachments(recordId: string) {
  return apiRequest<ClinicalRecordAttachment[]>(`${BASE}/${recordId}/attachments`, {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function addAttachmentMetadata(
  recordId: string,
  data: {
    fileName: string
    fileType?: string
    mimeType?: string
    sizeBytes?: number
    dataBase64?: string
    thumbnailBase64?: string
    description?: string
  },
) {
  return apiRequest<ClinicalRecordAttachment>(`${BASE}/${recordId}/attachments`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(data),
  })
}

export function updateAttachmentDescription(
  recordId: string,
  attachmentId: string,
  description: string,
) {
  return apiRequest<ClinicalRecordAttachment>(`${BASE}/${recordId}/attachments/${attachmentId}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify({ description }),
  })
}

export function removeAttachment(recordId: string, attachmentId: string) {
  return apiRequest<void>(`${BASE}/${recordId}/attachments/${attachmentId}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}

// Odontogram

export function getOdontogram(identifier: string, patientId?: string | null) {
  return apiRequest<OdontogramRecord | null>(
    `${BASE}/odontogram?${patientQuery(identifier, patientId)}`,
    { method: 'GET', accessToken: getAccessToken() },
  )
}

export function upsertOdontogram(
  identifier: string,
  patientName: string,
  data: OdontogramData,
  patientId?: string | null,
) {
  return apiRequest<OdontogramRecord>(`${BASE}/odontogram`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify({
      identifier,
      patientName,
      data,
      patientId: patientId ?? undefined,
    }),
  })
}
