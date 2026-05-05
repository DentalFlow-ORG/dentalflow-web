import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import {
  cancelSubscription,
  createCheckoutSession,
  createPortalSession,
  getClinicSubscription,
  listBillingPlans,
} from '../services/billing.service'
import type {
  BillingInterval,
  BillingPlan,
  ClinicSubscription,
  SubscriptionStatus,
} from '../types/billing.types'

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: 'Período de teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento em atraso',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga',
  PAUSED: 'Pausada',
  INCOMPLETE: 'Incompleta',
}

export const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  TRIALING: 'bg-blue-50 text-blue-700',
  ACTIVE: 'bg-green-50 text-green-700',
  PAST_DUE: 'bg-amber-50 text-amber-700',
  CANCELED: 'bg-slate-100 text-slate-500',
  UNPAID: 'bg-red-50 text-red-700',
  PAUSED: 'bg-slate-100 text-slate-600',
  INCOMPLETE: 'bg-amber-50 text-amber-700',
}

const ACTIVE_STATUSES: SubscriptionStatus[] = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'INCOMPLETE',
  'UNPAID',
]

export function getPlanFeatures(plan: BillingPlan): string[] {
  const features: string[] = []
  if (plan.maxProfiles != null) {
    features.push(`Até ${plan.maxProfiles} perfis`)
  } else {
    features.push('Perfis ilimitados')
  }
  if (plan.maxLeadsPerMonth != null) {
    features.push(`Até ${plan.maxLeadsPerMonth} leads por mês`)
  }
  if (plan.maxServicesPerProfile != null) {
    features.push(`Até ${plan.maxServicesPerProfile} serviços por perfil`)
  }
  if (plan.hasAppointments) features.push('Agendamentos online')
  if (plan.hasAnalytics) features.push('Relatórios e análises')
  if (plan.hasCustomDomain) features.push('Domínio personalizado')
  if (plan.hasPrioritySupport) features.push('Suporte prioritário')
  return features
}

export function intervalAvailableForPlan(plan: BillingPlan, interval: BillingInterval): boolean {
  return interval === 'MONTHLY' ? plan.hasMonthlyPrice : plan.hasYearlyPrice
}

export function useSubscriptionPage() {
  const { showAlert } = useGlobalAlerts()

  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [subscription, setSubscription] = useState<ClinicSubscription | null>(null)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('MONTHLY')
  const [checkingOutPlanId, setCheckingOutPlanId] = useState<string | null>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  function loadSubscription() {
    setIsLoadingSubscription(true)
    setSubscriptionError(null)
    getClinicSubscription()
      .then(setSubscription)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar a assinatura.'
        setSubscriptionError(msg)
      })
      .finally(() => setIsLoadingSubscription(false))
  }

  useEffect(() => {
    setIsLoadingPlans(true)
    setPlansError(null)
    listBillingPlans()
      .then(setPlans)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar os planos.'
        setPlansError(msg)
      })
      .finally(() => setIsLoadingPlans(false))

    loadSubscription()
  }, [])

  // Auto-correct selected interval if no plan supports it
  useEffect(() => {
    if (plans.length === 0) return
    const anyMonthly = plans.some((p) => p.hasMonthlyPrice)
    const anyYearly = plans.some((p) => p.hasYearlyPrice)
    if (billingInterval === 'MONTHLY' && !anyMonthly && anyYearly) {
      setBillingInterval('YEARLY')
    } else if (billingInterval === 'YEARLY' && !anyYearly && anyMonthly) {
      setBillingInterval('MONTHLY')
    }
  }, [plans]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCheckout(planId: string) {
    setCheckingOutPlanId(planId)
    try {
      const { url } = await createCheckoutSession({
        planId,
        billingInterval,
      })
      showAlert({ title: 'Redirecionando para o Stripe...', tone: 'info' })
      window.location.href = url
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível iniciar o checkout.'
      showAlert({ title: 'Erro no checkout', description: msg, tone: 'error' })
      setCheckingOutPlanId(null)
    }
  }

  async function handlePortal() {
    setIsOpeningPortal(true)
    try {
      const { url } = await createPortalSession()
      showAlert({ title: 'Redirecionando para o Stripe...', tone: 'info' })
      window.location.href = url
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível abrir o portal de assinatura.'
      showAlert({ title: 'Erro ao abrir portal', description: msg, tone: 'error' })
      setIsOpeningPortal(false)
    }
  }

  async function handleCancelConfirm() {
    setIsCanceling(true)
    try {
      await cancelSubscription()
      showAlert({
        title: 'Assinatura cancelada para o fim do período atual.',
        tone: 'success',
      })
      setShowCancelDialog(false)
      loadSubscription()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível cancelar a assinatura.'
      showAlert({ title: 'Erro ao cancelar', description: msg, tone: 'error' })
    } finally {
      setIsCanceling(false)
    }
  }

  const hasActiveSubscription =
    subscription != null && ACTIVE_STATUSES.includes(subscription.status)
  const canCancel = hasActiveSubscription && !subscription!.cancelAtPeriodEnd
  const isAnyActionPending = checkingOutPlanId != null || isOpeningPortal
  const anyPlanHasMonthly = plans.some((p) => p.hasMonthlyPrice)
  const anyPlanHasYearly = plans.some((p) => p.hasYearlyPrice)
  const showIntervalToggle = anyPlanHasMonthly || anyPlanHasYearly

  return {
    plans,
    subscription,
    isLoadingPlans,
    isLoadingSubscription,
    plansError,
    subscriptionError,
    billingInterval,
    setBillingInterval,
    checkingOutPlanId,
    isOpeningPortal,
    showCancelDialog,
    setShowCancelDialog,
    isCanceling,
    hasActiveSubscription,
    canCancel,
    isAnyActionPending,
    anyPlanHasMonthly,
    anyPlanHasYearly,
    showIntervalToggle,
    handleCheckout,
    handlePortal,
    handleCancelConfirm,
  }
}
