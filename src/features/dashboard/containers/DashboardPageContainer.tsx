import { Link } from '@tanstack/react-router'
import { Calendar, ClipboardList, Package, Receipt } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { formatWallTime } from '@/features/scheduling/utils/time'

import { useDashboardPage } from '../hooks/useDashboardPage'
import { ProductivityCenter } from './ProductivityCenter'

function formatTodayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardPageContainer() {
  const { user } = useAuth()

  if (user?.role === 'OWNER') {
    return <ProductivityCenter />
  }

  return <AssistantDashboard />
}

function AssistantDashboard() {
  const {
    today,
    statusCounts,
    upcomingAppointments,
    activeDentists,
    isLoading,
    error,
    drawerAppointment,
    setDrawerAppointment,
  } = useDashboardPage()

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Hoje"
        title="Visão geral"
        description={formatTodayLabel(today)}
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando dados do dia..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              value={String(statusCounts.total)}
              label="consultas hoje"
              className="border-primary/30 bg-card sm:col-span-2 xl:col-span-1"
            />
            <MetricCard value={String(statusCounts.confirmed)} label="confirmadas" />
            <MetricCard
              value={String(statusCounts.pending)}
              label="aguardando confirmação"
            />
            <MetricCard value={String(statusCounts.completed)} label="concluídas" />
            <MetricCard
              value={String(statusCounts.canceledOrNoShow)}
              label="canceladas / não compareceu"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PanelCard>
              <h2 className="text-base font-semibold text-foreground">
                Próximas consultas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Agendamentos pendentes ou confirmados do dia
              </p>
              {upcomingAppointments.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
                  <Calendar
                    className="h-8 w-8 text-muted-foreground/40"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma consulta pendente para hoje.
                  </p>
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
                            {appt.profile.displayName}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            <PanelCard>
              <h2 className="text-base font-semibold text-foreground">
                Alertas do dia
              </h2>
              <div className="mt-4 space-y-4">
                {statusCounts.pending > 0 ? (
                  <InlineFeedback tone="warning">
                    <p className="font-medium">
                      {statusCounts.pending}{' '}
                      {statusCounts.pending === 1
                        ? 'consulta aguarda confirmação'
                        : 'consultas aguardam confirmação'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link to="/app/agendamentos">Ver agendamentos</Link>
                    </Button>
                  </InlineFeedback>
                ) : (
                  <InlineFeedback tone="success">
                    Todas as consultas estão confirmadas ou concluídas.
                  </InlineFeedback>
                )}

                {activeDentists.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Profissionais com agenda hoje
                    </p>
                    <ul className="space-y-1">
                      {activeDentists.map((name) => (
                        <li key={name} className="text-sm text-foreground">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PanelCard>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/agendamentos">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Agendamentos
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/prontuario">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Prontuários
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/estoque">
                <Package className="h-4 w-4" aria-hidden="true" />
                Estoque
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start lg:w-auto" asChild>
              <Link to="/app/notas-fiscais">
                <Receipt className="h-4 w-4" aria-hidden="true" />
                Notas fiscais
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
