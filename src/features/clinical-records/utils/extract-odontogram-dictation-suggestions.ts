import { parseDictationOdontogram } from './parse-dictation-odontogram'

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * A single suggested odontogram marking extracted from a dictation transcript.
 * Deduplicated by tooth number — the first mention of each tooth wins.
 */
export type OdontogramDictationSuggestion = {
  /** FDI/ISO tooth number as a string, e.g. "36". */
  tooth: string
  /** Odontogram condition key matching OdontogramCondition values, e.g. "caries". */
  condition: string
  /** Human-readable label for display, e.g. "Dente 36 — Cárie". */
  label: string
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extracts suggested odontogram markings from a clinical dictation transcript.
 *
 * Detects simple tooth-condition patterns in Brazilian Portuguese such as:
 *   - "cárie no dente 36"           → { tooth: "36", condition: "caries", label: "Dente 36 — Cárie" }
 *   - "dente 36 com cárie"          → same
 *   - "cárie nos dentes 36 e 37"    → two suggestions
 *   - "extração indicada no dente 48"
 *   - "coroa no dente 11"
 *   - "restauração no dente 21"
 *   - "dente 46 ausente"
 *
 * Conservative by design — returns nothing when the transcript is too vague to
 * confidently pair a valid FDI tooth number with a recognizable condition.
 *
 * Mapped Portuguese terms:
 *   cárie / carie          → caries
 *   restaurado / restauração → restored
 *   ausente / ausência     → absent
 *   extração / exodontia   → extraction
 *   coroa                  → crown
 *   saudável / hígido      → healthy
 */
export function extractOdontogramDictationSuggestions(
  transcript: string,
): OdontogramDictationSuggestion[] {
  return parseDictationOdontogram(transcript).map((s) => ({
    tooth: s.toothNumber,
    condition: s.condition,
    label: `Dente ${s.toothNumber} — ${s.conditionLabel}`,
  }))
}
