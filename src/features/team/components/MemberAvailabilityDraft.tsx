import { Clock, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

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
import type { CreateAvailabilityDto } from '@/features/scheduling/types/scheduling.types'
import { DAY_OPTIONS } from '@/features/scheduling/constants/availability-display'

type MemberAvailabilityDraftProps = {
  value: CreateAvailabilityDto[]
  onChange: (value: CreateAvailabilityDto[]) => void
  disabled?: boolean
}

export function MemberAvailabilityDraft({
  value,
  onChange,
  disabled = false,
}: MemberAvailabilityDraftProps) {
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  function addSlot() {
    if (!dayOfWeek || !startTime || !endTime) return

    onChange([
      ...value,
      {
        dayOfWeek: Number(dayOfWeek),
        startTime: formatTimeInputValue(startTime),
        endTime: formatTimeInputValue(endTime),
        isActive: true,
      },
    ])
    setDayOfWeek('')
    setStartTime('')
    setEndTime('')
  }

  function removeSlot(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Horarios de atendimento
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a disponibilidade inicial do profissional. Voce tambem pode
          ajustar esses horarios depois.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted p-4">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          <FormField label="Dia da semana" htmlFor="availabilityDay">
            <Select value={dayOfWeek} onValueChange={setDayOfWeek} disabled={disabled}>
              <SelectTrigger id="availabilityDay">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((day) => (
                  <SelectItem key={day.value} value={String(day.value)}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Inicio" htmlFor="availabilityStartTime">
            <TimeInput
              id="availabilityStartTime"
              value={startTime}
              disabled={disabled}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </FormField>

          <FormField label="Fim" htmlFor="availabilityEndTime">
            <TimeInput
              id="availabilityEndTime"
              value={endTime}
              disabled={disabled}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </FormField>

          <Button
            type="button"
            className="w-full lg:w-auto"
            disabled={disabled || !dayOfWeek || !startTime || !endTime}
            onClick={addSlot}
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-8 text-center">
          <Clock className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum horario inicial cadastrado.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {value.map((slot, index) => (
              <div
                key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${index}`}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {DAY_OPTIONS.find((day) => day.value === slot.dayOfWeek)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeInputValue(slot.startTime)} as{' '}
                    {formatTimeInputValue(slot.endTime)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="self-start text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300 sm:self-auto"
                  disabled={disabled}
                  title="Remover horario"
                  onClick={() => removeSlot(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
