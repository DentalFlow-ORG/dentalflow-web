import { Clock3 } from 'lucide-react'

import { formatTimeInputValue } from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

type TimePickerInputProps = {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  minValue?: string
  maxValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onValueChange?: (value: string) => void
}

const TIME_OPTIONS = buildTimeOptions()

export function TimePickerInput({
  id,
  name,
  value,
  defaultValue,
  minValue,
  maxValue,
  placeholder = 'Selecionar horário',
  required = false,
  disabled = false,
  className,
  onValueChange,
}: TimePickerInputProps) {
  const normalizedValue = formatTimeInputValue(value)
  const normalizedDefaultValue = formatTimeInputValue(defaultValue)
  const normalizedMinValue = formatTimeInputValue(minValue)
  const normalizedMaxValue = formatTimeInputValue(maxValue)
  const listId = id ? `${id}-options` : undefined

  function handleChange(nextValue: string) {
    if (!nextValue) {
      onValueChange?.('')
      return
    }
    if (!isValidTime(nextValue)) return
    if (isBeforeMinTime(nextValue, normalizedMinValue)) return
    if (isAfterMaxTime(nextValue, normalizedMaxValue)) return

    onValueChange?.(nextValue)
  }

  return (
    <div className="relative">
      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name={name}
        type="time"
        step={900}
        list={listId}
        required={required}
        disabled={disabled}
        value={normalizedValue}
        defaultValue={normalizedValue ? undefined : normalizedDefaultValue}
        min={normalizedMinValue || undefined}
        max={normalizedMaxValue || undefined}
        placeholder={placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className={cn(
          'h-11 w-full rounded-md border border-slate-200 bg-white px-3 pl-9 text-sm font-medium text-slate-950 shadow-sm outline-none transition [color-scheme:light]',
          'hover:border-primary/35 hover:bg-blue-50/30 focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70',
          className,
        )}
      />
      {listId && (
        <datalist id={listId}>
          {TIME_OPTIONS.map((time) => (
            <option key={time} value={time} />
          ))}
        </datalist>
      )}
    </div>
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

function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false

  return Number(match[1]) <= 23 && Number(match[2]) <= 59
}

function isBeforeMinTime(value: string, minValue: string) {
  return Boolean(minValue && value && value < minValue)
}

function isAfterMaxTime(value: string, maxValue: string) {
  return Boolean(maxValue && value && value > maxValue)
}
