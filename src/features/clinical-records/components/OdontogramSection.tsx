import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { OdontogramChart } from './odontogram/OdontogramChart'
import { OdontogramLegend } from './odontogram/OdontogramLegend'
import { OdontogramToothDetailsPanel } from './odontogram/OdontogramToothDetailsPanel'
import type { OdontogramData, OdontogramTooth } from '../types/clinical-record.types'
import {
  ALL_TEETH,
  ODONTOGRAM_CONDITION_BUTTON_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Odontograma</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Clique em um dente para registrar condição e observações.
            {readOnly && ' Este prontuário está em modo somente leitura.'}
          </p>
        </div>

        {!readOnly && (
          <OdontogramToolbar
            multiMode={multiMode}
            selectedCount={multiSelected.size}
            onSelectAll={selectAll}
            onEnterMultiMode={enterMultiMode}
            onSelectEveryTooth={() => setMultiSelected(new Set(ALL_TEETH))}
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
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Observações gerais do odontograma
        </label>
        <textarea
          rows={3}
          value={data.notes ?? ''}
          onChange={(event) => onChange({ ...data, notes: event.target.value })}
          readOnly={readOnly}
          placeholder={readOnly ? undefined : 'Observações gerais do odontograma...'}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </div>
  )
}

type OdontogramToolbarProps = {
  multiMode: boolean
  selectedCount: number
  onSelectAll: () => void
  onEnterMultiMode: () => void
  onSelectEveryTooth: () => void
  onClearSelection: () => void
  onCancelMultiMode: () => void
}

function OdontogramToolbar({
  multiMode,
  selectedCount,
  onSelectAll,
  onEnterMultiMode,
  onSelectEveryTooth,
  onClearSelection,
  onCancelMultiMode,
}: OdontogramToolbarProps) {
  if (!multiMode) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="xs" onClick={onSelectAll}>
          Selecionar todos
        </Button>
        <Button type="button" variant="outline" size="xs" onClick={onEnterMultiMode}>
          Selecionar vários
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">
        {selectedCount === 0
          ? 'Clique nos dentes para selecionar'
          : `${selectedCount} dente${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''}`}
      </span>
      {selectedCount < ALL_TEETH.length && (
        <Button type="button" variant="outline" size="xs" onClick={onSelectEveryTooth}>
          Todos
        </Button>
      )}
      {selectedCount > 0 && (
        <Button type="button" variant="outline" size="xs" onClick={onClearSelection}>
          Limpar
        </Button>
      )}
      <Button type="button" variant="outline" size="xs" onClick={onCancelMultiMode}>
        Cancelar seleção
      </Button>
    </div>
  )
}

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
      <p className="mb-2 text-xs font-semibold text-slate-600">
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
              size="xs"
              onClick={() => onApplyCondition(option.value)}
              className={cn(
                'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                allHaveIt && ODONTOGRAM_CONDITION_BUTTON_CLASSES[option.value],
              )}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
