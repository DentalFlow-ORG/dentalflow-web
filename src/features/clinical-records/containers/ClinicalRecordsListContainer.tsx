import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Calendar, ClipboardList, Plus } from 'lucide-react'

import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
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

  // Derive dentist list from the unfiltered base load (load without dentist filter to populate selector)
  const { records: allRecords } = useClinicalRecords(
    isOwner
      ? { status: statusFilter !== 'TODOS' ? statusFilter : undefined }
      : {},
  )

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
    <div className="space-y-8">
      <AppPageHeader
        eyebrow="Clínica"
        title="Prontuário digital"
        description="Registre, acompanhe e imprima as informações clínicas de cada atendimento."
        action={
          <Link to="/app/agendamentos">
            <Button>
              <Plus className="h-4 w-4" />
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
          <div className="flex flex-wrap items-start gap-3">
            <input
              type="search"
              placeholder="Buscar por paciente, procedimento ou observação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full max-w-sm rounded-md border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />

            {/* Professional filter — OWNER only */}
            {isOwner && professionals.length > 0 && (
              <Select value={dentistFilter} onValueChange={setDentistFilter}>
                <SelectTrigger className="h-9 w-52">
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
            )}
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                type="button"
                onClick={() => setStatusFilter(sf.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === sf.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            {filteredCount} prontuário{filteredCount !== 1 ? 's' : ''} encontrado{filteredCount !== 1 ? 's' : ''}
          </p>

          {/* Records grid */}
          {filtered.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <ClipboardList className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">Nenhum prontuário encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-slate-500">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </div>
      </ListPageShell>
    </div>
  )
}

function RecordCard({ record }: { record: ClinicalRecord }) {
  return (
    <Link to="/app/prontuario/$clinicalRecordId" params={{ clinicalRecordId: record.id }}>
      <PanelCard className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{record.patientName}</p>
            {record.patientEmail && (
              <p className="truncate text-xs text-slate-500">{record.patientEmail}</p>
            )}
          </div>
          <ClinicalRecordStatusBadge status={record.status} />
        </div>

        <p className="mt-2 text-xs text-slate-500">{record.profile.displayName}</p>

        {record.chiefComplaint && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{record.chiefComplaint}</p>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateBR(record.createdAt.slice(0, 10))}
        </div>
      </PanelCard>
    </Link>
  )
}
