import { Link } from '@tanstack/react-router'
import { ClipboardList, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChipGroup } from '@/components/common/FilterChip'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useListFilter } from '@/hooks/useListFilter'
import { cn } from '@/lib/utils'

import { ClinicalRecordListItem } from '../components/ClinicalRecordListItem'
import { STATUS_FILTERS, type StatusFilter } from '../constants/clinical-record-filters'
import { useClinicalRecords } from '../hooks/useClinicalRecords'
import type { ClinicalRecord } from '../types/clinical-record.types'

// ── Local types ────────────────────────────────────────────────────────────────

type KpiData = {
  total: number
  draft: number
  completed: number
  locked: number
}

// ── Local utils ────────────────────────────────────────────────────────────────

function deriveKpis(records: ClinicalRecord[]): KpiData {
  return records.reduce<KpiData>(
    (acc, r) => {
      acc.total++
      if (r.status === 'DRAFT') acc.draft++
      else if (r.status === 'COMPLETED') acc.completed++
      else if (r.status === 'LOCKED') acc.locked++
      return acc
    },
    { total: 0, draft: 0, completed: 0, locked: 0 },
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type KpiChipProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function KpiChip({ label, count, active, onClick }: KpiChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1 rounded-xl border p-4 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        active
          ? 'border-primary/40 bg-primary/5 shadow-sm dark:bg-primary/10'
          : 'border-border bg-card hover:border-primary/20 hover:bg-accent/30 hover:shadow-sm',
      )}
    >
      <span
        className={cn(
          'text-2xl font-bold tabular-nums leading-none',
          active ? 'text-primary' : 'text-foreground',
        )}
      >
        {count}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </button>
  )
}

/*
 * Column header for the list on sm+.
 * Widths mirror ClinicalRecordListItem — keep both in sync.
 */
function RecordListHeader() {
  return (
    <div className="hidden items-center gap-4 border-b border-border px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 sm:flex">
      <span className="min-w-0 flex-1">Paciente</span>
      <span className="hidden w-36 shrink-0 lg:block">Profissional</span>
      <span className="hidden w-44 shrink-0 xl:block">Queixa principal</span>
      <span className="w-24 shrink-0">Status</span>
      <span className="w-24 shrink-0 text-right">Data</span>
      <span className="w-4 shrink-0" aria-hidden="true" />
    </div>
  )
}

function FilteredEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Nenhum prontuário encontrado</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou a busca para encontrar o que procura.
        </p>
      </div>
    </div>
  )
}

// ── Main container ─────────────────────────────────────────────────────────────

