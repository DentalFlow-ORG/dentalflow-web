import type { OdontogramTooth } from '../types/clinical-record.types'

export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH]

export const ODONTOGRAM_CONDITION_OPTIONS = [
  { value: 'healthy', label: 'Saudável' },
  { value: 'caries', label: 'Cárie' },
  { value: 'restored', label: 'Restaurado' },
  { value: 'absent', label: 'Ausente' },
  { value: 'extraction', label: 'Extração indicada' },
  { value: 'crown', label: 'Coroa' },
] as const

export type OdontogramCondition = (typeof ODONTOGRAM_CONDITION_OPTIONS)[number]['value']
export type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar'

export const ODONTOGRAM_CONDITION_LABELS = ODONTOGRAM_CONDITION_OPTIONS.reduce<
  Record<string, string>
>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

export const ODONTOGRAM_CONDITION_BUTTON_CLASSES: Record<string, string> = {
  healthy: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  caries: 'bg-amber-50 border-amber-200 text-amber-800',
  restored: 'bg-blue-50 border-blue-200 text-blue-800',
  absent: 'bg-slate-100 border-slate-300 text-slate-500 line-through',
  extraction: 'bg-red-50 border-red-200 text-red-700',
  crown: 'bg-purple-50 border-purple-200 text-purple-800',
}

export const ODONTOGRAM_TOOTH_TOKENS: Record<
  string,
  { fill: string; stroke: string; text: string; dot: string }
> = {
  healthy: {
    fill: '#ecfdf5',
    stroke: '#34d399',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  caries: {
    fill: '#fffbeb',
    stroke: '#f59e0b',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  restored: {
    fill: '#eff6ff',
    stroke: '#60a5fa',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  absent: {
    fill: '#f8fafc',
    stroke: '#cbd5e1',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  },
  extraction: {
    fill: '#fef2f2',
    stroke: '#f87171',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  crown: {
    fill: '#faf5ff',
    stroke: '#c084fc',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
  },
}

export const DEFAULT_TOOTH_TOKENS = {
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
  if (position <= 2) return 'incisor'
  if (position === 3) return 'canine'
  if (position <= 5) return 'premolar'
  return 'molar'
}
