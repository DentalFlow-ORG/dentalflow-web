import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Info,
  Layers3,
  RefreshCw,
  ReceiptText,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField, TextInput } from '@/components/common/FormField'
import { ListPageShell } from '@/components/common/ListPageShell'
import { MetricCard } from '@/components/common/MetricCard'
import { Pagination } from '@/components/common/Pagination'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  getAdminFinanceSummary,
  listAdminFinancePlans,
  listAdminFinanceStripeEvents,
  listAdminFinanceSubscriptions,
} from '../services/admin-finance.service'
import type {
  AdminFinancePlan,
  AdminFinanceStripeEvent,
  AdminFinanceSubscription,
  AdminFinanceSummary,
  AdminSubscriptionStatus,
  StripeEventFilters,
  SubscriptionFilters,
} from '../types/admin-finance.types'

const SUBSCRIPTION_PAGE_SIZE = 10
const EVENTS_PAGE_SIZE = 10
const ALL_VALUE = 'all'

const STATUS_LABEL: Record<AdminSubscriptionStatus, string> = {
  TRIALING: 'Trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Em atraso',
  CANCELED: 'Cancelada',
  UNPAID: 'Inadimplente',
  PAUSED: 'Pausada',
  INCOMPLETE: 'Incompleta',
}

