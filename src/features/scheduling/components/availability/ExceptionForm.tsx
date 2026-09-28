import { Loader2, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput, TimeInput } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  formatDateBR,
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

import { TIME_RANGE_ORDER_MESSAGE } from '../../constants/availability-display'
import type { CreateAvailabilityExceptionDto } from '../../types/scheduling.types'

// Mirrors CreateAvailabilityExceptionDto.reason on the API.
const EXCEPTION_REASON_MAX_LENGTH = 200

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
  const [timeError, setTimeError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const fieldId = useId()
  const ids = {
    exceptionDate: `${fieldId}-exceptionDate`,
    startTime: `${fieldId}-startTime`,
    endTime: `${fieldId}-endTime`,
    reason: `${fieldId}-reason`,
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const exceptionDate = initial
      ? formatDateInputValue(initial.exceptionDate)
      : formatDateInputValue(String(data.get('exceptionDate') ?? ''))
    if (!exceptionDate) {
      setDateError('Informe a data da exceção.')
      return
    }
    setDateError(null)
    if (!isDayOff) {
      const start = formatTimeInputValue(String(data.get('startTime')))
      const end = formatTimeInputValue(String(data.get('endTime')))
      if (!start || !end) {
        setTimeError('Informe os horários de início e fim.')
        return
      }
      if (start >= end) {
        setTimeError(TIME_RANGE_ORDER_MESSAGE)
        return
      }
    }
    setTimeError(null)
    const dto: CreateAvailabilityExceptionDto = {
      exceptionDate,
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
      noValidate
      onSubmit={handleSubmit}
      className={className ?? 'rounded-lg border border-border bg-muted p-4 space-y-4'}
    >
      {initial ? (
        <div>
          <p className="mb-1 text-sm font-semibold text-foreground">Data</p>
          <p className="text-sm text-foreground">{formatDateBR(initial.exceptionDate)}</p>
        </div>
      ) : (
        <FormField label="Data" htmlFor={ids.exceptionDate} error={dateError}>
          <DatePickerInput
            id={ids.exceptionDate}
            name="exceptionDate"
            invalid={Boolean(dateError)}
            onValueChange={() => setDateError(null)}
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
          className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-muted p-0.5 dark:border-slate-700 dark:bg-slate-800/80"
        >
          <button
            type="button"
            onClick={() => setIsDayOff(true)}
            aria-pressed={isDayOff}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isDayOff
                ? 'bg-card text-foreground shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white',
            )}
          >
            Folga ocasional
          </button>
          <button
            type="button"
            onClick={() => setIsDayOff(false)}
            aria-pressed={!isDayOff}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              !isDayOff
                ? 'bg-card text-foreground shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white',
            )}
          >
            Horário especial
          </button>
        </div>
      </div>

      {!isDayOff && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Início" htmlFor={ids.startTime}>
            <TimeInput
              id={ids.startTime}
              name="startTime"
              required={!isDayOff}
              disabled={isLoading}
              defaultValue={formatTimeInputValue(initial?.startTime)}
              aria-invalid={timeError ? true : undefined}
              aria-describedby={timeError ? `${ids.endTime}-error` : undefined}
              onChange={() => setTimeError(null)}
            />
          </FormField>
          <FormField label="Fim" htmlFor={ids.endTime} error={timeError}>
            <TimeInput
              id={ids.endTime}
              name="endTime"
              required={!isDayOff}
              disabled={isLoading}
              defaultValue={formatTimeInputValue(initial?.endTime)}
              aria-invalid={timeError ? true : undefined}
              aria-describedby={timeError ? `${ids.endTime}-error` : undefined}
              onChange={() => setTimeError(null)}
            />
          </FormField>
        </div>
      )}

      <FormField label="Motivo" htmlFor={ids.reason} optional>
        <TextInput
          id={ids.reason}
          name="reason"
          maxLength={EXCEPTION_REASON_MAX_LENGTH}
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
