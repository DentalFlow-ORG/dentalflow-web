import { useState } from 'react'

import { cn } from '@/lib/utils'

import type { OdontogramData, OdontogramTooth } from '../types/clinical-record.types'

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH]

const CONDITION_COLORS: Record<string, string> = {
  healthy: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  caries: 'bg-amber-100 border-amber-300 text-amber-800',
  restored: 'bg-blue-100 border-blue-300 text-blue-800',
  absent: 'bg-slate-100 border-slate-300 text-slate-400 line-through',
  extraction: 'bg-red-100 border-red-300 text-red-700',
  crown: 'bg-purple-100 border-purple-300 text-purple-800',
}

const CONDITION_OPTIONS = [
  { value: 'healthy', label: 'Saudável' },
  { value: 'caries', label: 'Cárie' },
  { value: 'restored', label: 'Restaurado' },
  { value: 'absent', label: 'Ausente' },
  { value: 'extraction', label: 'Extração' },
  { value: 'crown', label: 'Coroa' },
]

type Props = {
  data: OdontogramData
  onChange: (data: OdontogramData) => void
  readOnly?: boolean
}

export function OdontogramSection({ data, onChange, readOnly = false }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [multiMode, setMultiMode] = useState(false)
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set())

  const getTooth = (number: number): OdontogramTooth =>
    data.teeth?.[String(number)] ?? {}

  const setToothCondition = (number: number, condition: string) => {
    const current = getTooth(number)
    const newCondition = current.condition === condition ? undefined : condition
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [String(number)]: { ...current, condition: newCondition },
      },
    })
  }

  const setToothNotes = (number: number, notes: string) => {
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [String(number)]: { ...getTooth(number), notes },
      },
    })
  }

  const applyConditionToMulti = (condition: string) => {
    const allHaveIt = [...multiSelected].every(
      (n) => getTooth(n).condition === condition,
    )
    const newTeeth = { ...data.teeth }
    for (const n of multiSelected) {
      const current = getTooth(n)
      newTeeth[String(n)] = {
        ...current,
        condition: allHaveIt ? undefined : condition,
      }
    }
    onChange({ ...data, teeth: newTeeth })
  }

  const enterMultiMode = () => {
    setSelected(null)
    setMultiSelected(new Set())
    setMultiMode(true)
  }

  const selectAll = () => {
    setSelected(null)
    setMultiMode(true)
    setMultiSelected(new Set(ALL_TEETH))
  }

  const exitMultiMode = () => {
    setMultiMode(false)
    setMultiSelected(new Set())
  }

  const toggleMultiTooth = (n: number) => {
    setMultiSelected((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const handleToothClick = (n: number) => {
    if (multiMode) {
      toggleMultiTooth(n)
    } else {
      setSelected((prev) => (prev === n ? null : n))
    }
  }

  const selectedTooth = !multiMode && selected ? getTooth(selected) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Clique em um dente para registrar condição e observações.
          {readOnly && ' (somente leitura)'}
        </p>

        {!readOnly && !multiMode && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={enterMultiMode}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Selecionar vários
            </button>
          </div>
        )}

        {!readOnly && multiMode && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {multiSelected.size === 0
                ? 'Clique nos dentes para selecionar'
                : `${multiSelected.size} dente${multiSelected.size > 1 ? 's' : ''} selecionado${multiSelected.size > 1 ? 's' : ''}`}
            </span>
            {multiSelected.size < ALL_TEETH.length && (
              <button
                type="button"
                onClick={() => setMultiSelected(new Set(ALL_TEETH))}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Todos
              </button>
            )}
            {multiSelected.size > 0 && (
              <button
                type="button"
                onClick={() => setMultiSelected(new Set())}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={exitMultiMode}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar seleção
            </button>
          </div>
        )}
      </div>

      {/* Upper jaw */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Superior
        </p>
        <ToothRow
          teeth={UPPER_TEETH}
          getTooth={getTooth}
          selected={multiMode ? null : selected}
          multiSelected={multiMode ? multiSelected : null}
          onSelect={readOnly ? undefined : handleToothClick}
        />
      </div>

      {/* Lower jaw */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Inferior
        </p>
        <ToothRow
          teeth={LOWER_TEETH}
          getTooth={getTooth}
          selected={multiMode ? null : selected}
          multiSelected={multiMode ? multiSelected : null}
          onSelect={readOnly ? undefined : handleToothClick}
        />
      </div>

      {/* Multi-select condition picker */}
      {!readOnly && multiMode && multiSelected.size > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">
            Aplicar condição a {multiSelected.size} dente{multiSelected.size > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((opt) => {
              const allHaveIt = [...multiSelected].every(
                (n) => getTooth(n).condition === opt.value,
              )
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applyConditionToMulti(opt.value)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    allHaveIt
                      ? CONDITION_COLORS[opt.value]
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Single-select condition picker */}
      {!readOnly && !multiMode && selected && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">
            Dente {selected} — condição
          </p>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setToothCondition(selected, opt.value)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                  selectedTooth?.condition === opt.value
                    ? CONDITION_COLORS[opt.value]
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Observações sobre este dente..."
            value={selectedTooth?.notes ?? ''}
            onChange={(e) => setToothNotes(selected, e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/15"
          />
        </div>
      )}

      {/* Global notes */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Observações gerais do odontograma
        </label>
        <textarea
          rows={2}
          value={data.notes ?? ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          readOnly={readOnly}
          placeholder={readOnly ? undefined : 'Observações gerais...'}
          className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </div>
  )
}

type ToothRowProps = {
  teeth: number[]
  getTooth: (n: number) => OdontogramTooth
  selected: number | null
  multiSelected: Set<number> | null
  onSelect?: (n: number) => void
}

function ToothRow({ teeth, getTooth, selected, multiSelected, onSelect }: ToothRowProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {teeth.map((n) => {
        const tooth = getTooth(n)
        const color = tooth.condition
          ? CONDITION_COLORS[tooth.condition] ?? 'bg-white border-slate-300'
          : 'bg-white border-slate-300'
        const isMultiSelected = multiSelected?.has(n) ?? false
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect?.(n)}
            title={tooth.condition ? `${n}: ${tooth.condition}` : String(n)}
            className={cn(
              'h-9 w-9 rounded border text-[11px] font-semibold transition-all hover:scale-110',
              color,
              selected === n && 'ring-2 ring-primary ring-offset-1',
              isMultiSelected && 'ring-2 ring-primary ring-offset-1 brightness-95',
              !onSelect && 'cursor-default',
            )}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
