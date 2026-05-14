import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { OdontogramTooth } from '../../types/clinical-record.types'
import {
  ODONTOGRAM_CONDITION_BUTTON_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
  getToothConditionLabel,
} from '../../utils/odontogram-status-utils'

type Props = {
  toothNumber: number | null
  tooth: OdontogramTooth | null
  readOnly?: boolean
  onSetCondition: (condition: string) => void
  onSetNotes: (notes: string) => void
}

export function OdontogramToothDetailsPanel({
  toothNumber,
  tooth,
  readOnly = false,
  onSetCondition,
  onSetNotes,
}: Props) {
  if (!toothNumber || !tooth) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Nenhum dente selecionado</p>
        <p className="mt-1 text-xs text-slate-500">
          Selecione um dente no odontograma para registrar condição e observações.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dente selecionado
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Dente {toothNumber}</h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
          {getToothConditionLabel(tooth.condition)}
        </span>
      </div>

      {!readOnly && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-slate-600">Condição</p>
          <div className="flex flex-wrap gap-2">
            {ODONTOGRAM_CONDITION_OPTIONS.map((option) => {
              const isActive = tooth.condition === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSetCondition(option.value)}
                  className={cn(
                    'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                    isActive && ODONTOGRAM_CONDITION_BUTTON_CLASSES[option.value],
                  )}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            As alterações são salvas automaticamente no prontuário.
          </p>
        </div>
      )}

      <label className="mt-4 block text-xs font-semibold text-slate-600">
        Observações do dente
      </label>
      <textarea
        rows={3}
        readOnly={readOnly}
        placeholder={readOnly ? undefined : 'Observações clínicas sobre este dente...'}
        value={tooth.notes ?? ''}
        onChange={(event) => onSetNotes(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    </div>
  )
}
