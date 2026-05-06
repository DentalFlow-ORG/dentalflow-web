import { useEffect, useMemo, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

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
  StripeEventFilters,
  SubscriptionFilters,
} from '../types/admin-finance.types'

const SUBSCRIPTION_PAGE_SIZE = 10
const EVENTS_PAGE_SIZE = 10

export function useAdminFinancePage() {
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

  function applyInitialData([
    summaryResponse,
    plansResponse,
    subscriptionsResponse,
    eventsResponse,
  ]: Awaited<ReturnType<typeof loadAdminFinanceData>>) {
    setSummary(summaryResponse)
    setPlans(plansResponse)
    setSubscriptions(subscriptionsResponse.data)
    setSubscriptionsTotal(subscriptionsResponse.total)
    setEvents(eventsResponse.data)
    setEventsTotal(eventsResponse.total)
  }

  function handleLoadError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Nao foi possivel carregar o financeiro SaaS.'
    setLoadError(message)
    showAlert({
      title: 'Erro ao carregar financeiro SaaS',
      description: message,
      tone: 'error',
    })
  }

  function load() {
    setIsLoading(true)
    setLoadError(null)

    loadAdminFinanceData(subscriptionFilters, eventFilters)
      .then(applyInitialData)
      .catch(handleLoadError)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    let isMounted = true

    loadAdminFinanceData(subscriptionFilters, eventFilters)
      .then((responses) => {
        if (!isMounted) return
        applyInitialData(responses)
      })
      .catch((error) => {
        if (!isMounted) return
        handleLoadError(error)
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
          description:
            err instanceof Error ? err.message : 'Nao foi possivel carregar assinaturas.',
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
    setSubscriptionFilters((current) => ({
      ...current,
      page: 1,
      [field]: value || undefined,
    }))
  }

  function setEventFilter<K extends keyof StripeEventFilters>(
    field: K,
    value: StripeEventFilters[K],
  ) {
    setEventFilters((current) => ({
      ...current,
      page: 1,
      [field]: value || undefined,
    }))
  }

  return {
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
  }
}

function loadAdminFinanceData(
  subscriptionFilters: SubscriptionFilters,
  eventFilters: StripeEventFilters,
) {
  return Promise.all([
    getAdminFinanceSummary(),
    listAdminFinancePlans(),
    listAdminFinanceSubscriptions(subscriptionFilters),
    listAdminFinanceStripeEvents(eventFilters),
  ])
}
