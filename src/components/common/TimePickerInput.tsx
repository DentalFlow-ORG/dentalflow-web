import { Clock3 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatTimeInputValue } from '@/lib/date-time-formatters'

type TimePickerInputProps = {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  minValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
}

const TIME_OPTIONS = buildTimeOptions()

export function TimePickerInput({
  id,
  name,
  value,
  defaultValue,
  minValue,
  placeholder = 'Selecionar horario',
  required = false,
  disabled = false,
  onValueChange,
}: TimePickerInputProps) {
  const normalizedValue = formatTimeInputValue(value)
  const normalizedDefaultValue = formatTimeInputValue(defaultValue)
  const normalizedMinValue = formatTimeInputValue(minValue)

  return (
    <Select
      name={name}
      required={required}
      disabled={disabled}
      value={normalizedValue}
      defaultValue={normalizedDefaultValue}
      onValueChange={(nextValue) => {
        if (isBeforeMinTime(nextValue, normalizedMinValue)) return
        onValueChange?.(nextValue)
      }}
    >
      <SelectTrigger id={id}>
        <span className="flex min-w-0 items-center gap-2">
          <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {TIME_OPTIONS.map((time) => (
          <SelectItem
            key={time}
            value={time}
            disabled={isBeforeMinTime(time, normalizedMinValue)}
          >
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function buildTimeOptions() {
  return Array.from({ length: 96 }, (_, index) => {
    const totalMinutes = index * 15
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const minutes = String(totalMinutes % 60).padStart(2, '0')

    return `${hours}:${minutes}`
  })
}

function isBeforeMinTime(value: string, minValue: string) {
  return Boolean(minValue && value && value < minValue)
}
