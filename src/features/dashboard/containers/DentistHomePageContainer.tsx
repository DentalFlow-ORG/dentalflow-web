import { Link } from '@tanstack/react-router'
import { Calendar, ClipboardList, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { listProfiles } from '@/features/scheduling/services/profiles.service'
import { listAppointments } from '@/features/scheduling/services/scheduling.service'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import { formatAppointmentDateLong, formatWallTime } from '@/features/scheduling/utils/time'

export function DentistHomePageContainer() {
  const { user } = useAuth()
  const today = brazilTodayIso()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerAppointment, setDrawerAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    // Fetch profiles and today's appointments in parallel, then keep only
    // the appointments that belong to this dentist's own profile.
    Promise.all([listProfiles(), listAppointments(today)])
      .then(([profiles, appts]) => {
        const ownProfile = profiles.find((p) => p.userId === user?.id) ?? null
        setAppointments(ownProfile ? appts.filter((a) => a.profileId === ownProfile.id) : [])
      })
      .catch(() => setError('Não foi possível carregar os dados do dia. Tente recarregar a página.'))
      .finally(() => setIsLoading(false))
  }, [today, user?.id])

  const statusCounts = useMemo(() => {
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length
    const pending = appointments.filter((a) => a.status === 'PENDING').length
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length
    return { total: appointments.length, confirmed, pending, completed }
  }, [appointments])

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
        .slice(0, 5),
    [appointments],
  )

  const greeting = user?.firstName ? `Olá, ${user.firstName}` : 'Minha visão geral'

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Hoje"
        title={greeting}
        description={formatAppointmentDateLong(today)}
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              value={String(statusCounts.total)}
              label="consultas hoje"
              className="border-primary/30 sm:col-span-2 xl:col-span-1"
            />
            <MetricCard value={String(statusCounts.confirmed)} label="confirmadas" />
            <MetricCard value={String(statusCounts.pending)} label="aguardando confirmação" />
            <MetricCard value={String(statusCounts.completed)} label="concluídas" />
          </div>

          <PanelCard>
            <h2 className="text-base font-semibold text-foreground">Próximas consultas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Agendamentos pendentes ou confirmados para hoje
            </p>
            {upcomingAppointments.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Nenhuma consulta pendente para hoje.</p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {upcomingAppointments.map((appt) => (
                  <li key={appt.id}>
                    <button
                      type="button"
                      className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded px-2 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
                      onClick={() => setDrawerAppointment(appt)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {appt.patientName}
                        </span>
                        {appt.service && (
                          <span className="block truncate text-muted-foreground">
                            {appt.service.name}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-medium text-foreground">
                          {formatWallTime(appt.startTime)}
                        </span>
                        <span className="block text-muted-foreground">
                          {appt.profile?.displayName ?? 'Profissional não informado'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/agenda">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Minha agenda
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/prontuario">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Prontuários
              </Link>
            </Button>
          </div>
        </>
      )}

      <AppointmentDrawer
        appointment={drawerAppointment}
        readOnly
        isActionLoading={false}
        onClose={() => setDrawerAppointment(null)}
        onStatusChange={() => {}}
        onCancelRequest={() => {}}
      />
    </AppPage>
  )
}
