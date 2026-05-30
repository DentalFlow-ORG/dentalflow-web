import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { OdontogramChart } from './odontogram/OdontogramChart'
import { OdontogramLegend } from './odontogram/OdontogramLegend'
import { OdontogramToothDetailsPanel } from './odontogram/OdontogramToothDetailsPanel'
import type { OdontogramData, OdontogramTooth } from '../types/clinical-record.types'
import {
  ALL_DECIDUOUS,
  ALL_TEETH,
  ODONTOGRAM_CONDITION_BUTTON_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
  type DentitionMode,
} from '../utils/odontogram-status-utils'

type Props = {
  data: OdontogramData
  onChange: (data: OdontogramData) => void
  readOnly?: boolean
}

export function OdontogramSection({ data, onChange, readOnly = false }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [multiMode, setMultiMode] = useState(false)
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set())
  // Session-only — the active dentition mode is not persisted to the backend.
  // Deciduous tooth conditions ARE persisted (stored under keys 51–85 in the
  // shared OdontogramData.teeth map). Only the view selection is session-only.
  const [dentitionMode, setDentitionMode] = useState<DentitionMode>('permanent')

  // The full set of selectable teeth depends on the active dentition mode
  const currentAllTeeth = dentitionMode === 'deciduous' ? ALL_DECIDUOUS : ALL_TEETH

  const getTooth = (number: number): OdontogramTooth =>
    data.teeth?.[String(number)] ?? {}

  const setToothCondition = (number: number, condition: string) => {
    if (readOnly) return
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
    if (readOnly) return
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [String(number)]: { ...getTooth(number), notes },
      },
    })
  }

  const applyConditionToMulti = (condition: string) => {
    if (readOnly) return
    const allHaveIt = [...multiSelected].every(
      (toothNumber) => getTooth(toothNumber).condition === condition,
    )
    const newTeeth = { ...data.teeth }
    for (const toothNumber of multiSelected) {
      const current = getTooth(toothNumber)
      newTeeth[String(toothNumber)] = {
        ...current,
        condition: allHaveIt ? undefined : condition,
      }
    }
    onChange({ ...data, teeth: newTeeth })
  }

  const handleSetDentitionMode = (mode: DentitionMode) => {
    // Clear selection state when switching dentition mode to prevent
    // stale tooth numbers from one dentition being active in the other
    setDentitionMode(mode)
    setSelected(null)
    setMultiMode(false)
    setMultiSelected(new Set())
  }

  const enterMultiMode = () => {
    setSelected(null)
    setMultiSelected(new Set())
    setMultiMode(true)
  }

  const selectAll = () => {
    setSelected(null)
    setMultiMode(true)
    setMultiSelected(new Set(currentAllTeeth))
  }

  const exitMultiMode = () => {
    setMultiMode(false)
    setMultiSelected(new Set())
  }

  const toggleMultiTooth = (toothNumber: number) => {
    setMultiSelected((prev) => {
      const next = new Set(prev)
      if (next.has(toothNumber)) next.delete(toothNumber)
      else next.add(toothNumber)
      return next
    })
  }

  const handleToothClick = (toothNumber: number) => {
    if (multiMode) {
      toggleMultiTooth(toothNumber)
      return
    }
    setSelected((prev) => (prev === toothNumber ? null : toothNumber))
  }

  const selectedTooth = !multiMode && selected ? getTooth(selected) : null

  return (
    <div className="space-y-4">
      {/* ── Header: title + dentition toggle + toolbar ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Odontograma</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {readOnly
                ? 'Este prontuário está finalizado e o odontograma está disponível apenas para consulta.'
                : 'Clique em um dente para registrar condição e observações clínicas.'}
            </p>
          </div>

          {/* Dentition toggle — session-only view selection */}
          <DentitionToggle mode={dentitionMode} onChange={handleSetDentitionMode} />
        </div>

        {!readOnly && (
          <OdontogramToolbar
            multiMode={multiMode}
            selectedCount={multiSelected.size}
            totalTeethCount={currentAllTeeth.length}
            onSelectAll={selectAll}
            onEnterMultiMode={enterMultiMode}
            onSelectEveryTooth={() => setMultiSelected(new Set(currentAllTeeth))}
            onClearSelection={() => setMultiSelected(new Set())}
            onCancelMultiMode={exitMultiMode}
          />
        )}
      </div>

      <OdontogramChart
        getTooth={getTooth}
        selected={multiMode ? null : selected}
        multiSelected={multiMode ? multiSelected : null}
        readOnly={readOnly}
        dentitionMode={dentitionMode}
        onSelect={readOnly ? undefined : handleToothClick}
      />

      <OdontogramLegend />

      {!readOnly && multiMode && multiSelected.size > 0 && (
        <MultiConditionPanel
          selectedCount={multiSelected.size}
          selectedTeeth={multiSelected}
          getTooth={getTooth}
          onApplyCondition={applyConditionToMulti}
        />
      )}

      {!multiMode && (
        <OdontogramToothDetailsPanel
          toothNumber={selected}
          tooth={selectedTooth}
          readOnly={readOnly}
          onSetCondition={(condition) => {
            if (selected) setToothCondition(selected, condition)
          }}
          onSetNotes={(notes) => {
            if (selected) setToothNotes(selected, notes)
          }}
        />
      )}

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Observações gerais do odontograma
        </label>
        <textarea
          rows={3}
          value={data.notes ?? ''}
          onChange={(event) => onChange({ ...data, notes: event.target.value })}
          readOnly={readOnly}
          placeholder={readOnly ? undefined : 'Observações gerais sobre o odontograma...'}
          className={cn(
            'mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
            readOnly && 'cursor-default bg-muted text-muted-foreground',
          )}
        />
      </div>
    </div>
  )
}

