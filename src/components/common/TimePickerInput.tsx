import { Clock3 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  buildTimeOptions,
  isAfterMaxTime,
  isBeforeMinTime,
  isValidTime,
  maskTimeInput,
} from '@/lib/date-time-input'
import { formatTimeInputValue } from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

type TimePickerInputProps = {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  minValue?: string
  maxValue?: string
  selectableMax?: string
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
  selectableMax,
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
  const normalizedSelectableMax = formatTimeInputValue(selectableMax) || normalizedMaxValue
  const externalDisplayValue = normalizedValue || normalizedDefaultValue
  const [open, setOpen] = useState(false)
  const [displayDraft, setDisplayDraft] = useState(() => ({
    sourceValue: normalizedValue,
    displayValue: externalDisplayValue,
  }))
  const displayValue =
    displayDraft.sourceValue === normalizedValue
      ? displayDraft.displayValue
      : externalDisplayValue

  // Show all times within the visibility window; selectability is checked separately
  const visibleTimeOptions = TIME_OPTIONS.filter(
    (time) =>
      !isBeforeMinTime(time, normalizedMinValue) &&
      !isAfterMaxTime(time, normalizedMaxValue),
  )

  function isTimeSelectable(time: string) {
    return !isAfterMaxTime(time, normalizedSelectableMax)
  }

  function handleChange(nextValue: string) {
    const masked = maskTimeInput(nextValue)
    setDisplayDraft({
      sourceValue: normalizedValue,
      displayValue: masked,
    })

    if (!masked) {
      onValueChange?.('')
      return
    }
    if (!isValidTime(masked)) return
    if (isBeforeMinTime(masked, normalizedMinValue)) return
    if (isAfterMaxTime(masked, normalizedSelectableMax)) return

    onValueChange?.(masked)
  }

  function selectTime(time: string) {
    if (!isTimeSelectable(time)) return
    setDisplayDraft({
      sourceValue: time,
      displayValue: time,
    })
    onValueChange?.(time)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          required={required}
          disabled={disabled}
          value={displayValue}
          maxLength={5}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
          className={cn(
            'h-11 w-full rounded-md border border-slate-200 bg-white px-3 pl-9 pr-11 text-sm font-medium text-slate-950 shadow-sm outline-none transition',
            'hover:border-primary/35 hover:bg-blue-50/30 focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70',
            className,
          )}
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400 hover:bg-slate-100 hover:text-primary"
            aria-label="Selecionar horário"
            title={displayValue || placeholder}
          >
            <Clock3 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-[16rem] p-2">
        <div className="grid max-h-64 grid-cols-4 gap-1 overflow-y-auto pr-1">
          {visibleTimeOptions.map((time) => {
            const selected = time === normalizedValue
            const selectable = isTimeSelectable(time)

            return (
              <button
                key={time}
                type="button"
                disabled={!selectable}
                onClick={() => selectTime(time)}
                className={cn(
                  'h-9 rounded-md text-sm font-semibold outline-none transition',
                  selectable
                    ? 'text-slate-600 hover:bg-blue-50 hover:text-primary focus:bg-blue-50 focus:text-primary focus:ring-2 focus:ring-primary/20'
                    : 'cursor-not-allowed text-slate-300 opacity-50',
                  selected &&
                    'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary hover:text-white',
                )}
              >
                {time}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
