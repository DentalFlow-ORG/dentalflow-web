import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  DictateClinicalRecordRequest,
  DictateClinicalRecordResponse,
} from '../types/clinical-dictation.types'

const BASE = '/clinical-records'

/**
 * Sends base64-encoded audio to the backend for Whisper transcription and GPT
 * field classification. Returns a transcript and suggested clinical field values
 * for dentist review. The record is NOT automatically updated.
 *
 * Requires: Premium plan (enforced by backend PlanFeatureGuard).
 * Requires: The record must be in DRAFT status.
 */
export function dictateClinicalRecord(
  recordId: string,
  payload: DictateClinicalRecordRequest,
): Promise<DictateClinicalRecordResponse> {
  return apiRequest<DictateClinicalRecordResponse>(`${BASE}/${recordId}/dictate`, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(payload),
  })
}
