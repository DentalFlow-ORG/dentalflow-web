import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormField, TimeInput } from '@/components/common/FormField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTimeInputValue } from '@/lib/date-time-formatters'

import type { CreateAvailabilityDto } from '../../types/scheduling.types'

const DAY_OPTIONS = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onSubmit({
      dayOfWeek: Number(data.get('dayOfWeek')),
      startTime: formatTimeInputValue(String(data.get('startTime'))),
      endTime: formatTimeInputValue(String(data.get('endTime'))),
      isActive: true,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-muted p-4 space-y-4"
    >
      <FormField label="Dia da semana" htmlFor="dayOfWeek">
        <Select
          name="dayOfWeek"
          required
          value={dayOfWeek}
          onValueChange={setDayOfWeek}
          disabled={isLoading}
        >
          <SelectTrigger id="dayOfWeek">
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
        <FormField label="Início" htmlFor="startTime">
          <TimeInput
            id="startTime"
            name="startTime"
            required
            disabled={isLoading}
            defaultValue={formatTimeInputValue(initial?.startTime)}
          />
        </FormField>
        <FormField label="Fim" htmlFor="endTime">
          <TimeInput
            id="endTime"
            name="endTime"
            required
            disabled={isLoading}
            defaultValue={formatTimeInputValue(initial?.endTime)}
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
