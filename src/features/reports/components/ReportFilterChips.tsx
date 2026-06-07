import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { FilterChip } from '../utils/report-filter-chips'

interface ReportFilterChipsProps {
  chips: FilterChip[]
  onClear: () => void
}

export function ReportFilterChips({ chips, onClear }: ReportFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {chip.label}
        </span>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="ml-auto h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <X className="mr-1 h-3 w-3" aria-hidden="true" />
        Limpar filtros
      </Button>
    </div>
  )
}
