import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Package,
  Users2,
} from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppointmentDrawer } from '@/features/scheduling/components/appointments/AppointmentDrawer'
import { AppointmentStatusBadge } from '@/features/scheduling/components/appointments/AppointmentStatusBadge'
import type { Appointment } from '@/features/scheduling/types/scheduling.types'
import {
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatWallTime,
} from '@/features/scheduling/utils/time'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { useDashboardPage } from '../hooks/useDashboardPage'
import { ProductivityCenter } from './ProductivityCenter'

// ── Currency helper ───────────────────────────────────────────────────────────

const brlCents = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100)

// ── Section link helper ───────────────────────────────────────────────────────

function SectionLink({ to, label }: { to: string; label: string }) {
  return (
    <Button variant="outline" size="sm" className="shrink-0" asChild>
      <Link to={to as never}>{label}</Link>
    </Button>
  )
}

// ── DashboardPageContainer ────────────────────────────────────────────────────

export function DashboardPageContainer() {
  const { user } = useAuth()

  if (user?.role === 'OWNER') {
    return <ProductivityCenter />
  }

  return <AssistantDashboard />
}

// ── AssistantDashboard ────────────────────────────────────────────────────────

function AssistantDashboard() {
  const {
    today,
    appointments,
    statusCounts,
    upcomingAppointments,
    isLoading,
    error,
    drawerAppointment,
    setDrawerAppointment,
  } = useDashboardPage()

  // PENDING appointments, sorted by time, capped at 8
  const pendingConfirmations = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'PENDING')
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
        .slice(0, 8),
    [appointments],
  )

  // Appointments with outstanding payment (not canceled), capped at 5
  const pendingPayments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            (a.paymentStatus === 'PAYMENT_PENDING' || a.paymentStatus === 'PARTIALLY_PAID') &&
            (a.status === 'CONFIRMED' || a.status === 'COMPLETED'),
        )
        .slice(0, 5),
    [appointments],
  )

  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Operação"
        title="Central de atendimento"
        description={formatAppointmentDateLong(today)}
        badge={
          statusCounts.pending > 0 ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {statusCounts.pending} a confirmar
            </span>
          ) : undefined
        }
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando dados do dia..." />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <HomeKpiCard
              label="Consultas hoje"
              value={String(statusCounts.total)}
              icon={CalendarDays}
              tone="primary"
            />
            <HomeKpiCard
              label="A confirmar"
              value={String(statusCounts.pending)}
              icon={Clock}
              tone={statusCounts.pending > 0 ? 'warning' : 'neutral'}
            />
            <HomeKpiCard
              label="Confirmadas"
              value={String(statusCounts.confirmed)}
              icon={CheckCircle2}
              tone={statusCounts.confirmed > 0 ? 'success' : 'neutral'}
            />
          </div>

          {/* Pending confirmations — primary operational focus */}
          <ConfirmationsSection
            appointments={pendingConfirmations}
            onAppointmentClick={setDrawerAppointment}
          />

          {/* Today schedule + Pending payments */}
          <div className="grid gap-5 lg:grid-cols-2">
            <TodayScheduleSection
              appointments={upcomingAppointments}
              onAppointmentClick={setDrawerAppointment}
            />
            <PendingPaymentsSection appointments={pendingPayments} />
          </div>

          {/* Quick access — valid ASSISTANT routes only */}
          <HomeActionGrid columns={4}>
            <HomeQuickActionCard
              title="Agendamentos"
              icon={CalendarDays}
              to="/app/agendamentos"
            />
            <HomeQuickActionCard
              title="Pacientes"
              icon={Users2}
              to="/app/pacientes"
            />
            <HomeQuickActionCard
              title="Pacientes em atenção"
              icon={AlertCircle}
              to="/app/pacientes/atencao"
            />
            <HomeQuickActionCard
              title="Estoque"
              icon={Package}
              to="/app/estoque"
            />
          </HomeActionGrid>
        </>
      )}

      {/* Read-only drawer — full mutations available at /app/agendamentos */}
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

// ── Section components ────────────────────────────────────────────────────────

function ConfirmationsSection({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[]
  onAppointmentClick: (a: Appointment) => void
}) {
  return (
    <HomeSection
      title="A confirmar"
      description={
        appointments.length > 0
          ? `${appointments.length} consulta${appointments.length !== 1 ? 's' : ''} aguardando confirmação`
          : 'Todas as consultas do dia estão confirmadas ou concluídas'
      }
      action={<SectionLink to="/app/agendamentos" label="Gerenciar" />}
    >
      {appointments.length === 0 ? (
        <HomeEmptyState
          compact
          icon={CheckCircle2}
          title="Nenhuma confirmação pendente."
          description="As consultas do dia estão sob controle."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((appt) => (
            <li key={appt.id}>
              <button
                type="button"
                className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded px-2 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                onClick={() => onAppointmentClick(appt)}
              >
                <span className="w-12 shrink-0 text-right">
                  <span className="block text-sm font-bold tabular-nums text-foreground">
                    {formatWallTime(appt.startTime)}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {appt.patientName}
                  </span>
                  {appt.service && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {appt.service.name}
                    </span>
                  )}
                  {appt.patientPhone && (
                    <span className="block text-xs text-muted-foreground">
                      {appt.patientPhone}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {appt.profile?.displayName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </HomeSection>
  )
}

function TodayScheduleSection({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[]
  onAppointmentClick: (a: Appointment) => void
}) {
  return (
    <HomeSection
      title="Agenda do dia"
      description="Próximas consultas pendentes e confirmadas"
      action={<SectionLink to="/app/agendamentos" label="Ver agenda" />}
    >
      {appointments.length === 0 ? (
        <HomeEmptyState
          compact
          icon={CalendarDays}
          title="Nenhuma consulta pendente para hoje."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((appt) => (
            <li key={appt.id}>
              <button
                type="button"
                className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded px-2 py-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                onClick={() => onAppointmentClick(appt)}
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
  )
}

function PendingPaymentsSection({ appointments }: { appointments: Appointment[] }) {
  return (
    <HomeSection
      title="Pagamentos pendentes"
      description="Consultas com pagamento em aberto"
      // ASSISTANT cannot access /app/financeiro — link to agendamentos instead
      action={<SectionLink to="/app/agendamentos" label="Ver agendamentos" />}
    >
      {appointments.length === 0 ? (
        <HomeEmptyState
          compact
          icon={CheckCircle2}
          title="Nenhum pagamento pendente."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-foreground">
                  {appt.patientName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatAppointmentDate(appt.appointmentDate)}
                  {appt.profile?.displayName ? ` · ${appt.profile.displayName}` : ''}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                {appt.estimatedAmountCents != null && (
                  <span className="font-semibold text-foreground">
                    {brlCents(appt.estimatedAmountCents)}
                  </span>
                )}
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {appt.paymentStatus === 'PARTIALLY_PAID' ? 'Parcial' : 'Pendente'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </HomeSection>
  )
}
