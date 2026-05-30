// ── Field keys ────────────────────────────────────────────────────────────────
// Exact keys accepted by POST /clinical-records/:id/dictate.
// Must remain in sync with the ClinicalRecord database columns that the
// backend is allowed to classify into.

export type ClinicalDictationFieldKey =
  | 'chiefComplaint'
  | 'anamnesis'
  | 'clinicalEvolution'
  | 'diagnosis'
  | 'proceduresPerformed'
  | 'treatmentPlan'
  | 'prescription'
  | 'recommendations'
  | 'privateNotes'

// ── Request ───────────────────────────────────────────────────────────────────

export type DictateClinicalRecordRequest = {
  /** Base64-encoded audio recorded by the dentist. */
  audioBase64: string
  /** MIME type of the audio, e.g. 'audio/webm' or 'audio/mp4'. */
  mimeType: string
  /** Optional recording duration in seconds (1–120). */
  durationSeconds?: number
}

// ── Response ──────────────────────────────────────────────────────────────────

export type DictateClinicalRecordResponse = {
  /** Raw Portuguese transcript returned by Whisper. Shown for dentist review. */
  transcript: string
  /**
   * Whitelisted clinical fields extracted by GPT.
   * Only fields with content will be present — empty fields are omitted.
   * The dentist reviews and applies these; the record is not auto-updated.
   */
  fields: Partial<Record<ClinicalDictationFieldKey, string>>
}
