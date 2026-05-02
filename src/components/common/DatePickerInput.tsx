import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  addDays,
  formatDateBR,
  formatDateInputValue,
  isToday,
} from '@/lib/date-time-formatters'
import {
  displayDateToIso,
  isoToDisplayDate,
  maskDateInput,
  parseIsoDateInput,
} from '@/lib/date-time-input'
import { cn } from '@/lib/utils'

type DatePickerInputProps = {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  minValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  disabledDate?: (dateValue: string) => boolean
  onValueChange?: (value: string) => void
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

export function DatePickerInput({
  id,
  name,
  value,
  defaultValue,
  minValue,
  placeholder = 'Selecionar data',
  required = false,
  disabled = false,
  className,
  disabledDate,
  onValueChange,
}: DatePickerInputProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const selectedValue = formatDateInputValue(isControlled ? value : internalValue)
  const minDateValue = formatDateInputValue(minValue)
  const selectedDate = parseIsoDateInput(selectedValue)
  const externalDisplayValue = selectedValue ? isoToDisplayDate(selectedValue) : ''
  const [displayDraft, setDisplayDraft] = useState(() => ({
    sourceValue: selectedValue,
    displayValue: externalDisplayValue,
  }))
  const displayValue =
    displayDraft.sourceValue === selectedValue
      ? displayDraft.displayValue
      : externalDisplayValue
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthDate(selectedDate ?? new Date()),
  )

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth])
  const label = selectedValue ? formatDateBR(selectedValue) : placeholder
  const monthLabel = visibleMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  function commit(nextValue: string, options: { close?: boolean } = { close: true }) {
    if (isBeforeMinDate(nextValue, minDateValue)) return
    if (disabledDate?.(nextValue)) return

    if (!isControlled) {
      setInternalValue(nextValue)
    }
    setDisplayDraft({
      sourceValue: nextValue,
      displayValue: isoToDisplayDate(nextValue),
    })
    onValueChange?.(nextValue)
    if (options.close !== false) {
      setOpen(false)
    }
  }

  function handleManualChange(nextValue: string) {
    const masked = maskDateInput(nextValue)
    setDisplayDraft({
      sourceValue: selectedValue,
      displayValue: masked,
    })

    if (!masked) {
      if (!isControlled) {
        setInternalValue('')
      }
      onValueChange?.('')
      return
    }

    const parsed = displayDateToIso(masked)
    if (parsed) {
      commit(parsed, { close: false })
    }
  }

  function goToPreviousMonth() {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
    )
  }

  function goToNextMonth() {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
    )
  }

  function selectToday() {
    const today = new Date()
    setVisibleMonth(getMonthDate(today))
    commit(formatDateInputValue(today))
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && selectedDate) {
      setVisibleMonth(getMonthDate(selectedDate))
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        {name && (
          <input type="hidden" name={name} value={selectedValue} />
        )}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          required={required}
          disabled={disabled}
          value={displayValue}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          onChange={(event) => handleManualChange(event.target.value)}
          aria-label={placeholder}
          className={cn(
            'h-11 w-full rounded-md border border-slate-200 bg-white px-3 pr-11 text-sm font-medium text-slate-950 shadow-sm outline-none transition',
            'hover:border-primary/35 hover:bg-blue-50/30 focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70',
            !displayValue && 'text-slate-400',
            className,
          )}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Abrir calendário"
            title={label}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[20rem]">
        <div className="border-b border-slate-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToPreviousMonth}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold capitalize text-slate-900">
              {monthLabel}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={goToNextMonth}
              aria-label="Proximo mes"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 pb-2">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dayValue = formatDateInputValue(day)
              const isSelected = dayValue === selectedValue
              const isOutsideMonth = day.getMonth() !== visibleMonth.getMonth()
              const isDisabled =
                isBeforeMinDate(dayValue, minDateValue) ||
                (disabledDate?.(dayValue) ?? false)

              return (
                <button
                  key={dayValue}
                  type="button"
                  onClick={() => commit(dayValue)}
                  disabled={isDisabled}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-md text-sm font-semibold outline-none transition',
                    'hover:bg-blue-50 hover:text-primary focus:bg-blue-50 focus:text-primary focus:ring-2 focus:ring-primary/20',
                    isOutsideMonth && 'text-slate-300',
                    isDisabled && 'cursor-not-allowed text-slate-300 opacity-40 hover:bg-transparent hover:text-slate-300',
                    isToday(day) && !isSelected && 'bg-slate-100 text-slate-950',
                    isSelected && 'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary hover:text-white',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <Button type="button" variant="ghost" size="xs" onClick={selectToday}>
            Hoje
          </Button>
          <span className="text-xs font-medium text-slate-400">
            {selectedValue ? isoToDisplayDate(selectedValue) : 'Sem data'}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function isBeforeMinDate(value: string, minValue: string) {
  return Boolean(minValue && value && value < minValue)
}

function getMonthDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function buildMonthDays(month: Date) {
  const firstDay = getMonthDate(month)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const gridStart = addDays(firstDay, -mondayOffset)

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}
