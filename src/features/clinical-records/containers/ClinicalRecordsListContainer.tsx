import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Calendar, ClipboardList, Plus } from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatDateBR } from '@/lib/date-time-formatters'
import { useListFilter } from '@/hooks/useListFilter'

import { ClinicalRecordStatusBadge } from '../components/ClinicalRecordStatusBadge'
import { useClinicalRecords } from '../hooks/useClinicalRecords'
import type { ClinicalRecord, ClinicalRecordStatus } from '../types/clinical-record.types'

type StatusFilter = ClinicalRecordStatus | 'TODOS'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'LOCKED', label: 'Bloqueados' },
  { value: 'CANCELED', label: 'Cancelados' },
]

export function ClinicalRecordsListContainer() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const [dentistFilter, setDentistFilter] = useState<string>('TODOS')

  // Fetch from backend with server-side role scoping + status/dentist filters
  const { records, isLoading, error, refresh } = useClinicalRecords({
    status: statusFilter !== 'TODOS' ? statusFilter : undefined,
    dentistProfileId: isOwner && dentistFilter !== 'TODOS' ? dentistFilter : undefined,
  })

  // Derive dentist list from a status-unfiltered load so the professional dropdown
  // stays stable regardless of which status filter is currently active.
  const { records: allRecords } = useClinicalRecords(isOwner ? {} : {})

  const professionals = useMemo(() => {
    const map = new Map<string, string>()
    allRecords.forEach((r) => map.set(r.profile.id, r.profile.displayName))
    return Array.from(map.entries())
      .map(([id, displayName]) => ({ id, displayName }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'))
  }, [allRecords])

  // Text search is client-side on already-server-filtered records (lightweight)
  const {
    searchQuery,
    setSearchQuery,
    paginatedData: filtered,
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
        r.profile.displayName.toLowerCase().includes(lq) ||
        (r.chiefComplaint ?? '').toLowerCase().includes(lq) ||
        (r.clinicalEvolution ?? '').toLowerCase().includes(lq)
      )
    },
  })

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

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando prontuários..."
        error={error}
        onRetry={refresh}
        isEmpty={records.length === 0 && statusFilter === 'TODOS' && dentistFilter === 'TODOS' && !searchQuery}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title="Nenhum prontuário ainda"
            description="Inicie um prontuário a partir de um agendamento para registrar as informações clínicas do atendimento."
            action={
              <Link to="/app/agendamentos">
                <Button>Ver agendamentos</Button>
              </Link>
            }
          />
        }
      >
        <div className="space-y-4">
          {/* Filters row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Buscar" htmlFor="clinicalSearch">
              <TextInput
                id="clinicalSearch"
                type="search"
                placeholder="Paciente, procedimento ou observação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FormField>

            {/* Professional filter — OWNER only */}
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

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                type="button"
                aria-pressed={statusFilter === sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === sf.value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 dark:border dark:border-border dark:hover:bg-muted dark:hover:text-foreground'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredCount} prontuário{filteredCount !== 1 ? 's' : ''} encontrado{filteredCount !== 1 ? 's' : ''}
          </p>

          {/* Records grid */}
          {filtered.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Nenhum prontuário encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
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

function RecordCard({ record }: { record: ClinicalRecord }) {
  return (
    <Link to="/app/prontuario/$clinicalRecordId" params={{ clinicalRecordId: record.id }}>
      <PanelCard className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{record.patientName}</p>
            {record.patientEmail && (
              <p className="truncate text-xs text-muted-foreground">{record.patientEmail}</p>
            )}
          </div>
          <ClinicalRecordStatusBadge status={record.status} />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">{record.profile.displayName}</p>

        {record.chiefComplaint && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{record.chiefComplaint}</p>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDateBR(record.createdAt.slice(0, 10))}
        </div>
      </PanelCard>
    </Link>
  )
}
