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
} from '../services/scheduling.service'
import type {
  Appointment,
  AppointmentStatus,
  Availability,
  AvailabilityException,
} from '../types/scheduling.types'
import { AppointmentDrawer } from '../components/appointments/AppointmentDrawer'
import { AppointmentTable } from '../components/appointments/AppointmentTable'
import { AvailabilityManager } from '../components/availability/AvailabilityManager'
import { ExceptionManager } from '../components/availability/ExceptionManager'
import { ViewToggle } from '../components/shared/ViewToggle'
import { WeekCalendar } from '../components/calendar/WeekCalendar'
import { useAppointmentStatusChange } from '../hooks/useAppointmentStatusChange'
import { getWeekStart } from '../utils/time'

type Tab = 'agenda' | 'disponibilidade' | 'excecoes'
type View = 'calendar' | 'table'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'excecoes', label: 'Exceções' },
]

const DENTIST_ALLOWED_TRANSITIONS: AppointmentStatus[] = ['COMPLETED', 'NO_SHOW']

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
  const [view, setView] = useState<View>('calendar')
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
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
        setAppointments(mine ? appts.filter((appt) => appt.profileId === mine.id) : [])

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

  const { handleStatusChange } = useAppointmentStatusChange({
    setAppointments,
    drawerAppointment,
    setDrawerAppointment,
    setIsActionLoading,
  })

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
            <div className="space-y-4">
              {view === 'calendar' ? (
                <WeekCalendar
                  appointments={appointments}
                  weekStart={weekStart}
                  profileAvailability={availability}
                  profileExceptions={exceptions}
                  toolbarAction={<ViewToggle view={view} onChange={setView} />}
                  onWeekChange={setWeekStart}
                  onAppointmentClick={setDrawerAppointment}
                />
              ) : (
                <>
                  <div className="flex justify-end">
                    <ViewToggle view={view} onChange={setView} />
                  </div>
                  <AppointmentTable
                    appointments={appointments}
                    isActionLoading={isActionLoading}
                    allowedTransitions={DENTIST_ALLOWED_TRANSITIONS}
                    emptyDescription="Nenhuma consulta vinculada ao seu perfil."
                    onRowClick={setDrawerAppointment}
                    onStatusChange={handleStatusChange}
                    onCancelRequest={() => {}}
                  />
                </>
              )}
            </div>
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
        appointment={drawerAppointment}
        isActionLoading={isActionLoading}
        allowedTransitions={DENTIST_ALLOWED_TRANSITIONS}
        onClose={() => setDrawerAppointment(null)}
        onStatusChange={handleStatusChange}
        onCancelRequest={() => {}}
      />
    </div>
  )
}
