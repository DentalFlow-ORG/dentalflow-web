import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
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
import { AppointmentFilters, type AppointmentFiltersState } from '../components/appointments/AppointmentFilters'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { CancelAppointmentDialog } from '../components/appointments/CancelAppointmentDialog'
import { CreateAppointmentModal } from '../components/appointments/CreateAppointmentModal'

export function AppointmentsPage() {
  const { showAlert } = useGlobalAlerts()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const [filters, setFilters] = useState<AppointmentFiltersState>({
    status: null,
    profileId: null,
  })

  useEffect(() => {
    Promise.all([listAppointments(), listProfiles()])
      .then(([appts, profs]) => {
        setAppointments(appts)
        setProfiles(profs)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar agendamentos.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar agendamentos', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (filters.status && appt.status !== filters.status) return false
      if (filters.profileId && appt.profileId !== filters.profileId) return false
      return true
    })
  }, [appointments, filters])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setIsActionLoading(true)
    try {
      const updated = await updateAppointmentStatus(id, { status })
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      )
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
      setAppointments((prev) =>
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
    setAppointments((prev) => [appointment, ...prev])
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
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

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando agendamentos..." />
      ) : (
        <div className="space-y-4">
          <AppointmentFilters
            filters={filters}
            profiles={profiles}
            onChange={setFilters}
          />
          <AppointmentTable
            appointments={filteredAppointments}
            isActionLoading={isActionLoading}
            onRowClick={setSelectedAppointment}
            onStatusChange={handleStatusChange}
            onCancelRequest={setCancelTarget}
          />
        </div>
      )}

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
