import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { Button } from '@/components/ui/button'
import { FormField, TextInput, TimeInput } from '@/components/common/FormField'
import {
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'

import type { CreateAvailabilityExceptionDto } from '../../types/scheduling.types'

type ExceptionFormProps = {
  isLoading: boolean
  onSubmit: (dto: CreateAvailabilityExceptionDto) => void
  onCancel: () => void
}

export function ExceptionForm({ isLoading, onSubmit, onCancel }: ExceptionFormProps) {
  const [isDayOff, setIsDayOff] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const dto: CreateAvailabilityExceptionDto = {
      exceptionDate: formatDateInputValue(String(data.get('exceptionDate'))),
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
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4"
    >
      <FormField label="Data" htmlFor="exceptionDate">
        <DatePickerInput
          id="exceptionDate"
          name="exceptionDate"
          required
          disabled={isLoading}
        />
      </FormField>

      {/* Type toggle */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Tipo</p>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setIsDayOff(true)}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ${
              isDayOff
                ? 'bg-slate-950 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Folga
          </button>
          <button
            type="button"
            onClick={() => setIsDayOff(false)}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ${
              !isDayOff
                ? 'bg-slate-950 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Horário especial
          </button>
        </div>
      </div>

      {!isDayOff && (
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Início" htmlFor="startTime">
            <TimeInput
              id="startTime"
              name="startTime"
              required={!isDayOff}
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Fim" htmlFor="endTime">
            <TimeInput
              id="endTime"
              name="endTime"
              required={!isDayOff}
              disabled={isLoading}
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
          placeholder={isDayOff ? 'Ex: Feriado, Férias...' : 'Ex: Atendimento emergencial...'}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
