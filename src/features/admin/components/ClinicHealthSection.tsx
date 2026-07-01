import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  FileWarning,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { ListPageShell } from '@/components/common/ListPageShell'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { HomeSection } from '@/features/home/components/HomeSection'
import { safeFormatDateBR } from '@/lib/date-time-formatters'

import { FINANCE_STATUS_LABEL, FINANCE_STATUS_TONE } from '../constants/finance-display'
import type { ClinicHealthRow } from '../types/admin.types'
import { computeClinicHealthFlags, getTrialDaysRemaining } from '../utils/clinic-health'

type ClinicHealthSectionProps = {
  rows: ClinicHealthRow[]
  isLoading: boolean
  loadError: string | null
  onRetry: () => void
}

const LAST_ACTIVITY_SOURCE_LABEL: Record<'USER_LOGIN' | 'AUDIT_LOG', string> = {
  USER_LOGIN: 'login',
  AUDIT_LOG: 'atividade registrada',
}

function ClinicHealthFlagBadges({ row }: { row: ClinicHealthRow }) {
  const flags = computeClinicHealthFlags(row)
  const items: Array<{ key: string; label: string; icon: typeof CreditCard }> = []

  if (flags.paymentIssue) {
    items.push({ key: 'payment', label: 'Pagamento em atraso', icon: CreditCard })
  }
  if (flags.trialEndingSoon) {
    items.push({ key: 'trial', label: 'Trial acabando', icon: CalendarClock })
  }
  if (flags.noDentists) {
    items.push({ key: 'no-dentists', label: 'Sem dentistas', icon: Stethoscope })
  }
  if (flags.noRecentAppointments) {
    items.push({ key: 'no-appts', label: 'Sem consultas recentes', icon: AlertTriangle })
  }
  if (flags.noRecentActivity) {
    items.push({ key: 'no-activity', label: 'Sem atividade recente', icon: ShieldAlert })
  }
  if (flags.incompleteFiscalSetup) {
    items.push({ key: 'fiscal', label: 'Configuração fiscal incompleta', icon: FileWarning })
  }

  if (items.length === 0) {
    return <StatusBadge tone="success">Sem sinais de risco</StatusBadge>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ key, label, icon: Icon }) => (
        <StatusBadge key={key} tone="warning" className="gap-1">
          <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {label}
        </StatusBadge>
      ))}
    </div>
  )
}

function LastActivityCell({ row }: { row: ClinicHealthRow }) {
  if (!row.lastActivity.timestamp || !row.lastActivity.source) {
    return <span className="text-muted-foreground">Sem atividade registrada</span>
  }
  return (
    <span>
      {safeFormatDateBR(row.lastActivity.timestamp)}
      <span className="text-muted-foreground">
        {' · '}
        {LAST_ACTIVITY_SOURCE_LABEL[row.lastActivity.source]}
      </span>
    </span>
  )
}

function SubscriptionCell({ row }: { row: ClinicHealthRow }) {
  const { subscription } = row
  if (!subscription || !subscription.status) {
    return <span className="text-muted-foreground">Sem assinatura</span>
  }

  const trialDaysRemaining = getTrialDaysRemaining(subscription.trialEndsAt)

  return (
    <div className="space-y-1">
      <StatusBadge tone={FINANCE_STATUS_TONE[subscription.status]}>
        {FINANCE_STATUS_LABEL[subscription.status]}
      </StatusBadge>
      <p className="text-xs text-muted-foreground">
        {subscription.planName ?? 'Plano não informado'}
      </p>
      {subscription.status === 'TRIALING' && trialDaysRemaining != null && (
        <p className="text-xs text-muted-foreground">
          {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'} de
          trial
        </p>
      )}
    </div>
  )
}

function ClinicHealthMobileCard({ row }: { row: ClinicHealthRow }) {
  return (
    <PanelCard className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="truncate text-sm font-semibold text-foreground">{row.clinic.name}</h3>
          <SubscriptionCell row={row} />
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <dt className="font-medium">Dentistas</dt>
            <dd className="text-foreground">{row.counts.dentists}</dd>
          </div>
          <div>
            <dt className="font-medium">Usuários ativos</dt>
            <dd className="text-foreground">{row.counts.activeUsers}</dd>
          </div>
          <div>
            <dt className="font-medium">Consultas (30d)</dt>
            <dd className="text-foreground">{row.counts.recentAppointments}</dd>
          </div>
          <div>
            <dt className="font-medium">Última atividade</dt>
            <dd className="text-foreground">
              <LastActivityCell row={row} />
            </dd>
          </div>
        </dl>

        <ClinicHealthFlagBadges row={row} />
      </div>
    </PanelCard>
  )
}

/**
 * ADMIN-only clinic health summary — subscription, usage counts, activity,
 * and support-relevant risk flags per clinic. Renders no patient, clinical
 * record, or appointment-detail data; counts only.
 */
export function ClinicHealthSection({
  rows,
  isLoading,
  loadError,
  onRetry,
}: ClinicHealthSectionProps) {
  return (
    <HomeSection
      title="Saúde das clínicas"
      description="Assinatura, uso e sinais de risco por clínica, para suporte proativo."
    >
      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando saúde das clínicas..."
        error={loadError}
        onRetry={onRetry}
        isEmpty={rows.length === 0}
        emptyState={
          <EmptyState
            icon={ShieldAlert}
            title="Nenhum dado de saúde disponível"
            description="Ainda não há clínicas cadastradas para exibir sinais de saúde."
          />
        }
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="space-y-3 p-3 md:hidden">
            {rows.map((row) => (
              <ClinicHealthMobileCard key={row.clinic.id} row={row} />
            ))}
          </div>

          <div className="hidden md:block">
            <table className="w-full text-sm" aria-label="Saúde das clínicas">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3">
                    Clínica
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assinatura
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Dentistas
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Usuários ativos
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Consultas (30d)
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Última atividade
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Sinais
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.clinic.id}>
                    <td className="px-4 py-3 font-semibold text-foreground">{row.clinic.name}</td>
                    <td className="px-4 py-3">
                      <SubscriptionCell row={row} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {row.counts.dentists}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {row.counts.activeUsers}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {row.counts.recentAppointments}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <LastActivityCell row={row} />
                    </td>
                    <td className="px-4 py-3">
                      <ClinicHealthFlagBadges row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ListPageShell>
    </HomeSection>
  )
}
