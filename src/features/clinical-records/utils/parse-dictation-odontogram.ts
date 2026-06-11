import { ALL_DECIDUOUS, ALL_TEETH, ODONTOGRAM_CONDITION_LABELS } from './odontogram-status-utils'

// ── Valid tooth number set ────────────────────────────────────────────────────
// FDI: permanent 11-18, 21-28, 31-38, 41-48; deciduous 51-55, 61-65, 71-75, 81-85.
// Stored as strings so lookup from parsed text is direct (no Number conversion).
const VALID_TOOTH_NUMBERS = new Set([...ALL_TEETH, ...ALL_DECIDUOUS].map(String))

// ── Condition keyword map ─────────────────────────────────────────────────────
// Each entry lists one or more Brazilian Portuguese regex patterns that map to
// a single OdontogramCondition value. Order matters: more-specific entries
// (e.g. 'extraction') must appear before overlapping ones (e.g. 'absent').

const CONDITION_KEYWORDS: Array<{ patterns: RegExp[]; condition: string }> = [
  // Caries — covers both accented and unaccented spellings
  { patterns: [/carie/i, /cárie/i], condition: 'caries' },
  // Restored tooth
  { patterns: [/restaurad[ao]/i, /restaura[cç][aã]o/i], condition: 'restored' },
  // Indicated extraction (before absent to capture the specific intent)
  // "exodontia" is a common clinical synonym for tooth extraction in Portuguese.
  {
    patterns: [/extra[cç][aã]o/i, /extrair/i, /exodontia/i, /indica[cç][aã]o de extra[cç][aã]o/i],
    condition: 'extraction',
  },
  // Absent / already extracted — "ausência/ausencia" (noun) covers "Ausência do dente N" patterns.
  { patterns: [/ausente/i, /aus[eê]ncia/i, /perdid[ao]/i, /extra[ií]d[ao]/i], condition: 'absent' },
  // Crown restoration
  { patterns: [/\bcoroa\b/i], condition: 'crown' },
  // Endodontic treatment
  { patterns: [/endodontia/i, /tratamento de canal/i, /\bcanal\b/i], condition: 'endodontic' },
  // Fracture
  { patterns: [/fratura/i], condition: 'fracture' },
  // Mobility
  { patterns: [/mobilidade/i], condition: 'mobility' },
  // Implant
  { patterns: [/implante/i], condition: 'implant' },
  // Sealant
  { patterns: [/selante/i], condition: 'sealant' },
  // Watch / monitor
  { patterns: [/monitorar/i, /acompanhar/i, /observar/i], condition: 'watch' },
  // Healthy / no alteration — "hígido/higido" is the formal clinical synonym for healthy.
  {
    patterns: [/saud[aá]vel/i, /h[ií]gido/i, /sem alterac[aã]o/i, /sem alteração/i],
    condition: 'healthy',
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export type OdontogramSuggestion = {
  toothNumber: string
  condition: string
  conditionLabel: string
  note: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectCondition(segment: string): string | null {
  for (const { patterns, condition } of CONDITION_KEYWORDS) {
    if (patterns.some((p) => p.test(segment))) return condition
  }
  return null
}

function detectToothNumbers(segment: string): string[] {
  // Match all 2-digit numbers starting with 1-9 (covers FDI numbering),
  // validated against the known tooth set to reject unrelated numbers.
  const found: string[] = []
  const re = /\b([1-9]\d)\b/g
  let match = re.exec(segment)
  while (match !== null) {
    if (VALID_TOOTH_NUMBERS.has(match[1])) found.push(match[1])
    match = re.exec(segment)
  }
  return [...new Set(found)] // deduplicate within segment
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parses a clinical dictation transcript and extracts suggested odontogram
 * markings. The parser splits the transcript into sentence-like segments,
 * then for each segment checks whether it contains both:
 *  - a valid FDI tooth number (permanent or deciduous)
 *  - a recognizable clinical condition keyword (in Brazilian Portuguese)
 *
 * Conservative by design:
 * - Segments with a tooth number but no condition are ignored.
 * - Segments with a condition but no tooth number are ignored.
 * - Ambiguous segments (multiple conditions) use the first match in priority order.
 * - The same tooth number is only suggested once (first mention wins).
 *
 * Known limitation: a number coinciding with a valid tooth number (e.g. "36 anos")
 * in the same segment as a condition keyword may produce a false positive.
 * The dentist can deselect individual suggestions before applying.
 */
export function parseDictationOdontogram(transcript: string): OdontogramSuggestion[] {
  if (!transcript.trim()) return []

  // Split on sentence-ending or clause-separating punctuation.
  // Commas are intentionally excluded to keep multi-tooth enumerations
  // like "dentes 36, 11 e 46 com cárie" in a single segment.
  const segments = transcript
    .split(/[.!?;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const results: OdontogramSuggestion[] = []
  const seenTeeth = new Set<string>()

  for (const segment of segments) {
    const condition = detectCondition(segment)
    if (!condition) continue

    const teeth = detectToothNumbers(segment)
    for (const toothNumber of teeth) {
      if (seenTeeth.has(toothNumber)) continue // first mention wins
      seenTeeth.add(toothNumber)

      const conditionLabel = ODONTOGRAM_CONDITION_LABELS[condition] ?? condition
      results.push({
        toothNumber,
        condition,
        conditionLabel,
        note: `${conditionLabel} — identificado no ditado clínico.`,
      })
    }
  }

  return results
}
