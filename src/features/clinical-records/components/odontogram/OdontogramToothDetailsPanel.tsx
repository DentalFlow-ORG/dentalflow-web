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
      <div className="rounded-xl border border-dashed border-border bg-muted p-4">
        <p className="text-sm font-semibold text-foreground">Nenhum dente selecionado</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Selecione um dente no odontograma para registrar condição e observações.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dente selecionado
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Dente {toothNumber}</h3>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {getToothConditionLabel(tooth.condition)}
        </span>
      </div>

      {!readOnly && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Condição</p>
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
                    'border-border bg-card text-muted-foreground hover:bg-muted',
                    isActive && ODONTOGRAM_CONDITION_BUTTON_CLASSES[option.value],
                  )}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            As alterações são salvas automaticamente no prontuário.
          </p>
        </div>
      )}

      <label className="mt-4 block text-xs font-semibold text-muted-foreground">
        Observações do dente
      </label>
      <textarea
        rows={3}
        readOnly={readOnly}
        placeholder={readOnly ? undefined : 'Observações clínicas sobre este dente...'}
        value={tooth.notes ?? ''}
        onChange={(event) => onSetNotes(event.target.value)}
        className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    </div>
  )
}
