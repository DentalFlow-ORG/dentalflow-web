import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { ListToolbar } from '@/components/common/ListToolbar'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'

import {
  cancelAppointment,
  listAppointments,
  updateAppointmentStatus,
} from '../services/scheduling.service'
import type {
  Appointment,
  AppointmentStatus,
} from '../types/scheduling.types'
import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { CancelAppointmentDialog } from '../components/appointments/CancelAppointmentDialog'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'

const PAGE_SIZE = 15

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

const SEARCH_FN = (a: Appointment, q: string) =>
  `${a.patientName} ${a.patientEmail ?? ''} ${a.patientPhone ?? ''}`.toLowerCase().includes(q)

const FILTER_FNS = {
  status: (a: Appointment, v: string) => a.status === v,
  profileId: (a: Appointment, v: string) => a.profileId === v,
}

export function AppointmentsPage() {
  const { showAlert } = useGlobalAlerts()

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  // Dynamic filter defs — profileId options depend on loaded profiles
  const filterDefs = useMemo<FilterDef[]>(() => {
    const defs: FilterDef[] = [
      { key: 'status', label: 'Status', options: STATUS_OPTIONS },
    ]
    if (profiles.length > 1) {
      defs.push({
        key: 'profileId',
        label: 'Profissional',
        options: profiles.map((p) => ({ value: p.id, label: p.displayName })),
      })
    }
    return defs
  }, [profiles])

  const {
    searchQuery, setSearchQuery,
    activeFilters, setFilter, clearAll,
    page, setPage,
    totalPages,
    filteredCount,
    paginatedData: appointments,
  } = useListFilter<Appointment>(allAppointments, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
    pageSize: PAGE_SIZE,
  })

  useEffect(() => {
    Promise.all([listAppointments(), listProfiles()])
      .then(([appts, profs]) => {
        setAllAppointments(appts)
        setProfiles(profs)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar agendamentos.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar agendamentos', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setIsActionLoading(true)
    try {
      const updated = await updateAppointmentStatus(id, { status })
      setAllAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
      if (selectedAppointment?.id === id) setSelectedAppointment(updated)
      showAlert({ title: 'Status atualizado', tone: 'success' })
    } catch (err) {
      showAlert({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleCancel(reason: string) {
    if (!cancelTarget) return
    setIsCanceling(true)
    try {
      const updated = await cancelAppointment(cancelTarget.id, reason)
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === cancelTarget.id ? updated : a)),
      )
      if (selectedAppointment?.id === cancelTarget.id) setSelectedAppointment(updated)
      setCancelTarget(null)
      showAlert({ title: 'Agendamento cancelado', tone: 'success' })
    } catch (err) {
      showAlert({
        title: 'Erro ao cancelar agendamento',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsCanceling(false)
    }
  }

  function handleCreated(appointment: Appointment) {
    setAllAppointments((prev) => [appointment, ...prev])
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AppPageHeader
        eyebrow="Agenda"
        title="Agendamentos"
        description="Gerencie as consultas da clínica, acompanhe status e registre novos atendimentos."
        action={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando agendamentos..."
        error={error}
      >
        <div className="space-y-4">
          <ListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Pesquisar por paciente, e-mail ou telefone..."
            filterDefs={filterDefs}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={allAppointments.length}
          />

          <AppointmentTable
            appointments={appointments}
            isActionLoading={isActionLoading}
            onRowClick={setSelectedAppointment}
            onStatusChange={handleStatusChange}
            onCancelRequest={setCancelTarget}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            filteredCount={filteredCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </ListPageShell>

      <AppointmentDrawer
        appointment={selectedAppointment}
        isActionLoading={isActionLoading}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
        onCancelRequest={(appt) => {
          setCancelTarget(appt)
          setSelectedAppointment(null)
        }}
      />

      <CancelAppointmentDialog
        open={!!cancelTarget}
        patientName={cancelTarget?.patientName ?? ''}
        isCanceling={isCanceling}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />

      <CreateAppointmentModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
