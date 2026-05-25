import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Landmark,
  Package,
  Users2,
} from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AppointmentStatusBadge } from '@/features/scheduling/components/appointments/AppointmentStatusBadge'
import type { AppointmentStatus } from '@/features/scheduling/types/scheduling.types'
import {
  formatAppointmentDate,
  formatWallTime,
} from '@/features/scheduling/utils/time'

import { TodayAppointmentsChart } from '../components/TodayAppointmentsChart'
import { useProductivitySummary } from '../hooks/useProductivitySummary'
import type {
  CriticalProduct,
  PatientWithoutReturn,
  PendingPaymentAppointment,
  ProductivityAction,
  ProductivityAppointmentSummary,
  RecentCanceledAppointment,
} from '../types/productivity.types'

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const brlCents = (v: number) => brl(v / 100)

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Small helper components ────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const cls: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    MEDIUM:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  }
  const labels: Record<string, string> = {
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
  }
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-semibold',
        cls[priority] ?? cls.LOW,
      )}
    >
      {labels[priority] ?? priority}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    PAYMENT_PENDING: {
      label: 'Pagamento pendente',
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    PARTIALLY_PAID: {
      label: 'Parcialmente pago',
      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
  }
  const c = config[status]
  if (!c) return null
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', c.cls)}
    >
      {c.label}
    </span>
  )
}

function StockStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    LOW: {
      label: 'Estoque baixo',
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    EMPTY: {
      label: 'Sem estoque',
      cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    EXPIRING: {
      label: 'Vence em breve',
      cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    },
    EXPIRED: {
      label: 'Vencido',
      cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
  }
  const c = config[status] ?? {
    label: status,
    cls: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', c.cls)}
    >
      {c.label}
    </span>
  )
}

function SectionHeader({
  title,
  description,
  linkTo,
  linkLabel,
}: {
  title: string
  description?: string
  linkTo: string
  linkLabel: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <Link to={linkTo as never}>{linkLabel}</Link>
      </Button>
    </div>
  )
}

function EmptySlot({
  icon: Icon,
  message,
}: {
  icon: React.ElementType
  message: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Icon
        className="h-8 w-8 text-muted-foreground/40"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ── Section panels ─────────────────────────────────────────────────────────────

function RecommendedActionsPanel({ actions }: { actions: ProductivityAction[] }) {
  const actionIcon: Record<string, React.ElementType> = {
    TODAY_SCHEDULE: CalendarDays,
    PENDING_PAYMENT: DollarSign,
    LOW_STOCK: Package,
    EXPIRING_STOCK: AlertTriangle,
    PATIENT_FOLLOW_UP: Users2,
  }

  return (
    <PanelCard>
      <h2 className="text-base font-semibold text-foreground">
        Ações recomendadas
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = actionIcon[action.type] ?? AlertTriangle
          return (
            <Link
              key={action.type}
              to={action.href as never}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
                  <PriorityBadge priority={action.priority} />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ChevronRight
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </PanelCard>
  )
}

function TodaySchedulePanel({
  appointments,
  total,
  confirmed,
  pending,
}: {
  appointments: ProductivityAppointmentSummary[]
  total: number
  confirmed: number
  pending: number
}) {
  const subtitle =
    total === 0
      ? 'Nenhuma consulta agendada para hoje'
      : `${total} consultas · ${confirmed} confirmadas · ${pending} aguardando`

  return (
    <PanelCard>
      <SectionHeader
        title="Agenda de hoje"
        description={subtitle}
        linkTo="/app/agendamentos"
        linkLabel="Ver agenda"
      />
      {appointments.length === 0 ? (
        <EmptySlot
          icon={Calendar}
          message="Nenhuma consulta pendente para hoje."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {appt.patientName}
                </p>
                {appt.serviceName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {appt.serviceName}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AppointmentStatusBadge
                  status={appt.status as AppointmentStatus}
                />
                <span className="text-sm font-medium text-foreground">
                  {formatWallTime(appt.startTime)}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {appt.profileName}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  )
}

function PendingPaymentsPanel({
  appointments,
  totalCents,
}: {
  appointments: PendingPaymentAppointment[]
  totalCents: number
}) {
  const subtitle =
    totalCents > 0
      ? `Total pendente: ${brlCents(totalCents)}`
      : 'Consultas concluídas sem pagamento registrado'

  return (
    <PanelCard>
      <SectionHeader
        title="Pagamentos pendentes"
        description={appointments.length > 0 ? subtitle : undefined}
        linkTo="/app/financeiro"
        linkLabel="Ver financeiro"
      />
      {appointments.length === 0 ? (
        <EmptySlot
          icon={CheckCircle2}
          message="Nenhum pagamento pendente."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {appt.patientName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAppointmentDate(appt.appointmentDate)}
                  {appt.profileName ? ` · ${appt.profileName}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {appt.estimatedAmountCents != null && (
                  <span className="font-semibold text-foreground">
                    {brlCents(appt.estimatedAmountCents)}
                  </span>
                )}
                <PaymentStatusBadge status={appt.paymentStatus} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  )
}

function FinanceMonthPanel({
  monthIncome,
  monthExpenses,
  monthNet,
  pendingReceivables,
}: {
  monthIncome: number
  monthExpenses: number
  monthNet: number
  pendingReceivables: number
}) {
  return (
    <PanelCard>
      <SectionHeader
        title="Financeiro do mês"
        description="Receitas e despesas do mês corrente"
        linkTo="/app/financeiro"
        linkLabel="Abrir financeiro"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard value={brl(monthIncome)} label="receita recebida" tone="success" />
        <MetricCard value={brl(monthExpenses)} label="despesas pagas" tone="neutral" />
        <MetricCard
          value={brl(monthNet)}
          label="resultado líquido"
          tone={monthNet >= 0 ? 'success' : 'danger'}
        />
        <MetricCard
          value={brl(pendingReceivables)}
          label="a receber"
          tone={pendingReceivables > 0 ? 'warning' : 'neutral'}
        />
      </div>
    </PanelCard>
  )
}

function PatientsFollowUpPanel({
  count,
  examples,
}: {
  count: number
  examples: PatientWithoutReturn[]
}) {
  return (
    <PanelCard>
      <SectionHeader
        title="Pacientes para retorno"
        description={
          count > 0
            ? `${count} paciente${count === 1 ? '' : 's'} sem consulta há mais de 60 dias`
            : 'Todos os pacientes estão com consultas recentes'
        }
        linkTo="/app/pacientes"
        linkLabel="Ver pacientes"
      />
      {examples.length === 0 ? (
        <EmptySlot icon={Users2} message="Nenhum paciente para retorno." />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {examples.map((p, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="min-w-0 truncate font-medium text-foreground">
                {p.patientName}
              </span>
              {p.lastVisit && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  Última visita: {formatAppointmentDate(p.lastVisit)}
                </span>
              )}
            </li>
          ))}
          {count > examples.length && (
            <li className="pt-3 text-center text-xs text-muted-foreground">
              +{count - examples.length} pacientes a mais
            </li>
          )}
        </ul>
      )}
    </PanelCard>
  )
}

function InventoryAlertPanel({
  lowStockCount,
  expiringSoonCount,
  products,
}: {
  lowStockCount: number
  expiringSoonCount: number
  products: CriticalProduct[]
}) {
  const parts: string[] = []
  if (lowStockCount > 0)
    parts.push(`${lowStockCount} com estoque baixo`)
  if (expiringSoonCount > 0)
    parts.push(`${expiringSoonCount} com vencimento próximo`)

  return (
    <PanelCard>
      <SectionHeader
        title="Estoque em atenção"
        description={
          parts.length > 0
            ? parts.join(' · ')
            : 'Todos os produtos estão com estoque adequado'
        }
        linkTo="/app/estoque"
        linkLabel="Ver estoque"
      />
      {products.length === 0 ? (
        <EmptySlot icon={Package} message="Nenhum produto crítico." />
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {product.name}
                </p>
                {product.categoryName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {product.categoryName}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StockStatusBadge status={product.status} />
                <span className="text-xs text-muted-foreground">
                  {product.currentQuantity} {product.unit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  )
}

function RecentCanceledPanel({
  appointments,
}: {
  appointments: RecentCanceledAppointment[]
}) {
  return (
    <PanelCard>
      <SectionHeader
        title="Cancelamentos recentes"
        description="Consultas canceladas nos últimos 7 dias"
        linkTo="/app/agendamentos"
        linkLabel="Ver agenda"
      />
      <ul className="mt-4 divide-y divide-border">
        {appointments.map((appt) => (
          <li
            key={appt.id}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {appt.patientName}
              </p>
              {appt.cancellationReason && (
                <p className="truncate text-xs text-muted-foreground">
                  {appt.cancellationReason}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {formatAppointmentDate(appt.appointmentDate)}
              </p>
              <p className="text-xs text-muted-foreground">{appt.profileName}</p>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────

export function ProductivityCenter() {
  const { data, isLoading, error } = useProductivitySummary()

  const stockAlerts = data
    ? data.inventory.lowStockCount + data.inventory.expiringSoonCount
    : 0

  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Dashboard"
        title="Central de Produtividade"
        description={`Acompanhe o que precisa de atenção na sua clínica — ${todayLabel()}`}
      />

      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando dados da clínica..." />
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              value={String(data.today.appointmentsTotal)}
              label="consultas hoje"
              tone="primary"
            />
            <MetricCard
              value={String(data.today.pendingPaymentsCount)}
              label="pagamentos pendentes"
              tone={data.today.pendingPaymentsCount > 0 ? 'warning' : 'neutral'}
            />
            <MetricCard
              value={brl(data.finance.monthIncome)}
              label="receita do mês"
              tone="success"
            />
            <MetricCard
              value={String(stockAlerts)}
              label="produtos em atenção"
              tone={stockAlerts > 0 ? 'danger' : 'neutral'}
            />
          </div>

          {/* Today appointments status chart */}
          <TodayAppointmentsChart today={data.today} />

          {/* Recommended actions */}
          {data.actions.length > 0 && (
            <RecommendedActionsPanel actions={data.actions} />
          )}

          {/* Today schedule + pending payments */}
          <div className="grid gap-5 lg:grid-cols-2">
            <TodaySchedulePanel
              appointments={data.upcomingToday}
              total={data.today.appointmentsTotal}
              confirmed={data.today.appointmentsConfirmed}
              pending={data.today.appointmentsPending}
            />
            <PendingPaymentsPanel
              appointments={data.pendingPaymentAppointments}
              totalCents={data.today.pendingPaymentsAmountCents}
            />
          </div>

          {/* Finance month breakdown */}
          <FinanceMonthPanel
            monthIncome={data.finance.monthIncome}
            monthExpenses={data.finance.monthExpenses}
            monthNet={data.finance.monthNet}
            pendingReceivables={data.finance.pendingReceivables}
          />

          {/* Patients follow-up + inventory */}
          <div className="grid gap-5 lg:grid-cols-2">
            <PatientsFollowUpPanel
              count={data.patients.withoutReturnCount}
              examples={data.patients.examples}
            />
            <InventoryAlertPanel
              lowStockCount={data.inventory.lowStockCount}
              expiringSoonCount={data.inventory.expiringSoonCount}
              products={data.inventory.criticalProducts}
            />
          </div>

          {/* Recent cancellations (conditional) */}
          {data.recentCanceled.length > 0 && (
            <RecentCanceledPanel appointments={data.recentCanceled} />
          )}

          {/* Finance link shortcut */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/agendamentos">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Agendamentos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/financeiro">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                Financeiro
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/pacientes">
                <Users2 className="h-4 w-4" aria-hidden="true" />
                Pacientes
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/estoque">
                <Package className="h-4 w-4" aria-hidden="true" />
                Estoque
              </Link>
            </Button>
          </div>
        </>
      ) : null}
    </AppPage>
  )
}
