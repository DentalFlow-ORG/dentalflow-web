import type { UpdateClinicalRecordDto } from '../types/clinical-record.types'

// Mirrors the API limits in clinical-records/dto/update-clinical-record.dto.ts.
// The API is authoritative; these keep the editor from sending a draft that
// autosave would reject.
const CLINICAL_TEXT_MAX_LENGTH = 10_000
const CHIEF_COMPLAINT_MAX_LENGTH = 500

export const CLINICAL_FIELD_MAX_LENGTH: Partial<Record<keyof UpdateClinicalRecordDto, number>> = {
  chiefComplaint: CHIEF_COMPLAINT_MAX_LENGTH,
  anamnesis: CLINICAL_TEXT_MAX_LENGTH,
  clinicalEvolution: CLINICAL_TEXT_MAX_LENGTH,
  diagnosis: CLINICAL_TEXT_MAX_LENGTH,
  proceduresPerformed: CLINICAL_TEXT_MAX_LENGTH,
  treatmentPlan: CLINICAL_TEXT_MAX_LENGTH,
  prescription: CLINICAL_TEXT_MAX_LENGTH,
  recommendations: CLINICAL_TEXT_MAX_LENGTH,
  privateNotes: CLINICAL_TEXT_MAX_LENGTH,
}

// Mirrors clinical-attachment.dto.ts (description MaxLength(500)).
export const ATTACHMENT_CAPTION_MAX_LENGTH = 500

// Mirrors clinical-attachment.dto.ts: fileName MaxLength(180), no path
// separators or control characters.
export const ATTACHMENT_FILE_NAME_MAX_LENGTH = 180

// Mirrors MAX_BASE64_FIELD_LENGTH in clinical-attachment.dto.ts. Both the
// full image and the thumbnail base64 strings must fit within it.
export const ATTACHMENT_MAX_BASE64_LENGTH = 120_000

// Counters appear once a field reaches this share of its limit.
export const CHARACTER_COUNTER_THRESHOLD = 0.8
