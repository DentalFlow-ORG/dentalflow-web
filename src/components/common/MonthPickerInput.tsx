import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { brazilCurrentIsoMonth } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ── Helpers ───────────────────────────────────────────────────────────────────

// 'YYYY-MM' → 'MM/AAAA'  (display format)
function isoMonthToDisplay(value: string): string {
  if (!/^\d{4}-\d{2}$/.test(value)) return ''
  const [year, month] = value.split('-')
  return `${month}/${year}`
}

// 'MM/AAAA' → 'YYYY-MM'  (ISO format used by the API)
function displayToIsoMonth(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, month, year] = match
  const m = parseInt(month, 10)
  if (m < 1 || m > 12) return null
  return `${year}-${month}`
}

// Auto-inserts the slash after two month digits, strips non-digit characters.
export function maskMonthInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

// 'YYYY-MM' → "Junho de 2026" (long label, UTC-safe)
function formatMonthLongLabel(isoMonth: string): string {
  if (!/^\d{4}-\d{2}$/.test(isoMonth)) return ''
  const [year, mon] = isoMonth.split('-').map(Number)
  const d = new Date(Date.UTC(year, mon - 1, 1))
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function currentIsoMonth(): string {
  return brazilCurrentIsoMonth()
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  id?: string
  /** Controlled value in YYYY-MM format. */
  value?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  onValueChange?: (value: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MonthPickerInput({
  id,
  value = '',
  placeholder = 'MM/AAAA',
  disabled = false,
  className,
  onValueChange,
}: Props) {
  const [open, setOpen] = useState(false)

  // Year shown in the popover grid
  const [visibleYear, setVisibleYear] = useState<number>(() => {
    if (/^\d{4}-\d{2}$/.test(value)) return parseInt(value.split('-')[0], 10)
    // Fall back to the Brazil year so the popover opens to the correct year
    // when the browser/server is in a different timezone.
    return parseInt(brazilCurrentIsoMonth().split('-')[0], 10)
  })

  // Draft display value — tracks manual typing independently of the controlled value
  const [displayDraft, setDisplayDraft] = useState(() => ({
    sourceValue: value,
    displayValue: isoMonthToDisplay(value),
  }))

  // If the parent changes value externally, show the new formatted value
  const displayValue =
    displayDraft.sourceValue === value ? displayDraft.displayValue : isoMonthToDisplay(value)

  const selectedYear = /^\d{4}-\d{2}$/.test(value) ? parseInt(value.split('-')[0], 10) : null
  const selectedMonth = /^\d{4}-\d{2}$/.test(value) ? parseInt(value.split('-')[1], 10) : null

  function commit(nextValue: string) {
    setDisplayDraft({ sourceValue: nextValue, displayValue: isoMonthToDisplay(nextValue) })
    const [y] = nextValue.split('-').map(Number)
    setVisibleYear(y)
    setOpen(false)
    onValueChange?.(nextValue)
  }

  function handleManualChange(raw: string) {
    const masked = maskMonthInput(raw)
    setDisplayDraft({ sourceValue: value, displayValue: masked })

    if (!masked) {
      onValueChange?.('')
      return
    }

    const parsed = displayToIsoMonth(masked)
    if (parsed) commit(parsed)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && /^\d{4}-\d{2}$/.test(value)) {
      setVisibleYear(parseInt(value.split('-')[0], 10))
    }
  }

  const triggerLabel = value ? formatMonthLongLabel(value) : placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder}
          maxLength={7}
          onChange={(e) => handleManualChange(e.target.value)}
          aria-label={triggerLabel || placeholder}
          className={cn(
            'h-11 w-full rounded-md border border-input bg-background px-3 pr-11 text-sm font-medium text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground',
            'hover:border-primary/35 hover:bg-primary/5 focus:border-primary focus:ring-3 focus:ring-primary/15',
            'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
            !displayValue && 'text-muted-foreground',
            className,
          )}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Abrir seletor de mês"
            title={triggerLabel}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-64 max-w-[calc(100vw-2rem)]">
        {/* Year navigation */}
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setVisibleYear((y) => y - 1)}
              aria-label="Ano anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold text-foreground">{visibleYear}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setVisibleYear((y) => y + 1)}
              aria-label="Próximo ano"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 3×4 month grid */}
        <div className="grid grid-cols-3 gap-1 p-3">
          {MONTH_ABBR.map((abbr, idx) => {
            const monthNum = idx + 1
            const isoVal = `${visibleYear}-${String(monthNum).padStart(2, '0')}`
            const isSelected = selectedYear === visibleYear && selectedMonth === monthNum
            return (
              <button
                key={abbr}
                type="button"
                onClick={() => commit(isoVal)}
                className={cn(
                  'flex h-9 items-center justify-center rounded-md text-sm font-medium outline-none transition',
                  'hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary focus:ring-2 focus:ring-primary/20',
                  isSelected &&
                    'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary hover:text-white',
                )}
                aria-pressed={isSelected}
              >
                {abbr}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => commit(currentIsoMonth())}
          >
            Este mês
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            {value ? isoMonthToDisplay(value) : 'Sem seleção'}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
