import type { OdontogramData, OdontogramTooth } from '../types/clinical-record.types'

// ── Permanent dentition — FDI, visual order (patient right → left) ─────────────
export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH]

// ── Deciduous dentition — FDI, visual order (patient right → left) ────────────
// Deciduous teeth share the same OdontogramData.teeth key space as permanent
// (generic Record<string, OdontogramTooth>) — no schema changes required.
// The toggle mode is session-only; persistence would require a backend change.
export const UPPER_DECIDUOUS = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
export const LOWER_DECIDUOUS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
export const ALL_DECIDUOUS = [...UPPER_DECIDUOUS, ...LOWER_DECIDUOUS]

export type DentitionMode = 'permanent' | 'deciduous'

// ── Condition catalogue ───────────────────────────────────────────────────────
// Ordered: foundational states first, then treatments, then special markers.
// OdontogramToothDetailsPanel and OdontogramLegend both iterate this array
// dynamically — adding entries here automatically updates both components.

export const ODONTOGRAM_CONDITION_OPTIONS = [
  // Foundational states
  { value: 'healthy', label: 'Saudável' },
  { value: 'caries', label: 'Cárie' },
  { value: 'restored', label: 'Restaurado' },
  { value: 'absent', label: 'Ausente' },
  { value: 'extraction', label: 'Extração indicada' },
  { value: 'fracture', label: 'Fratura' },
  { value: 'mobility', label: 'Mobilidade' },
  // Dental treatments / restorations
  { value: 'crown', label: 'Coroa' },
  { value: 'endodontic', label: 'Canal' },
  { value: 'implant', label: 'Implante' },
  { value: 'prosthetic', label: 'Pôntico' },
  { value: 'sealant', label: 'Selante' },
  // Monitoring
  { value: 'watch', label: 'Monitorar' },
] as const

export type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar'

export const ODONTOGRAM_CONDITION_LABELS = ODONTOGRAM_CONDITION_OPTIONS.reduce<
  Record<string, string>
>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

// Legend classes include dark-mode variants — used by OdontogramLegend and
// the condition badge in OdontogramToothDetailsPanel.
export const ODONTOGRAM_CONDITION_LEGEND_CLASSES: Record<string, string> = {
  healthy:
    'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700/40 dark:text-emerald-300',
  caries:
    'bg-amber-50   border-amber-200   text-amber-800   dark:bg-amber-900/30   dark:border-amber-700/40   dark:text-amber-300',
  restored:
    'bg-blue-50    border-blue-200    text-blue-800    dark:bg-blue-900/30    dark:border-blue-700/40    dark:text-blue-300',
  absent:
    'bg-slate-100  border-slate-300   text-slate-500   dark:bg-slate-800/50   dark:border-slate-600/40   dark:text-slate-400',
  extraction:
    'bg-red-50     border-red-200     text-red-700     dark:bg-red-900/30     dark:border-red-700/40     dark:text-red-300',
  fracture:
    'bg-orange-50  border-orange-200  text-orange-800  dark:bg-orange-900/30  dark:border-orange-700/40  dark:text-orange-300',
  mobility:
    'bg-violet-50  border-violet-200  text-violet-800  dark:bg-violet-900/30  dark:border-violet-700/40  dark:text-violet-300',
  crown:
    'bg-purple-50  border-purple-200  text-purple-800  dark:bg-purple-900/30  dark:border-purple-700/40  dark:text-purple-300',
  endodontic:
    'bg-rose-50    border-rose-200    text-rose-800    dark:bg-rose-900/30    dark:border-rose-700/40    dark:text-rose-300',
  implant:
    'bg-teal-50    border-teal-200    text-teal-800    dark:bg-teal-900/30    dark:border-teal-700/40    dark:text-teal-300',
  prosthetic:
    'bg-sky-50     border-sky-200     text-sky-800     dark:bg-sky-900/30     dark:border-sky-700/40     dark:text-sky-300',
  sealant:
    'bg-lime-50    border-lime-200    text-lime-800    dark:bg-lime-900/30    dark:border-lime-700/40    dark:text-lime-300',
  watch:
    'bg-yellow-50  border-yellow-200  text-yellow-800  dark:bg-yellow-900/30  dark:border-yellow-700/40  dark:text-yellow-300',
}

export const ODONTOGRAM_CONDITION_BUTTON_CLASSES: Record<string, string> = {
  healthy: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  caries: 'bg-amber-50   border-amber-200   text-amber-800',
  restored: 'bg-blue-50    border-blue-200    text-blue-800',
  absent: 'bg-slate-100  border-slate-300   text-slate-500 line-through',
  extraction: 'bg-red-50     border-red-200     text-red-700',
  fracture: 'bg-orange-50  border-orange-200  text-orange-800',
  mobility: 'bg-violet-50  border-violet-200  text-violet-800',
  crown: 'bg-purple-50  border-purple-200  text-purple-800',
  endodontic: 'bg-rose-50    border-rose-200    text-rose-800',
  implant: 'bg-teal-50    border-teal-200    text-teal-800',
  prosthetic: 'bg-sky-50     border-sky-200     text-sky-800',
  sealant: 'bg-lime-50    border-lime-200    text-lime-800',
  watch: 'bg-yellow-50  border-yellow-200  text-yellow-800',
}

export const ODONTOGRAM_TOOTH_TOKENS: Record<
  string,
  { fill: string; stroke: string; text: string; dot: string }
