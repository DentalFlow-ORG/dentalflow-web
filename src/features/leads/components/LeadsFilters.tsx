import { CalendarClock, Search, X } from 'lucide-react'
import { TextInput } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { LeadFilters, LeadSource, LeadStatus } from '../types/leads.types'
import { SOURCE_LABELS } from './LeadSourceBadge'
import { STATUS_CONFIG } from './LeadStatusBadge'

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as LeadStatus[]
const ALL_SOURCES = Object.keys(SOURCE_LABELS) as LeadSource[]

interface LeadsFiltersProps {
  filters: LeadFilters
  onChange: (filters: Partial<LeadFilters>) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function LeadsFilters({ filters, onChange, onClear, hasActiveFilters }: LeadsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <TextInput
          type="search"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={filters.search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ search: e.target.value, page: 1 })
          }
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(v) => onChange({ status: v === 'all' ? '' : (v as LeadStatus), page: 1 })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source || 'all'}
        onValueChange={(v) => onChange({ source: v === 'all' ? '' : (v as LeadSource), page: 1 })}
      >
        <SelectTrigger className="w-full sm:w-35">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as origens</SelectItem>
          {ALL_SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        aria-pressed={filters.hasFollowUp}
        onClick={() => onChange({ hasFollowUp: !filters.hasFollowUp, page: 1 })}
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          filters.hasFollowUp
            ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border-input bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground',
        )}
      >
        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
        Com retorno
      </button>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
          <X className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