const STATUS_TONE: Record<AdminSubscriptionStatus, 'success' | 'warning' | 'muted'> = {
  ACTIVE: 'success',
  TRIALING: 'warning',
  PAST_DUE: 'warning',
  UNPAID: 'warning',
  CANCELED: 'muted',
  PAUSED: 'muted',
  INCOMPLETE: 'muted',
}

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as AdminSubscriptionStatus[]

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function AdminFinancePage() {
  const { showAlert } = useGlobalAlerts()
  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null)
  const [plans, setPlans] = useState<AdminFinancePlan[]>([])
  const [subscriptions, setSubscriptions] = useState<AdminFinanceSubscription[]>([])
  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0)
  const [events, setEvents] = useState<AdminFinanceStripeEvent[]>([])
  const [eventsTotal, setEventsTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subscriptionFilters, setSubscriptionFilters] = useState<SubscriptionFilters>({
    page: 1,
    limit: SUBSCRIPTION_PAGE_SIZE,
  })
  const [eventFilters, setEventFilters] = useState<StripeEventFilters>({
    page: 1,
    limit: EVENTS_PAGE_SIZE,
  })

  const subscriptionsTotalPages = Math.max(
    1,
    Math.ceil(subscriptionsTotal / subscriptionFilters.limit),
  )
  const eventsTotalPages = Math.max(1, Math.ceil(eventsTotal / eventFilters.limit))
  const planOptions = useMemo(
    () => plans.map((plan) => ({ value: plan.id, label: plan.name })),
    [plans],
  )

  function load() {
    setIsLoading(true)
    setLoadError(null)

    Promise.all([
      getAdminFinanceSummary(),
      listAdminFinancePlans(),
      listAdminFinanceSubscriptions(subscriptionFilters),
      listAdminFinanceStripeEvents(eventFilters),
    ])
      .then(([summaryResponse, plansResponse, subscriptionsResponse, eventsResponse]) => {
        setSummary(summaryResponse)
        setPlans(plansResponse)
        setSubscriptions(subscriptionsResponse.data)
        setSubscriptionsTotal(subscriptionsResponse.total)
        setEvents(eventsResponse.data)
        setEventsTotal(eventsResponse.total)
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Nao foi possivel carregar o financeiro SaaS.'
        setLoadError(message)
        showAlert({
          title: 'Erro ao carregar financeiro SaaS',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      getAdminFinanceSummary(),
      listAdminFinancePlans(),
      listAdminFinanceSubscriptions(subscriptionFilters),
      listAdminFinanceStripeEvents(eventFilters),
    ])
      .then(([summaryResponse, plansResponse, subscriptionsResponse, eventsResponse]) => {
        if (!isMounted) return
        setSummary(summaryResponse)
        setPlans(plansResponse)
        setSubscriptions(subscriptionsResponse.data)
        setSubscriptionsTotal(subscriptionsResponse.total)
        setEvents(eventsResponse.data)
        setEventsTotal(eventsResponse.total)
      })
      .catch((err) => {
        if (!isMounted) return
        const message =
          err instanceof Error ? err.message : 'Nao foi possivel carregar o financeiro SaaS.'
        setLoadError(message)
        showAlert({
          title: 'Erro ao carregar financeiro SaaS',
          description: message,
          tone: 'error',
        })
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) return
    listAdminFinanceSubscriptions(subscriptionFilters)
      .then((response) => {
        setSubscriptions(response.data)
        setSubscriptionsTotal(response.total)
      })
      .catch((err) => {
        showAlert({
          title: 'Erro ao carregar assinaturas',
          description: err instanceof Error ? err.message : 'Nao foi possivel carregar assinaturas.',
          tone: 'error',
        })
      })
  }, [subscriptionFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading) return
    listAdminFinanceStripeEvents(eventFilters)
      .then((response) => {
        setEvents(response.data)
        setEventsTotal(response.total)
      })
      .catch((err) => {
        showAlert({
          title: 'Erro ao carregar eventos Stripe',
          description:
            err instanceof Error ? err.message : 'Nao foi possivel carregar eventos Stripe.',
          tone: 'error',
        })
      })
  }, [eventFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  function setSubscriptionFilter<K extends keyof SubscriptionFilters>(
    field: K,
    value: SubscriptionFilters[K],
  ) {
    setSubscriptionFilters((current) => ({ ...current, page: 1, [field]: value || undefined }))
  }

  function setEventFilter<K extends keyof StripeEventFilters>(
    field: K,
    value: StripeEventFilters[K],
  ) {
    setEventFilters((current) => ({ ...current, page: 1, [field]: value || undefined }))
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Administracao"
        title="Financeiro da plataforma"
        description="Acompanhe assinaturas, planos e receita recorrente estimada do DentalFlow."
        action={
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
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard value={String(summary.kpis.totalPlans)} label="Planos cadastrados" />
              <MetricCard
                value={String(summary.kpis.activeSubscriptions)}
                label="Assinaturas ativas"
              />
              <ExplainedMetricCard
                value={formatCurrencyFromCents(summary.kpis.estimatedMrr)}
                label="MRR estimado"
                explanation="MRR e a receita recorrente mensal estimada com base nas assinaturas ativas e em trial."
              />
              <ExplainedMetricCard
                value={formatCurrencyFromCents(summary.kpis.estimatedArr)}
                label="ARR estimado"
                explanation="ARR e a receita recorrente anual estimada. Nesta versao, e calculado como MRR multiplicado por 12."
              />
              <MetricCard
                value={String(summary.kpis.trialSubscriptions)}
                label="Assinaturas em trial"
              />
              <MetricCard
                value={String(summary.kpis.canceledSubscriptions)}
                label="Assinaturas canceladas"
              />
              <MetricCard
                value={String(summary.kpis.pastDueSubscriptions)}
                label="Pendentes ou em atraso"
              />
              <MetricCard
                value={String(summary.kpis.stripeEventsProcessed)}
                label="Eventos Stripe processados"
              />
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <FinanceChart
                title="Receita estimada por plano"
                description="MRR calculado com base no preco mensal dos planos ativos/trial."
                emptyTitle="Sem receita recorrente estimada"
                emptyDescription="Os indicadores serao exibidos quando houver assinaturas ativas."
                data={summary.subscriptionsByPlan.map((item) => ({
                  label: item.planName,
                  value: item.estimatedMrr,
                }))}
                valueFormatter={formatCurrencyFromCents}
              />

              <FinanceChart
                title="Distribuicao por status"
                description="Quantidade de assinaturas por status cadastrado."
                emptyTitle="Nenhuma assinatura encontrada"
                emptyDescription="A distribuicao sera exibida quando houver assinaturas."
                data={summary.statusDistribution.map((item) => ({
                  label: STATUS_LABEL[item.status],
                  value: item.count,
                }))}
                valueFormatter={(value) => String(value)}
              />
            </div>

            <SubscriptionsSection
              subscriptions={subscriptions}
              total={subscriptionsTotal}
              totalPages={subscriptionsTotalPages}
              filters={subscriptionFilters}
              planOptions={planOptions}
              onFilterChange={setSubscriptionFilter}
              onPageChange={(page) =>
                setSubscriptionFilters((current) => ({ ...current, page }))
              }
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

function ExplainedMetricCard({
  value,
  label,
  explanation,
}: {
  value: string
  label: string
  explanation: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/85 p-5 shadow-sm">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm leading-6 text-slate-500">
        {label}
        <Info
          className="h-3.5 w-3.5 text-slate-400"
          aria-label={explanation}
          role="img"
        >
          <title>{explanation}</title>
        </Info>
      </p>
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
}: {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  data: Array<{ label: string; value: number }>
  valueFormatter: (value: number) => string
}) {
  const visibleData = data.filter((item) => item.value > 0)

  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="flex items-center gap-1.5 text-base font-semibold text-slate-950">
          {title}
          {title.includes('Receita') && (
            <Info
              className="h-3.5 w-3.5 text-slate-400"
              aria-label="MRR significa receita recorrente mensal. Os valores sao estimativas porque o modelo atual nao registra o intervalo real de cobranca da assinatura."
              role="img"
            >
              <title>
                MRR significa receita recorrente mensal. Os valores sao estimativas porque o modelo atual nao registra o intervalo real de cobranca da assinatura.
              </title>
            </Info>
          )}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {visibleData.length === 0 ? (
        <EmptyState icon={BarChart3} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
                width={80}
              />
              <Tooltip formatter={(value) => valueFormatter(Number(value))} />
              <Bar dataKey="value" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
    <PanelCard>
      <SectionHeader
        icon={CreditCard}
        title="Assinaturas"
        description="Clinicas com assinatura vinculada aos planos SaaS."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <FormField label="Buscar clinica" htmlFor="subscriptionSearch" className="md:col-span-2">
          <TextInput
            id="subscriptionSearch"
            placeholder="Nome da clinica..."
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
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABEL[status]}
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
        <FormField label="Criada ate" htmlFor="subscriptionTo">
          <DatePickerInput
            id="subscriptionTo"
            value={filters.to ?? ''}
            onValueChange={(value) => onFilterChange('to', value)}
          />
        </FormField>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhuma assinatura encontrada"
          description="As assinaturas das clinicas serao exibidas aqui quando existirem registros."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Clinica</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Valor mensal</th>
                  <th className="px-4 py-3">Intervalo</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">Renovacao</th>
                  <th className="px-4 py-3">Cancelada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{subscription.clinic.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {subscription.clinic.email ?? subscription.clinic.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{subscription.plan.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={STATUS_TONE[subscription.status]}>
                        {STATUS_LABEL[subscription.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrencyFromCents(subscription.plan.priceMonthly)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">Mensal estimado</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(subscription.currentPeriodStart ?? subscription.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(subscription.canceledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              filteredCount={total}
              pageSize={filters.limit}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </div>
      )}
    </PanelCard>
  )
}

function PlansSection({ plans }: { plans: AdminFinancePlan[] }) {
  return (
    <PanelCard>
      <SectionHeader
        icon={Layers3}
        title="Planos"
        description="Planos SaaS disponiveis e volume de assinaturas vinculadas."
      />
      {plans.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="Nenhum plano cadastrado"
          description="Os planos da plataforma serao exibidos aqui quando forem cadastrados."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3 text-right">Mensal</th>
                  <th className="px-4 py-3 text-right">Anual</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Assinaturas</th>
                  <th className="px-4 py-3 text-right">Ativas/trial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{plan.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{plan.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrencyFromCents(plan.priceMonthly)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatCurrencyFromCents(plan.priceYearly)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={plan.isActive ? 'success' : 'muted'}>
                        {plan.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {plan.subscriptionsCount}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {plan.activeSubscriptionsCount}
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
    <PanelCard>
      <SectionHeader
        icon={ReceiptText}
        title="Eventos Stripe"
        description="Saude dos eventos recebidos do Stripe e processamento interno."
      />
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
              onFilterChange('processed', value === ALL_VALUE ? undefined : (value as 'true' | 'false'))
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
        <FormField label="Recebido ate" htmlFor="stripeEventTo">
          <DatePickerInput
            id="stripeEventTo"
            value={filters.to ?? ''}
            onValueChange={(value) => onFilterChange('to', value)}
          />
        </FormField>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Ainda nao ha eventos do Stripe processados"
          description="Quando webhooks forem recebidos, os eventos aparecerao nesta tabela."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recebido em</th>
                  <th className="px-4 py-3">Processado em</th>
                  <th className="px-4 py-3">Erro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{event.type}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{event.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={event.processed ? 'success' : 'warning'}>
                        {event.processed ? 'Processado' : 'Pendente'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(event.receivedAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(event.processedAt)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.errorMessage ? (
                        <span className="inline-flex items-center gap-1.5 text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {event.errorMessage}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              filteredCount={total}
              pageSize={filters.limit}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </div>
      )}
    </PanelCard>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Icon className="h-5 w-5 text-primary" />
    </div>
  )
}
