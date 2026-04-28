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
  onValueChange,
}: DatePickerInputProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const selectedValue = formatDateInputValue(isControlled ? value : internalValue)
  const minDateValue = formatDateInputValue(minValue)
  const selectedDate = parseInputDate(selectedValue)
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

  function commit(nextValue: string) {
    if (isBeforeMinDate(nextValue, minDateValue)) return

    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
    setOpen(false)
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
      {name && (
        <input
          name={name}
          value={selectedValue}
          required={required}
          readOnly
          tabIndex={-1}
          className="sr-only"
        />
      )}
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-950 shadow-sm outline-none transition',
            'hover:border-primary/35 hover:bg-blue-50/30 focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70',
            !selectedValue && 'text-slate-400',
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{label}</span>
          </span>
        </button>
      </PopoverTrigger>
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
              const isDisabled = isBeforeMinDate(dayValue, minDateValue)

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
            {selectedValue || 'Sem data'}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function isBeforeMinDate(value: string, minValue: string) {
  return Boolean(minValue && value && value < minValue)
}

function parseInputDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
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
