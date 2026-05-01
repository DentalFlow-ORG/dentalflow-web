import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FilterOption = {
  value: string
  label: string
}

export type FilterDef = {
  key: string
  label: string
  options: FilterOption[]
}

type ListToolbarProps = {
  searchQuery: string
  onSearchChange: (q: string) => void
  searchPlaceholder?: string
  filterDefs?: FilterDef[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string | null) => void
  onClearAll: () => void
  filteredCount?: number
  totalCount?: number
  className?: string
}

const ALL_SENTINEL = '__ALL__'

export function ListToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  filterDefs = [],
  activeFilters,
  onFilterChange,
  onClearAll,
  filteredCount,
  totalCount,
  className,
}: ListToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const activeFilterCount = Object.keys(activeFilters).length
  const hasActiveFilters = activeFilterCount > 0
  const isFiltered = hasActiveFilters || searchQuery.trim().length > 0

  // Build badges for each active filter
  const badges = Object.entries(activeFilters).map(([key, value]) => {
    const def = filterDefs.find((d) => d.key === key)
    const option = def?.options.find((o) => o.value === value)
    return {
      key,
      defLabel: def?.label ?? key,
      optionLabel: option?.label ?? value,
    }
  })

  return (
    <div className={cn('space-y-3', className)}>
      {/* Row 1: search + filter button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter popover button */}
        {filterDefs.length > 0 && (
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={hasActiveFilters ? 'default' : 'outline'}
                className={cn(
                  'h-11 shrink-0 gap-2',
                  hasActiveFilters && 'ring-2 ring-primary/20',
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72">
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Filter className="h-3.5 w-3.5" />
                    Filtros
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        Object.keys(activeFilters).forEach((k) =>
                          onFilterChange(k, null),
                        )
                        setFilterOpen(false)
                      }}
                      className="text-xs text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-700"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {filterDefs.map((def) => (
                    <div key={def.key} className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {def.label}
                      </p>
                      <Select
                        value={activeFilters[def.key] ?? ALL_SENTINEL}
                        onValueChange={(v) =>
                          onFilterChange(def.key, v === ALL_SENTINEL ? null : v)
                        }
                      >
                        <SelectTrigger size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SENTINEL}>Todos</SelectItem>
                          {def.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setFilterOpen(false)}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Row 2: active filter badges */}
      {(badges.length > 0 || (isFiltered && filteredCount !== undefined)) && (
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <button
              key={badge.key}
              type="button"
              onClick={() => onFilterChange(badge.key, null)}
              className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 pl-3 pr-2 text-xs font-semibold leading-none text-primary transition-colors hover:bg-blue-100"
            >
              <span className="shrink-0 font-normal text-slate-500">
                {badge.defLabel}:
              </span>
              <span className="truncate">{badge.optionLabel}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                <X className="h-2.5 w-2.5" />
              </span>
            </button>
          ))}

          {badges.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex h-8 items-center text-xs text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-700"
            >
              Limpar tudo
            </button>
          )}

          {isFiltered && filteredCount !== undefined && totalCount !== undefined && (
            <span className="ml-auto inline-flex h-8 items-center text-xs text-slate-500">
              {filteredCount === 0
                ? 'Nenhum resultado'
                : `${filteredCount} de ${totalCount} resultado${totalCount !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
