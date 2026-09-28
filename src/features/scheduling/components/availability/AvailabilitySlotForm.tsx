import { Loader2 } from 'lucide-react'
import { useId, useState } from 'react'

import { FormField, TimeInput } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTimeInputValue } from '@/lib/date-time-formatters'

import { DAY_OPTIONS, TIME_RANGE_ORDER_MESSAGE } from '../../constants/availability-display'
import type { CreateAvailabilityDto } from '../../types/scheduling.types'

type AvailabilitySlotFormProps = {
  initial?: { dayOfWeek: number; startTime: string; endTime: string }
  isLoading: boolean
  onSubmit: (dto: CreateAvailabilityDto) => void
  onCancel: () => void
}

export function AvailabilitySlotForm({
  initial,
  isLoading,
  onSubmit,
  onCancel,
}: AvailabilitySlotFormProps) {
  const [dayOfWeek, setDayOfWeek] = useState(
    initial?.dayOfWeek === undefined ? '' : String(initial.dayOfWeek),
  )
  const [timeError, setTimeError] = useState<string | null>(null)
  // Unique ids: an add form and an edit form can be open at the same time.
  const fieldId = useId()
  const ids = {
    dayOfWeek: `${fieldId}-dayOfWeek`,
    startTime: `${fieldId}-startTime`,
    endTime: `${fieldId}-endTime`,
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const startTime = formatTimeInputValue(String(data.get('startTime')))
    const endTime = formatTimeInputValue(String(data.get('endTime')))
    if (!dayOfWeek || !startTime || !endTime) {
      setTimeError('Selecione o dia e informe os horários de início e fim.')
      return
    }
    if (startTime >= endTime) {
      setTimeError(TIME_RANGE_ORDER_MESSAGE)
      return
    }
    setTimeError(null)
    onSubmit({
      dayOfWeek: Number(data.get('dayOfWeek')),
      startTime,
      endTime,
      // New slots start active; editing keeps the slot's current active state.
      ...(initial ? {} : { isActive: true }),
    })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-muted p-4 space-y-4"
    >
      <FormField label="Dia da semana" htmlFor={ids.dayOfWeek}>
        <Select
          name="dayOfWeek"
          required
          value={dayOfWeek}
          onValueChange={setDayOfWeek}
          disabled={isLoading}
        >
          <SelectTrigger
            id={ids.dayOfWeek}
            aria-invalid={Boolean(timeError) && !dayOfWeek}
            aria-describedby={timeError ? `${ids.endTime}-error` : undefined}
          >
            <SelectValue placeholder="Selecione um dia" />
          </SelectTrigger>
          <SelectContent>
            {DAY_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={String(d.value)}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Início" htmlFor={ids.startTime}>
          <TimeInput
            id={ids.startTime}
            name="startTime"
            required
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
            required
            disabled={isLoading}
            defaultValue={formatTimeInputValue(initial?.endTime)}
            aria-invalid={timeError ? true : undefined}
            aria-describedby={timeError ? `${ids.endTime}-error` : undefined}
            onChange={() => setTimeError(null)}
          />
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
