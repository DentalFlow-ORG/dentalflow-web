import type { ClinicalDictationFieldKey } from '../types/clinical-dictation.types'
import type { UpdateClinicalRecordDto } from '../types/clinical-record.types'
import { mergeDictationField } from './clinical-dictation-field-merge'

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Per-field apply mode chosen by the dentist in the review UI.
 * - append:  generated text is appended after existing content (safe default)
 * - replace: generated text replaces the existing content entirely
 * - edit:    dentist edited the generated text (possibly combined with existing);
 *            the textarea value is applied directly, same mechanics as replace
 */
export type FieldApplyMode = 'append' | 'replace' | 'edit'

/**
 * The subset of editor section IDs that dictation fields can target.
 * Maps to the SectionId union used by ClinicalRecordEditorContainer.
 */
export type DictationTargetSection = 'evolucao' | 'anamnese' | 'diagnostico' | 'plano'

export type ApplyDictationResult = {
  /**
   * The field updates to merge into the clinical record draft.
   * Only keys with non-empty dictation values are present.
   * Each value reflects the chosen FieldApplyMode (append or replace).
   */
  draftPatch: Partial<UpdateClinicalRecordDto>
  /**
   * The editor section to open so the dentist can immediately review the applied
   * content. Null when no relevant section mapping exists for the given fields
   * (e.g. chiefComplaint, privateNotes, or empty input).
   */
  targetSection: DictationTargetSection | null
}

// ── Section priority mapping ──────────────────────────────────────────────────
// Evaluated in order — the first matching field wins.

const SECTION_PRIORITY: ReadonlyArray<{
  keys: readonly ClinicalDictationFieldKey[]
  section: DictationTargetSection
}> = [
  { keys: ['clinicalEvolution'], section: 'evolucao' },
  { keys: ['anamnesis'], section: 'anamnese' },
  { keys: ['diagnosis'], section: 'diagnostico' },
  {
    keys: ['proceduresPerformed', 'treatmentPlan', 'prescription', 'recommendations'],
    section: 'plano',
  },
]

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Pure function. Computes the draft patch and target section that result from
 * applying dictation field suggestions into the clinical record editor.
 *
 * The container provides `currentValues` — the effective field states (draft
 * overrides applied on top of the server record) — so this function never
 * needs to read React state directly.
 *
 * @param dictationFields  Fields returned by the dictation service.
 * @param currentValues    Current field values keyed by field name (empty string if absent).
 * @param modes            Per-field apply mode. Defaults to 'append' for any unspecified field.
 */
export function applyDictationFields(
  dictationFields: Partial<Record<ClinicalDictationFieldKey, string>>,
  currentValues: Record<string, string>,
  modes?: Partial<Record<ClinicalDictationFieldKey, FieldApplyMode>>,
): ApplyDictationResult {
  const draftPatch: Partial<UpdateClinicalRecordDto> = {}

  for (const [key, value] of Object.entries(dictationFields)) {
    if (typeof value !== 'string' || !value.trim()) continue
    const current = currentValues[key] ?? ''
    const mode: FieldApplyMode = modes?.[key as ClinicalDictationFieldKey] ?? 'append'

    if (mode === 'replace' || mode === 'edit') {
      // replace: AI text overwrites existing entirely
      // edit:    dentist already combined/modified the text in the textarea;
      //          apply the textarea value directly without re-merging
      draftPatch[key as keyof UpdateClinicalRecordDto] = value.trim()
    } else {
      draftPatch[key as keyof UpdateClinicalRecordDto] = mergeDictationField(current, value)
    }
  }

  // Determine which section to open (first matching priority wins)
  let targetSection: DictationTargetSection | null = null
  for (const { keys, section } of SECTION_PRIORITY) {
    if (keys.some((k) => k in dictationFields && (dictationFields[k] ?? '').trim())) {
      targetSection = section
      break
    }
  }

  return { draftPatch, targetSection }
}
