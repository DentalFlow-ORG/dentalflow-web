import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { Button } from '@/components/ui/button'
import { FormField, TextInput, TimeInput } from '@/components/common/FormField'
import { cn } from '@/lib/utils'
import {
  formatDateBR,
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'

import type { CreateAvailabilityExceptionDto } from '../../types/scheduling.types'

type ExceptionFormProps = {
  initial?: {
    exceptionDate: string
    isDayOff: boolean
    startTime?: string | null
    endTime?: string | null
    reason?: string | null
  }
  isLoading: boolean
  onSubmit: (dto: CreateAvailabilityExceptionDto) => void
  onCancel: () => void
  saveLabel?: string
  onDelete?: () => void
  isDeleting?: boolean
  className?: string
}

export function ExceptionForm({
  initial,
  isLoading,
  onSubmit,
  onCancel,
  saveLabel,
  onDelete,
  isDeleting = false,
  className,
}: ExceptionFormProps) {
  const [isDayOff, setIsDayOff] = useState(initial?.isDayOff ?? true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const dto: CreateAvailabilityExceptionDto = {
      exceptionDate: initial
        ? formatDateInputValue(initial.exceptionDate)
        : formatDateInputValue(String(data.get('exceptionDate'))),
      isDayOff,
      reason: String(data.get('reason') ?? '').trim() || undefined,
    }
    if (!isDayOff) {
      dto.startTime = formatTimeInputValue(String(data.get('startTime')))
      dto.endTime = formatTimeInputValue(String(data.get('endTime')))
    }

    onSubmit(dto)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className ?? 'rounded-lg border border-border bg-muted p-4 space-y-4'}
    >
      {initial ? (
        <div>
          <p className="mb-1 text-sm font-semibold text-foreground">Data</p>
          <p className="text-sm text-foreground">{formatDateBR(initial.exceptionDate)}</p>
        </div>
      ) : (
        <FormField label="Data" htmlFor="exceptionDate">
          <DatePickerInput
            id="exceptionDate"
            name="exceptionDate"
            required
            disabled={isLoading}
          />
        </FormField>
      )}

      {/* Type toggle */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Tipo</p>
        <div
          role="group"
          aria-label="Tipo de exceção"
          className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1"
        >
          <button
            type="button"
            onClick={() => setIsDayOff(true)}
            aria-pressed={isDayOff}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors',
              isDayOff
                ? 'bg-primary/10 text-primary dark:bg-primary/15'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            Folga ocasional
          </button>
          <button
            type="button"
            onClick={() => setIsDayOff(false)}
            aria-pressed={!isDayOff}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors',
              !isDayOff
                ? 'bg-primary/10 text-primary dark:bg-primary/15'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            Horário especial
          </button>
        </div>
      </div>

      {!isDayOff && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Início" htmlFor="startTime">
            <TimeInput
              id="startTime"
              name="startTime"
              required={!isDayOff}
              disabled={isLoading}
              defaultValue={formatTimeInputValue(initial?.startTime)}
            />
          </FormField>
          <FormField label="Fim" htmlFor="endTime">
            <TimeInput
              id="endTime"
              name="endTime"
              required={!isDayOff}
              disabled={isLoading}
              defaultValue={formatTimeInputValue(initial?.endTime)}
            />
          </FormField>
        </div>
      )}

      <FormField label="Motivo" htmlFor="reason" optional>
        <TextInput
          id="reason"
          name="reason"
          maxLength={200}
          disabled={isLoading}
          defaultValue={initial?.reason ?? ''}
          placeholder={isDayOff ? 'Ex: Feriado, Férias...' : 'Ex: Atendimento emergencial...'}
        />
      </FormField>

      <div
        className={cn(
          'flex flex-col-reverse gap-2',
          onDelete
            ? 'sm:flex-row sm:items-center sm:justify-between'
            : 'sm:flex-row sm:justify-end',
        )}
      >
        {onDelete && (
          <Button
            type="button"
            variant="dangerGhost"
            size="sm"
            onClick={onDelete}
            disabled={isLoading || isDeleting}
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDeleting ? (
              'Excluindo...'
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Excluir exceção
              </>
            )}
          </Button>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading || isDeleting}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isLoading || isDeleting}>
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isLoading ? 'Salvando...' : (saveLabel ?? 'Salvar')}
          </Button>
        </div>
      </div>
    </form>
  )
}
