import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { FilterDef } from '@/components/common/ListToolbar'
import { ListToolbar } from '@/components/common/ListToolbar'
import { ListPageShell } from '@/components/common/ListPageShell'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useListFilter } from '@/hooks/useListFilter'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'

import { listAppointments } from '../services/scheduling.service'
import type { Appointment } from '../types/scheduling.types'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'
import { EditAppointmentModal } from '../components/appointments/EditAppointmentModal'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { getWeekStart } from '../utils/time'

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
  const [isCreating, setIsCreating] = useState(false)
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))

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
    filteredCount,
    filteredData: appointments,
  } = useListFilter<Appointment>(allAppointments, {
    searchFn: SEARCH_FN,
    filterFns: FILTER_FNS,
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

  function handleCreated(appointment: Appointment) {
    setAllAppointments((prev) => [appointment, ...prev])
  }

  function handleUpdated(appointment: Appointment) {
    setAllAppointments((prev) =>
      prev.map((appt) => (appt.id === appointment.id ? appointment : appt)),
    )
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

          <WeekCalendar
            appointments={appointments}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            onAppointmentClick={setSelectedAppointment}
          />
        </div>
      </ListPageShell>

      <EditAppointmentModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdated={handleUpdated}
      />

      <CreateAppointmentModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