export function ClinicalRecordsListContainer() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const [dentistFilter, setDentistFilter] = useState<string>('TODOS')

  // Primary fetch: server-filtered by status + dentist
  const { records, isLoading, error, refresh } = useClinicalRecords({
    status: statusFilter !== 'TODOS' ? statusFilter : undefined,
    dentistProfileId: isOwner && dentistFilter !== 'TODOS' ? dentistFilter : undefined,
  })

  // Secondary fetch: unfiltered — used for KPI strip and stable professional dropdown.
  // Kept as a separate hook so the professional list stays stable when status filter changes.
  // Non-owners see only their own records from both calls anyway (server-side scoping).
  const { records: allRecords } = useClinicalRecords({})

  // KPI counts respect the active dentist filter so numbers match what clicking shows
  const kpis = useMemo<KpiData>(() => {
    const source =
      isOwner && dentistFilter !== 'TODOS'
        ? allRecords.filter((r) => r.profile.id === dentistFilter)
        : allRecords
    return deriveKpis(source)
  }, [allRecords, dentistFilter, isOwner])

  // Professional options derived from the unfiltered list (stable across status changes)
  const professionals = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of allRecords) map.set(r.profile.id, r.profile.displayName)
    return Array.from(map.entries())
      .map(([id, displayName]) => ({ id, displayName }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'))
  }, [allRecords])

  // Client-side text search + pagination applied to the server-filtered result
  const {
    searchQuery,
    setSearchQuery,
    paginatedData: paginatedRecords,
    filteredCount,
    page,
    setPage,
    totalPages,
  } = useListFilter(records, {
    searchFn: (r: ClinicalRecord, q) => {
      const lq = q.toLowerCase()
      return (
        r.patientName.toLowerCase().includes(lq) ||
        (r.patientEmail ?? '').toLowerCase().includes(lq) ||
        (r.patientPhone ?? '').toLowerCase().includes(lq) ||
        r.profile.displayName.toLowerCase().includes(lq) ||
        (r.chiefComplaint ?? '').toLowerCase().includes(lq) ||
        (r.clinicalEvolution ?? '').toLowerCase().includes(lq)
      )
    },
  })

  const isFiltered = statusFilter !== 'TODOS' || dentistFilter !== 'TODOS' || !!searchQuery
  const showKpis = !isLoading && !error && allRecords.length > 0

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Clínica"
        title="Prontuário digital"
        description="Registre, acompanhe e imprima as informações clínicas de cada atendimento."
        action={
          <Link to="/app/agendamentos">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo via agendamento
            </Button>
          </Link>
        }
      />

      {/* ── KPI strip ───────────────────────────────────────────────── */}
      {/* Derived from unfiltered allRecords; chips double as quick status filters */}
      {showKpis && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <KpiChip
            label="Total"
            count={kpis.total}
            active={statusFilter === 'TODOS'}
            onClick={() => setStatusFilter('TODOS')}
          />
          <KpiChip
            label="Rascunhos"
            count={kpis.draft}
            active={statusFilter === 'DRAFT'}
            onClick={() => setStatusFilter('DRAFT')}
          />
          <KpiChip
            label="Concluídos"
            count={kpis.completed}
            active={statusFilter === 'COMPLETED'}
            onClick={() => setStatusFilter('COMPLETED')}
          />
          <KpiChip
            label="Bloqueados"
            count={kpis.locked}
            active={statusFilter === 'LOCKED'}
            onClick={() => setStatusFilter('LOCKED')}
          />
        </div>
      )}

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando prontuários..."
        error={error}
        onRetry={refresh}
        isEmpty={records.length === 0 && !isFiltered}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="Nenhum prontuário ainda"
            description="Os prontuários são iniciados a partir de um agendamento. Crie um atendimento e registre as informações clínicas do paciente."
            action={
              <Link to="/app/agendamentos">
                <Button>Ver agendamentos</Button>
              </Link>
            }
          />
        }
      >
        <div className="space-y-4">
          {/* ── Filter panel ─────────────────────────────────────────── */}
          <PanelCard className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Buscar" htmlFor="clinicalSearch">
                  <TextInput
                    id="clinicalSearch"
                    type="search"
                    placeholder="Paciente, profissional, queixa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </FormField>

                {isOwner && professionals.length > 0 && (
                  <FormField label="Profissional" htmlFor="clinicalDentist">
                    <Select value={dentistFilter} onValueChange={setDentistFilter}>
                      <SelectTrigger id="clinicalDentist">
                        <SelectValue placeholder="Todos os profissionais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos os profissionais</SelectItem>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                <FilterChipGroup<StatusFilter>
                  options={STATUS_FILTERS}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v)}
                  ariaLabel="Filtrar prontuários por status"
                />
              </div>

              {searchQuery && (
                <p className="text-xs text-muted-foreground/60">
                  A busca por texto filtra os {records.length} prontuário
                  {records.length !== 1 ? 's' : ''} já carregados — para pesquisar em toda a base,
                  remova o filtro de status.
                </p>
              )}
            </div>
          </PanelCard>

          {/* ── Results meta ─────────────────────────────────────────── */}
          <p className="text-sm text-muted-foreground">
            {filteredCount === 0
              ? 'Nenhum resultado'
              : `${filteredCount} prontuário${filteredCount !== 1 ? 's' : ''} encontrado${filteredCount !== 1 ? 's' : ''}`}
          </p>

          {/* ── Record list ──────────────────────────────────────────── */}
          {paginatedRecords.length === 0 ? (
            <FilteredEmptyState />
          ) : (
            <div className="space-y-2">
              <RecordListHeader />
              <div className="space-y-1.5">
                {paginatedRecords.map((record) => (
                  <ClinicalRecordListItem key={record.id} record={record} />
                ))}
              </div>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            filteredCount={filteredCount}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      </ListPageShell>
    </AppPage>
  )
}
