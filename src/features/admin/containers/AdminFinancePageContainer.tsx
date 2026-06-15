import {
  AlertTriangle,
  BarChart3,
  Clock,
  CreditCard,
  Info,
  Layers3,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useTheme } from '@/features/theme/useTheme'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import {
  FINANCE_STATUS_LABEL,
  FINANCE_STATUS_OPTIONS,
  FINANCE_STATUS_TONE,
} from '../constants/finance-display'
import { useAdminFinancePage } from '../hooks/useAdminFinancePage'
import type {
  AdminFinancePlan,
  AdminFinanceStripeEvent,
  AdminFinanceSubscription,
  AdminFinanceSubscriptionPreview,
  AdminSubscriptionStatus,
  StripeEventFilters,
  SubscriptionFilters,
} from '../types/admin-finance.types'
import {
  formatCurrencyFromCents,
  formatDate,
  formatInterval,
  getSubscriptionAmount,
} from '../utils/admin-finance-format'

const ALL_VALUE = 'all'

export function AdminFinancePageContainer() {
  const {
    summary,
    plans,
    subscriptions,
    subscriptionsTotal,
    events,
    eventsTotal,
    isLoading,
    loadError,
    subscriptionFilters,
    setSubscriptionFilters,
    eventFilters,
    setEventFilters,
    subscriptionsTotalPages,
    eventsTotalPages,
    planOptions,
    load,
    setSubscriptionFilter,
    setEventFilter,
  } = useAdminFinancePage()

  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Administração"
        title="Gestão financeira"
        description="Acompanhe assinaturas, planos e receita recorrente do SaaS DentalFlow."
        actions={
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      <ListPageShell
        isLoading={isLoading}
        loadingMessage="Carregando financeiro SaaS..."
        error={loadError}
        onRetry={load}
        isEmpty={false}
      >
        {summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <HomeKpiCard
                label="Assinaturas ativas"
                value={String(summary.kpis.activeSubscriptions)}
                icon={CreditCard}
                tone="primary"
              />
              <HomeKpiCard
                label="Receita mensal"
                value={formatCurrencyFromCents(summary.kpis.estimatedMrr, summary.kpis.currency)}
                icon={TrendingUp}
                tone="success"
                description="Calculado no backend"
              />
              <HomeKpiCard
                label="Receita anual"
                value={formatCurrencyFromCents(summary.kpis.estimatedArr, summary.kpis.currency)}
                icon={BarChart3}
                tone="info"
                description="Calculado no backend"
              />
              <HomeKpiCard
                label="Em teste"
                value={String(summary.kpis.trialSubscriptions)}
                icon={Clock}
                tone="warning"
              />
              <HomeKpiCard
                label="Canceladas"
                value={String(summary.kpis.canceledSubscriptions)}
                icon={XCircle}
                tone="neutral"
              />
              <HomeKpiCard
                label="Pgtos. pendentes"
                value={String(summary.kpis.pastDueSubscriptions)}
                icon={AlertTriangle}
                tone="danger"
              />
              <HomeKpiCard
                label="Planos cadastrados"
                value={String(summary.kpis.totalPlans)}
                icon={Layers3}
                tone="neutral"
              />
              <HomeKpiCard
                label="Erros Stripe"
                value={String(summary.kpis.stripeEventsFailed)}
                icon={AlertTriangle}
                tone="warning"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <FinanceChart
                title="Receita por plano"
                description="MRR calculado no backend com base nos itens ativos sincronizados do Stripe."
                emptyTitle="Nenhum dado financeiro encontrado"
                emptyDescription="Os indicadores serão exibidos quando houver assinaturas ativas."
                data={summary.subscriptionsByPlan.map((item) => ({
                  label: item.planName,
                  value: item.estimatedMrr,
                }))}
                valueFormatter={(value) => formatCurrencyFromCents(value, summary.kpis.currency)}
                dataLabel="Receita"
              />

              <FinanceChart
                title="Distribuição por status"
                description="Quantidade de assinaturas por status cadastrado."
                emptyTitle="Nenhuma assinatura encontrada"
                emptyDescription="A distribuição será exibida quando houver assinaturas."
                data={summary.statusDistribution.map((item) => ({
                  label: FINANCE_STATUS_LABEL[item.status],
                  value: item.count,
                }))}
                valueFormatter={(value) => String(value)}
                dataLabel="Assinaturas"
              />
            </div>

            <PriceBreakdownSection
              rows={summary.revenueByPrice}
              defaultCurrency={summary.kpis.currency}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <RecentSubscriptionsSection
                title="Assinaturas recentes"
                description="Últimas assinaturas criadas na plataforma."
                subscriptions={summary.recentlyCreatedSubscriptions}
                emptyTitle="Nenhuma assinatura recente"
              />
              <RecentSubscriptionsSection
                title="Cancelamentos recentes"
                description="Assinaturas canceladas ou encerradas recentemente."
                subscriptions={summary.recentlyCanceledSubscriptions}
                emptyTitle="Nenhum cancelamento recente"
              />
            </div>

            <SubscriptionsSection
              subscriptions={subscriptions}
              total={subscriptionsTotal}
              totalPages={subscriptionsTotalPages}
              filters={subscriptionFilters}
              planOptions={planOptions}
              onFilterChange={setSubscriptionFilter}
              onPageChange={(page) => setSubscriptionFilters((current) => ({ ...current, page }))}
              onPageSizeChange={(limit) =>
                setSubscriptionFilters((current) => ({ ...current, page: 1, limit }))
              }
            />

            <PlansSection plans={plans} />

            <StripeEventsSection
              events={events}
              total={eventsTotal}
              totalPages={eventsTotalPages}
              filters={eventFilters}
              onFilterChange={setEventFilter}
              onPageChange={(page) => setEventFilters((current) => ({ ...current, page }))}
              onPageSizeChange={(limit) =>
                setEventFilters((current) => ({ ...current, page: 1, limit }))
              }
            />
          </div>
        )}
      </ListPageShell>
    </AppPage>
  )
}

type AdminChartTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
  isDark: boolean
  valueFormatter: (value: number) => string
  dataLabel: string
}

function AdminChartTooltip({
  active,
  payload,
  label,
  isDark,
  valueFormatter,
  dataLabel,
}: AdminChartTooltipProps) {
  if (!active || !payload?.length) return null

  const bgColor = isDark ? '#0f172a' : '#ffffff'
  const borderColor = isDark ? 'rgba(226,232,240,0.18)' : '#E2E8F0'
  const titleColor = isDark ? '#f8fafc' : '#0F172A'
  const labelColor = isDark ? '#cbd5e1' : '#64748B'
  const valueColor = isDark ? '#93C5FD' : '#2563EB'

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: '0 12px 24px rgb(15 23 42 / 0.12)',
        backgroundColor: bgColor,
        padding: '8px 12px',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <p style={{ marginBottom: 4, fontWeight: 600, color: titleColor }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
        <span style={{ color: labelColor }}>{dataLabel}</span>
        <span style={{ color: valueColor, fontWeight: 600 }}>
          {valueFormatter(Number(payload[0]?.value ?? 0))}
        </span>
      </div>
    </div>
  )
}

function FinanceChart({
  title,
  description,
  emptyTitle,
  emptyDescription,
  data,
  valueFormatter,
  dataLabel,
}: {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  data: Array<{ label: string; value: number }>
  valueFormatter: (value: number) => string
  dataLabel: string
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(226,232,240,0.12)' : '#E2E8F0'
  const tickColor = isDark ? '#cbd5e1' : '#64748B'
  const barColor = isDark ? '#60A5FA' : '#2563EB'

  const visibleData = data.filter((item) => item.value > 0)

  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="flex items-center gap-1.5 text-base font-semibold text-foreground">
          {title}
          {title.includes('Receita') && (
            <Info
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-label="MRR significa receita recorrente mensal. Os valores são calculados no backend a partir dos itens sincronizados do Stripe."
              role="img"
            >
              <title>
                MRR significa receita recorrente mensal. Os valores são calculados no backend a
                partir dos itens sincronizados do Stripe.
              </title>
            </Info>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {visibleData.length === 0 ? (
        <HomeEmptyState
          compact
          icon={BarChart3}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="h-72 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={288}>
            <BarChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: tickColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: tickColor, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
                width={80}
              />
              <Tooltip
                cursor={{ fill: isDark ? 'rgba(226,232,240,0.06)' : 'rgba(15,23,42,0.04)' }}
                content={
                  <AdminChartTooltip
                    isDark={isDark}
                    valueFormatter={valueFormatter}
                    dataLabel={dataLabel}
                  />
                }
              />
              <Bar dataKey="value" fill={barColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </PanelCard>
  )
}

function PriceBreakdownSection({
  rows,
  defaultCurrency,
}: {
  rows: Array<{
    stripePriceId: string
    priceNickname: string | null
    planName: string
    currency: string
    billingInterval: 'MONTHLY' | 'YEARLY' | null
    estimatedMrr: number
    estimatedArr: number
    subscriberCount: number
  }>
  defaultCurrency: string
}) {
  return (
    <HomeSection
      title="Receita por preço"
      description="Assinantes e receita recorrente agrupados por preço do Stripe."
    >
      {rows.length === 0 ? (
        <HomeEmptyState
          compact
          icon={Layers3}
          title="Nenhum dado financeiro encontrado"
          description="A receita por preço será exibida quando houver assinaturas ativas."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Preço Stripe</th>
                  <th className="px-4 py-3">Intervalo</th>
                  <th className="px-4 py-3 text-right">Assinantes</th>
                  <th className="px-4 py-3 text-right">MRR</th>
                  <th className="px-4 py-3 text-right">ARR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((row) => (
                  <tr key={`${row.stripePriceId}-${row.currency}`} className="hover:bg-muted/70">
                    <td className="px-4 py-3 font-semibold text-foreground">{row.planName}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{row.priceNickname ?? '-'}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{row.stripePriceId}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatInterval(row.billingInterval)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{row.subscriberCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrencyFromCents(row.estimatedMrr, row.currency || defaultCurrency)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrencyFromCents(row.estimatedArr, row.currency || defaultCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </HomeSection>
  )
}

function RecentSubscriptionsSection({
  title,
  description,
  subscriptions,
  emptyTitle,
}: {
  title: string
  description: string
  subscriptions: AdminFinanceSubscriptionPreview[]
  emptyTitle: string
}) {
  return (
    <PanelCard>
      <SectionHeader icon={ReceiptText} title={title} description={description} />
      {subscriptions.length === 0 ? (
        <HomeEmptyState
          compact
          icon={ReceiptText}
          title={emptyTitle}
          description="Nenhum dado financeiro encontrado."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Clínica</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Criada em</th>
                  <th className="px-4 py-3">Cancelada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{subscription.clinic.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {subscription.clinic.email ?? subscription.clinic.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{subscription.plan.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={FINANCE_STATUS_TONE[subscription.status]}>
                        {FINANCE_STATUS_LABEL[subscription.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(subscription.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(subscription.canceledAt ?? subscription.endedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PanelCard>
  )
}

function SubscriptionsSection({
  subscriptions,
  total,
  totalPages,
  filters,
  planOptions,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: {
  subscriptions: AdminFinanceSubscription[]
  total: number
  totalPages: number
  filters: SubscriptionFilters
  planOptions: Array<{ value: string; label: string }>
  onFilterChange: <K extends keyof SubscriptionFilters>(
    field: K,
    value: SubscriptionFilters[K],
  ) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (limit: number) => void
}) {
  return (
    <HomeSection
      title="Assinaturas"
      description="Clínicas com assinatura vinculada aos planos SaaS."
    >
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <FormField label="Buscar clínica" htmlFor="subscriptionSearch" className="md:col-span-2">
          <TextInput
            id="subscriptionSearch"
            placeholder="Nome da clínica..."
            value={filters.search ?? ''}
            onChange={(event) => onFilterChange('search', event.target.value)}
          />
        </FormField>
        <FormField label="Status" htmlFor="subscriptionStatus">
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(value) =>
              onFilterChange(
                'status',
                value === ALL_VALUE ? undefined : (value as AdminSubscriptionStatus),
              )
            }
          >
            <SelectTrigger id="subscriptionStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {FINANCE_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {FINANCE_STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Plano" htmlFor="subscriptionPlan">
          <Select
            value={filters.planId ?? ALL_VALUE}
            onValueChange={(value) =>
              onFilterChange('planId', value === ALL_VALUE ? undefined : value)
            }
          >
            <SelectTrigger id="subscriptionPlan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {planOptions.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Criada até" htmlFor="subscriptionTo">
          <DatePickerInput
            id="subscriptionTo"
            value={filters.to ?? ''}
            onValueChange={(value) => onFilterChange('to', value)}
          />
        </FormField>
      </div>

      {subscriptions.length === 0 ? (
        <HomeEmptyState
          compact
          icon={CreditCard}
          title="Nenhuma assinatura encontrada"
          description="As assinaturas das clínicas serão exibidas aqui quando existirem registros."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-245 text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Clínica</th>
                    <th className="px-4 py-3">Plano</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Intervalo</th>
                    <th className="px-4 py-3">Início</th>
                    <th className="px-4 py-3">Renovação</th>
                    <th className="px-4 py-3">Cancelada em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {subscriptions.map((subscription) => {
                    const amount = getSubscriptionAmount(subscription)

                    return (
                      <tr key={subscription.id} className="hover:bg-muted/70">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">
                            {subscription.clinic.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {subscription.clinic.email ?? subscription.clinic.id}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-foreground">{subscription.plan.name}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={FINANCE_STATUS_TONE[subscription.status]}>
                            {FINANCE_STATUS_LABEL[subscription.status]}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {formatCurrencyFromCents(amount.value, amount.currency)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatInterval(amount.interval)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(subscription.currentPeriodStart ?? subscription.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(subscription.currentPeriodEnd)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(subscription.canceledAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            filteredCount={total}
            pageSize={filters.limit}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </HomeSection>
  )
}

function PlansSection({ plans }: { plans: AdminFinancePlan[] }) {
  return (
    <HomeSection
      title="Planos"
      description="Planos SaaS disponíveis e volume de assinaturas vinculadas."
    >
      {plans.length === 0 ? (
        <HomeEmptyState
          compact
          icon={Layers3}
          title="Nenhum plano cadastrado"
          description="Os planos da plataforma serão exibidos aqui quando forem cadastrados."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3 text-right">Mensal</th>
                  <th className="px-4 py-3 text-right">Anual</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Assinaturas</th>
                  <th className="px-4 py-3 text-right">Ativas</th>
                  <th className="px-4 py-3 text-right">Em teste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{plan.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{plan.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrencyFromCents(plan.priceMonthly)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrencyFromCents(plan.priceYearly)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={plan.isActive ? 'success' : 'muted'}>
                        {plan.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {plan.subscriptionsCount}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {plan.activeSubscriptionsCount}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {plan.trialSubscriptionsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </HomeSection>
  )
}

function StripeEventsSection({
  events,
  total,
  totalPages,
  filters,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: {
  events: AdminFinanceStripeEvent[]
  total: number
  totalPages: number
  filters: StripeEventFilters
  onFilterChange: <K extends keyof StripeEventFilters>(
    field: K,
    value: StripeEventFilters[K],
  ) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (limit: number) => void
}) {
  return (
    <HomeSection
      title="Eventos Stripe"
      description="Saúde dos eventos recebidos do Stripe e processamento interno."
    >
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <FormField label="Tipo do evento" htmlFor="stripeEventType" className="md:col-span-2">
          <TextInput
            id="stripeEventType"
            placeholder="customer.subscription.updated..."
            value={filters.type ?? ''}
            onChange={(event) => onFilterChange('type', event.target.value)}
          />
        </FormField>
        <FormField label="Processamento" htmlFor="stripeEventProcessed">
          <Select
            value={filters.processed ?? ALL_VALUE}
            onValueChange={(value) =>
              onFilterChange(
                'processed',
                value === ALL_VALUE ? undefined : (value as 'true' | 'false'),
              )
            }
          >
            <SelectTrigger id="stripeEventProcessed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              <SelectItem value="true">Processado</SelectItem>
              <SelectItem value="false">Pendente/erro</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Recebido até" htmlFor="stripeEventTo">
          <DatePickerInput
            id="stripeEventTo"
            value={filters.to ?? ''}
            onValueChange={(value) => onFilterChange('to', value)}
          />
        </FormField>
      </div>

      {events.length === 0 ? (
        <HomeEmptyState
          compact
          icon={ReceiptText}
          title="Ainda não há eventos do Stripe processados"
          description="Quando webhooks forem recebidos, os eventos aparecerão nesta tabela."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-205 text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Recebido em</th>
                    <th className="px-4 py-3">Processado em</th>
                    <th className="px-4 py-3">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/70">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{event.type}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{event.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={event.processed ? 'success' : 'warning'}>
                          {event.processed ? 'Processado' : 'Pendente'}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(event.receivedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(event.processedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {event.errorMessage ? (
                          <span className="inline-flex items-center gap-1.5 text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {event.errorMessage}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            filteredCount={total}
            pageSize={filters.limit}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </HomeSection>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Icon className="h-5 w-5 text-primary" />
    </div>
  )
}
