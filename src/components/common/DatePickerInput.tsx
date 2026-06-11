import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { addDays, formatDateBR, formatDateInputValue, isToday } from '@/lib/date-time-formatters'
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
    displayDraft.sourceValue === selectedValue ? displayDraft.displayValue : externalDisplayValue
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    if (selectedDate) return getMonthDate(selectedDate)
    // No pre-selected date — open to Brazil today's month, not UTC month.
    const todayStr = brazilTodayIso()
    const [y, m, d] = todayStr.split('-').map(Number)
    return getMonthDate(new Date(y, m - 1, d))
  })

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
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
  }

  function selectToday() {
    // Use Brazil calendar date so "Hoje" doesn't jump to the UTC next day
    // during the 00:00–03:00 UTC window when Brazil is still on the previous day.
    const todayStr = brazilTodayIso()
    const [y, m, d] = todayStr.split('-').map(Number)
    setVisibleMonth(getMonthDate(new Date(y, m - 1, d)))
    commit(todayStr)
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
        {name && <input type="hidden" name={name} value={selectedValue} />}
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
            'h-11 w-full rounded-md border border-input bg-background px-3 pr-11 text-sm font-medium text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground',
            'hover:border-primary/35 hover:bg-primary/5 focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
            !displayValue && 'text-muted-foreground',
            className,
          )}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Abrir calendário"
            title={label}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[20rem] max-w-[calc(100vw-2rem)]">
        <div className="border-b border-border p-3">
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
            <p className="text-sm font-semibold capitalize text-foreground">{monthLabel}</p>
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
                className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase text-muted-foreground"
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
                isBeforeMinDate(dayValue, minDateValue) || (disabledDate?.(dayValue) ?? false)

              return (
                <button
                  key={dayValue}
                  type="button"
                  onClick={() => commit(dayValue)}
                  disabled={isDisabled}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-md text-sm font-semibold outline-none transition',
                    'hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary focus:ring-2 focus:ring-primary/20',
                    isOutsideMonth && 'text-muted-foreground/40',
                    isDisabled &&
                      'cursor-not-allowed text-muted-foreground/40 opacity-40 hover:bg-transparent hover:text-muted-foreground/40',
                    isToday(day) && !isSelected && 'bg-muted text-foreground',
                    isSelected &&
                      'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary hover:text-white',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <Button type="button" variant="ghost" size="xs" onClick={selectToday}>
            Hoje
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
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
