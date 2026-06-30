import { Link } from '@tanstack/react-router'
import { CalendarDays, CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { AppointmentStatusBadge } from '@/features/scheduling/components/appointments/AppointmentStatusBadge'
import { useAppointmentStatusChange } from '@/features/scheduling/hooks/useAppointmentStatusChange'
import { DENTIST_ALLOWED_TRANSITIONS } from '@/features/scheduling/hooks/useSchedulePage'
import { listProfiles } from '@/features/scheduling/services/profiles.service'
import { listAppointments } from '@/features/scheduling/services/scheduling.service'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import { formatAppointmentDateLong, formatWallTime } from '@/features/scheduling/utils/time'
import { brazilTodayIso } from '@/lib/brazil-timezone'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'
import { HomeSection } from '@/features/home/components/HomeSection'

export function DentistHomePageContainer() {
  const { user } = useAuth()
  const today = brazilTodayIso()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [ownProfileFound, setOwnProfileFound] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const { handleStatusChange } = useAppointmentStatusChange({
    setAppointments,
    drawerAppointment,
    setDrawerAppointment,
    setIsActionLoading,
  })

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setOwnProfileFound(true)
    // Fetch profiles and today's appointments in parallel; keep only own appointments.
    Promise.all([listProfiles(), listAppointments(today)])
      .then(([profiles, appts]) => {
        const ownProfile = profiles.find((p) => p.userId === user?.id) ?? null
        setOwnProfileFound(ownProfile !== null)
        setAppointments(ownProfile ? appts.filter((a) => a.profileId === ownProfile.id) : [])
      })
      .catch(() =>
        setError('Não foi possível carregar os dados do dia. Tente recarregar a página.'),
      )
      .finally(() => setIsLoading(false))
  }, [today, user?.id])

  const statusCounts = useMemo(() => {
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length
    const pending = appointments.filter((a) => a.status === 'PENDING').length
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length
    return { total: appointments.length, confirmed, pending, completed }
  }, [appointments])

  // All today's appointments sorted by startTime — used in "Agenda do dia"
  const allTodaySorted = useMemo(
    () => [...appointments].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [appointments],
  )

  // Next upcoming appointment (first PENDING or CONFIRMED by startTime)
  const nextAppointment = useMemo(
    () => allTodaySorted.find((a) => a.status === 'PENDING' || a.status === 'CONFIRMED') ?? null,
    [allTodaySorted],
  )

  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Clínico"
        title="Meu dia clínico"
        description={formatAppointmentDateLong(today)}
        badge={
          statusCounts.total > 0 ? (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {statusCounts.total} consulta{statusCounts.total !== 1 ? 's' : ''} hoje
            </span>
          ) : undefined
        }
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando sua agenda clínica..." />
      ) : !ownProfileFound ? (
        <InlineFeedback tone="warning">
          <p className="font-semibold">Perfil clínico não encontrado</p>
          <p className="mt-1 text-sm">
            Seu usuário não está vinculado a um perfil profissional nesta clínica. Solicite ao
            responsável que faça a vinculação.
          </p>
        </InlineFeedback>
      ) : (
        <>
          {/* KPI row — own profile appointments only */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HomeKpiCard
              label="Consultas hoje"
              value={String(statusCounts.total)}
              icon={CalendarDays}
              tone="primary"
            />
            <HomeKpiCard
              label="Confirmadas"
              value={String(statusCounts.confirmed)}
              icon={CheckCircle2}
              tone={statusCounts.confirmed > 0 ? 'success' : 'neutral'}
            />
            <HomeKpiCard
              label="Pendentes"
              value={String(statusCounts.pending)}
              icon={Clock}
              tone={statusCounts.pending > 0 ? 'warning' : 'neutral'}
            />
            <HomeKpiCard
              label="Concluídas"
              value={String(statusCounts.completed)}
              icon={CheckCircle2}
              tone={statusCounts.completed > 0 ? 'info' : 'neutral'}
            />
          </div>

          {/* Próxima consulta hero — first PENDING or CONFIRMED appointment */}
          <HomeSection
            title="Próxima consulta"
            action={
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link to="/app/agenda">Ver agenda</Link>
              </Button>
            }
          >
            {nextAppointment ? (
              <NextAppointmentCard
                appointment={nextAppointment}
                onDetails={() => setDrawerAppointment(nextAppointment)}
              />
            ) : (
              <HomeEmptyState
                compact
                icon={CalendarDays}
                title="Nenhuma consulta restante hoje."
                description="Todas as consultas foram concluídas ou não há mais pendentes."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/app/agenda">Ir para a agenda</Link>
                  </Button>
                }
              />
            )}
          </HomeSection>

          {/* Agenda do dia — all today's appointments with status badges */}
          <HomeSection
            title="Agenda do dia"
            description="Todas as consultas de hoje, por ordem de horário"
            action={
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link to="/app/agenda">Minha agenda</Link>
              </Button>
            }
          >
            {allTodaySorted.length === 0 ? (
              <HomeEmptyState
                compact
                icon={CalendarDays}
                title="Nenhuma consulta agendada para hoje."
              />
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {allTodaySorted.map((appt) => (
                  <li key={appt.id}>
                    <button
                      type="button"
                      className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded px-2 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      onClick={() => setDrawerAppointment(appt)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-foreground">
                          {appt.patientName}
                        </span>
                        {appt.service && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {appt.service.name}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <AppointmentStatusBadge status={appt.status} />
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {formatWallTime(appt.startTime)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </HomeSection>

          {/* Quick access — valid DENTIST routes only */}
          <HomeActionGrid columns={2}>
            <HomeQuickActionCard title="Minha agenda" icon={CalendarDays} to="/app/agenda" />
            <HomeQuickActionCard title="Prontuários" icon={ClipboardList} to="/app/prontuario" />
          </HomeActionGrid>
        </>
      )}

      <AppointmentDrawer
        appointment={drawerAppointment}
        allowedTransitions={DENTIST_ALLOWED_TRANSITIONS}
        isActionLoading={isActionLoading}
        onClose={() => setDrawerAppointment(null)}
        onStatusChange={handleStatusChange}
        onCancelRequest={() => {}}
      />
    </AppPage>
  )
}

// ── Next appointment hero card ─────────────────────────────────────────────────

function NextAppointmentCard({
  appointment,
  onDetails,
}: {
  appointment: Appointment
  onDetails: () => void
}) {
  const startTime = formatWallTime(appointment.startTime)
  const endTime = formatWallTime(appointment.endTime)

  return (
    <div className="mt-2 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {startTime}
            {endTime && (
              <span className="ml-1 text-base font-normal text-muted-foreground">– {endTime}</span>
            )}
          </p>
          <p className="mt-1.5 truncate text-lg font-semibold text-foreground">
            {appointment.patientName}
          </p>
          {appointment.service && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {appointment.service.name}
            </p>
          )}
        </div>
        <AppointmentStatusBadge status={appointment.status} className="mt-0.5 shrink-0" />
      </div>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={onDetails}>
          Ver detalhes
        </Button>
      </div>
    </div>
  )
}