// ── DentitionToggle ────────────────────────────────────────────────────────────

function DentitionToggle({
  mode,
  onChange,
}: {
  mode: DentitionMode
  onChange: (mode: DentitionMode) => void
}) {
  return (
    <div className="flex w-fit rounded-lg border border-border bg-muted p-0.5">
      <button
        type="button"
        onClick={() => onChange('permanent')}
        className={cn(
          'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'permanent'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Permanente
      </button>
      <button
        type="button"
        onClick={() => onChange('deciduous')}
        className={cn(
          'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'deciduous'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Decídua
      </button>
    </div>
  )
}

// ── OdontogramToolbar ─────────────────────────────────────────────────────────

type OdontogramToolbarProps = {
  multiMode: boolean
  selectedCount: number
  totalTeethCount: number
  onSelectAll: () => void
  onEnterMultiMode: () => void
  onSelectEveryTooth: () => void
  onClearSelection: () => void
  onCancelMultiMode: () => void
}

function OdontogramToolbar({
  multiMode,
  selectedCount,
  totalTeethCount,
  onSelectAll,
  onEnterMultiMode,
  onSelectEveryTooth,
  onClearSelection,
  onCancelMultiMode,
}: OdontogramToolbarProps) {
  if (!multiMode) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onSelectAll}
        >
          Selecionar todos
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onEnterMultiMode}
        >
          Selecionar vários
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {selectedCount === 0
          ? 'Clique nos dentes para selecionar'
          : `${selectedCount} dente${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''}`}
      </span>
      {selectedCount < totalTeethCount && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onSelectEveryTooth}
        >
          Todos
        </Button>
      )}
      {selectedCount > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onClearSelection}
        >
          Limpar
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={onCancelMultiMode}
      >
        Cancelar seleção
      </Button>
    </div>
  )
}

// ── MultiConditionPanel ───────────────────────────────────────────────────────

type MultiConditionPanelProps = {
  selectedCount: number
  selectedTeeth: Set<number>
  getTooth: (toothNumber: number) => OdontogramTooth
  onApplyCondition: (condition: string) => void
}

function MultiConditionPanel({
  selectedCount,
  selectedTeeth,
  getTooth,
  onApplyCondition,
}: MultiConditionPanelProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        Aplicar condição a {selectedCount} dente{selectedCount > 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {ODONTOGRAM_CONDITION_OPTIONS.map((option) => {
          const allHaveIt = [...selectedTeeth].every((toothNumber) => {
            const tooth = getTooth(toothNumber)
            return tooth.condition === option.value
          })

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'w-full border-border bg-card text-muted-foreground hover:bg-muted sm:w-auto',
                allHaveIt && ODONTOGRAM_CONDITION_BUTTON_CLASSES[option.value],
              )}
              onClick={() => onApplyCondition(option.value)}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
