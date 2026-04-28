import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'
import { cn } from '@/lib/utils'

import {
  listAppointments,
  listAvailability,
  listAvailabilityExceptions,
  updateAppointmentStatus,
} from '../services/scheduling.service'
import type {
  Appointment,
  AppointmentStatus,
  Availability,
  AvailabilityException,
} from '../types/scheduling.types'
import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AvailabilityManager } from '../components/availability/AvailabilityManager'
import { ExceptionManager } from '../components/availability/ExceptionManager'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { getWeekStart } from '../utils/time'

type Tab = 'agenda' | 'disponibilidade' | 'excecoes'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'excecoes', label: 'Exceções' },
]

export function SchedulePage() {
  const { user } = useAuth()
  const { showAlert } = useGlobalAlerts()

  const [ownProfile, setOwnProfile] = useState<ProfileListItem | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])

  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('agenda')
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profiles, appts] = await Promise.all([
          listProfiles(),
          listAppointments(),
        ])
        const mine = profiles.find((p) => p.userId === user?.id) ?? null
        setOwnProfile(mine)
        setAppointments(appts)

        if (mine) {
          const [avail, excs] = await Promise.all([
            listAvailability(mine.id),
            listAvailabilityExceptions(mine.id),
          ])
          setAvailability(avail)
          setExceptions(excs)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar agenda.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar agenda', description: msg, tone: 'error' })
      } finally {
        setIsBootstrapping(false)
      }
    }
    load()
  }, [user?.id, showAlert])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setIsActionLoading(true)
    try {
      const updated = await updateAppointmentStatus(id, { status })
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
      if (selectedAppointment?.id === id) setSelectedAppointment(updated)
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

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AppPageHeader
        eyebrow="Profissional"
        title="Minha agenda"
        description="Visualize seus agendamentos e gerencie sua disponibilidade semanal."
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isBootstrapping ? (
        <LoadingCard message="Carregando agenda..." />
      ) : !ownProfile ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Perfil não encontrado</p>
            <p className="mt-1 text-amber-700">
              Seu usuário não está associado a um perfil profissional nesta clínica.
              Solicite ao responsável pela clínica que vincule seu perfil.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tab navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex gap-0 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'agenda' && (
            <WeekCalendar
              appointments={appointments}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              onAppointmentClick={setSelectedAppointment}
            />
          )}

          {activeTab === 'disponibilidade' && (
            <PanelCard>
              <AvailabilityManager
                profileId={ownProfile.id}
                slots={availability}
                onSlotsChange={setAvailability}
              />
            </PanelCard>
          )}

          {activeTab === 'excecoes' && (
            <PanelCard>
              <ExceptionManager
                profileId={ownProfile.id}
                exceptions={exceptions}
                onExceptionsChange={setExceptions}
              />
            </PanelCard>
          )}
        </>
      )}

      <AppointmentDrawer
        appointment={selectedAppointment}
        readOnly
        isActionLoading={isActionLoading}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
        onCancelRequest={() => {}}
      />
    </div>
  )
}
