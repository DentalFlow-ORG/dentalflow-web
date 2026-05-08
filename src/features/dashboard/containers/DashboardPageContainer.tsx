import { Link } from '@tanstack/react-router'
import { Calendar, ClipboardList, DollarSign, Users } from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { formatWallTime } from '@/features/scheduling/utils/time'

import { useDashboardPage } from '../hooks/useDashboardPage'

const brl = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

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
  const {
    user,
    today,
    statusCounts,
    upcomingAppointments,
    activeDentists,
    financeTodaySummary,
    isLoading,
    error,
    drawerAppointment,
    setDrawerAppointment,
  } = useDashboardPage()

  const isOwner = user?.role === 'OWNER'

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
          {/* Status stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard value={String(statusCounts.total)} label="consultas hoje" />
            <MetricCard value={String(statusCounts.confirmed)} label="confirmadas" />
            <MetricCard value={String(statusCounts.pending)} label="aguardando confirmação" />
            <MetricCard value={String(statusCounts.completed)} label="concluídas" />
            <MetricCard
              value={String(statusCounts.canceledOrNoShow)}
              label="canceladas / não compareceu"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Upcoming appointments */}
            <PanelCard>
              <h2 className="text-base font-semibold text-slate-950">Próximas consultas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Agendamentos pendentes ou confirmados do dia
              </p>
              {upcomingAppointments.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Nenhuma consulta pendente para hoje.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {upcomingAppointments.map((appt) => (
                    <li
                      key={appt.id}
                      className="-mx-2 flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-3 text-sm hover:bg-slate-50"
                      onClick={() => setDrawerAppointment(appt)}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{appt.patientName}</p>
                        {appt.service && (
                          <p className="truncate text-slate-500">{appt.service.name}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium text-slate-700">
                          {formatWallTime(appt.startTime)}
                        </p>
                        <p className="text-slate-400">{appt.profile.displayName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>

            {/* Alerts */}
            <PanelCard>
              <h2 className="text-base font-semibold text-slate-950">Alertas do dia</h2>
              <div className="mt-4 space-y-4">
                {statusCounts.pending > 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      {statusCounts.pending}{' '}
                      {statusCounts.pending === 1
                        ? 'consulta aguarda confirmação'
                        : 'consultas aguardam confirmação'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link to="/app/agendamentos">Ver agendamentos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">
                      Todas as consultas estão confirmadas ou concluídas.
                    </p>
                  </div>
                )}

                {activeDentists.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Profissionais com agenda hoje
                    </p>
                    <ul className="space-y-1">
                      {activeDentists.map((name) => (
                        <li key={name} className="text-sm text-slate-700">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PanelCard>
          </div>

          {/* Financial summary — OWNER only */}
          {isOwner && financeTodaySummary && (
            <PanelCard>
              <h2 className="text-base font-semibold text-slate-950">Resumo financeiro de hoje</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <MetricCard
                  value={brl(financeTodaySummary.received)}
                  label="recebido hoje"
                />
                <MetricCard
                  value={brl(financeTodaySummary.pendingReceivables)}
                  label="a receber"
                />
                <MetricCard
                  value={brl(financeTodaySummary.expectedTotal)}
                  label="total esperado"
                />
              </div>
            </PanelCard>
          )}

          {/* Quick shortcuts */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/app/agendamentos">
                <Calendar className="h-4 w-4" />
                Agendamentos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/pacientes">
                <Users className="h-4 w-4" />
                Pacientes
              </Link>
            </Button>
            {isOwner && (
              <Button variant="outline" asChild>
                <Link to="/app/prontuario">
                  <ClipboardList className="h-4 w-4" />
                  Prontuários
                </Link>
              </Button>
            )}
            {isOwner && (
              <Button variant="outline" asChild>
                <Link to="/app/financeiro">
                  <DollarSign className="h-4 w-4" />
                  Financeiro
                </Link>
              </Button>
            )}
          </div>
        </>
      )}

      {/* Appointment detail drawer — readOnly, no status actions */}
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