> = {
  healthy: { fill: '#ecfdf5', stroke: '#34d399', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  caries: { fill: '#fffbeb', stroke: '#f59e0b', text: 'text-amber-800', dot: 'bg-amber-500' },
  restored: { fill: '#eff6ff', stroke: '#60a5fa', text: 'text-blue-800', dot: 'bg-blue-500' },
  absent: { fill: '#f8fafc', stroke: '#cbd5e1', text: 'text-slate-400', dot: 'bg-slate-400' },
  extraction: { fill: '#fef2f2', stroke: '#f87171', text: 'text-red-700', dot: 'bg-red-500' },
  fracture: { fill: '#fff7ed', stroke: '#fb923c', text: 'text-orange-800', dot: 'bg-orange-500' },
  mobility: { fill: '#f5f3ff', stroke: '#a78bfa', text: 'text-violet-800', dot: 'bg-violet-500' },
  crown: { fill: '#faf5ff', stroke: '#c084fc', text: 'text-purple-800', dot: 'bg-purple-500' },
  endodontic: { fill: '#fff1f2', stroke: '#fb7185', text: 'text-rose-800', dot: 'bg-rose-500' },
  implant: { fill: '#f0fdfa', stroke: '#2dd4bf', text: 'text-teal-800', dot: 'bg-teal-500' },
  prosthetic: { fill: '#f0f9ff', stroke: '#38bdf8', text: 'text-sky-800', dot: 'bg-sky-500' },
  sealant: { fill: '#f7fee7', stroke: '#a3e635', text: 'text-lime-800', dot: 'bg-lime-500' },
  watch: { fill: '#fefce8', stroke: '#facc15', text: 'text-yellow-800', dot: 'bg-yellow-500' },
}

const DEFAULT_TOOTH_TOKENS = {
  fill: '#ffffff',
  stroke: '#cbd5e1',
  text: 'text-slate-700',
  dot: 'bg-slate-300',
}

export function getToothConditionLabel(condition?: string) {
  if (!condition) return 'Normal'
  return ODONTOGRAM_CONDITION_LABELS[condition] ?? condition
}

export function getToothVisualTokens(tooth?: OdontogramTooth) {
  if (!tooth?.condition) return DEFAULT_TOOTH_TOKENS
  return ODONTOGRAM_TOOTH_TOKENS[tooth.condition] ?? DEFAULT_TOOTH_TOKENS
}

export function getToothKind(toothNumber: number): ToothKind {
  const position = toothNumber % 10
  // Deciduous range: 51-55, 61-65, 71-75, 81-85
  const isDeciduous = toothNumber >= 51 && toothNumber <= 85
  if (position <= 2) return 'incisor'
  if (position === 3) return 'canine'
  // Deciduous positions 4-5 are primary molars (no premolars in deciduous dentition)
  if (isDeciduous) return 'molar'
  if (position <= 5) return 'premolar'
  return 'molar'
}

// ── Snapshot utilities ────────────────────────────────────────────────────────

/**
 * Safely coerces an API response value (typed as `unknown`) into
 * `OdontogramData | null`. Returns null for any malformed, non-object, or
 * null/undefined input without throwing, so callers do not need to guard.
 */
export function normalizeOdontogramSnapshot(value: unknown): OdontogramData | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object' || Array.isArray(value)) return null

  const raw = value as Record<string, unknown>

  // Safe extraction of `teeth` — must be a plain object
  const rawTeeth =
    raw.teeth !== null &&
    raw.teeth !== undefined &&
    typeof raw.teeth === 'object' &&
    !Array.isArray(raw.teeth)
      ? (raw.teeth as Record<string, unknown>)
      : {}

  // Convert each tooth entry, silently skipping malformed ones
  const normalized: Record<string, OdontogramTooth> = {}
  for (const [key, toothValue] of Object.entries(rawTeeth)) {
    if (toothValue !== null && typeof toothValue === 'object' && !Array.isArray(toothValue)) {
      const t = toothValue as Record<string, unknown>
      normalized[key] = {
        condition: typeof t.condition === 'string' ? t.condition : undefined,
        notes: typeof t.notes === 'string' ? t.notes : undefined,
      }
    }
  }

  return {
    teeth: normalized,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
  }
}

export type SnapshotConditionSummary = {
  condition: string
  label: string
  count: number
  legendClass: string
}

/**
 * Returns a summary of non-healthy conditions present in a snapshot,
 * sorted by count descending. Accepts `unknown` so callers can pass
 * `record.odontogramSnapshot` directly without casting.
 *
 * Returns [] for null, undefined, malformed input, or snapshots that
 * contain only healthy teeth.
 */
export function getSnapshotSummary(snapshot: unknown): SnapshotConditionSummary[] {
  const data = normalizeOdontogramSnapshot(snapshot)
  if (!data) return []

  const counts: Record<string, number> = {}
  for (const tooth of Object.values(data.teeth)) {
    const cond = tooth.condition
    if (cond && cond !== 'healthy') {
      counts[cond] = (counts[cond] ?? 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([condition, count]) => ({
      condition,
      label: ODONTOGRAM_CONDITION_LABELS[condition] ?? condition,
      count,
      legendClass:
        ODONTOGRAM_CONDITION_LEGEND_CLASSES[condition] ??
        'border-border bg-card text-muted-foreground',
    }))
    .sort((a, b) => b.count - a.count)
}
