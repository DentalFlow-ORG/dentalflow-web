import { useEffect, useMemo, useRef, useState } from 'react'

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
  const showAlertRef = useRef(showAlert)
  showAlertRef.current = showAlert
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

  const initialFiltersRef = useRef({ subscriptions: subscriptionFilters, events: eventFilters })
  const isFirstSubscriptionRender = useRef(true)
  const isFirstEventRender = useRef(true)

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
      error instanceof Error ? error.message : 'Não foi possível carregar os dados financeiros.'
    setLoadError(message)
    showAlert({
      title: 'Erro ao carregar gestão financeira',
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

    loadAdminFinanceData(initialFiltersRef.current.subscriptions, initialFiltersRef.current.events)
      .then((responses) => {
        if (!isMounted) return
        setSummary(responses[0])
        setPlans(responses[1])
        setSubscriptions(responses[2].data)
        setSubscriptionsTotal(responses[2].total)
        setEvents(responses[3].data)
        setEventsTotal(responses[3].total)
      })
      .catch((error) => {
        if (!isMounted) return
        const message =
          error instanceof Error ? error.message : 'Não foi possível carregar os dados financeiros.'
        setLoadError(message)
        showAlertRef.current({
          title: 'Erro ao carregar gestão financeira',
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
  }, [])

  useEffect(() => {
    if (isFirstSubscriptionRender.current) {
      isFirstSubscriptionRender.current = false
      return
    }

    listAdminFinanceSubscriptions(subscriptionFilters)
      .then((response) => {
        setSubscriptions(response.data)
        setSubscriptionsTotal(response.total)
      })
      .catch((err) => {
        showAlertRef.current({
          title: 'Erro ao carregar assinaturas',
          description:
            err instanceof Error ? err.message : 'Não foi possível carregar assinaturas.',
          tone: 'error',
        })
      })
  }, [subscriptionFilters])

  useEffect(() => {
    if (isFirstEventRender.current) {
      isFirstEventRender.current = false
      return
    }

    listAdminFinanceStripeEvents(eventFilters)
      .then((response) => {
        setEvents(response.data)
        setEventsTotal(response.total)
      })
      .catch((err) => {
        showAlertRef.current({
          title: 'Erro ao carregar eventos Stripe',
          description:
            err instanceof Error ? err.message : 'Não foi possível carregar eventos Stripe.',
          tone: 'error',
        })
      })
  }, [eventFilters])

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
