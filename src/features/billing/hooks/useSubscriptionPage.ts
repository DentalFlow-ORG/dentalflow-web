import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { getPlanFeatureSummaries } from '@/features/marketing/config/features'

import {
  cancelSubscription,
  changeSubscriptionPlan,
  createCheckoutSession,
  createPortalSession,
  getCurrentBillingStatus,
  listBillingPlans,
  startTrial,
} from '../services/billing.service'
import { setCachedBillingStatus } from '../services/billing-status-cache'
import type {
  BillingInterval,
  BillingCampaign,
  BillingPlan,
  CurrentBillingStatus,
} from '../types/billing.types'

export function getPlanFeatures(plan: BillingPlan): string[] {
  const features: string[] = getPlanFeatureSummaries(plan.slug)
  if (plan.maxProfiles != null) features.push(`Até ${plan.maxProfiles} perfis`)
  else features.push('Perfis ilimitados')
  if (plan.maxLeadsPerMonth != null) features.push(`Até ${plan.maxLeadsPerMonth} leads por mês`)
  if (plan.maxServicesPerProfile != null) {
    features.push(`Até ${plan.maxServicesPerProfile} serviços por perfil`)
  }
  if (plan.hasAppointments) features.push('Agendamentos online')
  if (plan.hasAnalytics) features.push('Relatórios e análises')
  if (plan.hasCustomDomain) features.push('Domínio personalizado')
  if (plan.hasPrioritySupport) features.push('Suporte prioritário')
  return [...new Set(features)]
}

export function intervalAvailableForPlan(plan: BillingPlan, interval: BillingInterval): boolean {
  return interval === 'MONTHLY' ? plan.hasMonthlyPrice : plan.hasYearlyPrice
}

export function normalizeBillingInterval(interval: BillingInterval) {
  return interval === 'MONTHLY' ? 'monthly' : 'annual'
}

export function useSubscriptionPage() {
  const { showAlert } = useGlobalAlerts()

  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [campaign, setCampaign] = useState<BillingCampaign | null>(null)
  const [billingStatus, setBillingStatus] = useState<CurrentBillingStatus | null>(null)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isLoadingBillingStatus, setIsLoadingBillingStatus] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)
  const [billingStatusError, setBillingStatusError] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('YEARLY')
  const [checkingOutPlanKey, setCheckingOutPlanKey] = useState<string | null>(null)
  const [startingTrialPlanKey, setStartingTrialPlanKey] = useState<string | null>(null)
  const [changingPlanKey, setChangingPlanKey] = useState<string | null>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  function loadBillingStatus() {
    setIsLoadingBillingStatus(true)
    setBillingStatusError(null)
    getCurrentBillingStatus()
      .then((status) => {
        setCachedBillingStatus(status)
        setBillingStatus(status)
      })
      .catch((err) => {
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar sua assinatura. Tente novamente.'
        setBillingStatusError(msg)
      })
      .finally(() => setIsLoadingBillingStatus(false))
  }

  useEffect(() => {
    setIsLoadingPlans(true)
    setPlansError(null)
    listBillingPlans()
      .then((response) => {
        setPlans(response.plans)
        setCampaign(response.campaign)
      })
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar os planos.'
        setPlansError(msg)
      })
      .finally(() => setIsLoadingPlans(false))

    loadBillingStatus()
  }, [])

  useEffect(() => {
    if (plans.length === 0) return
    const anyMonthly = plans.some((plan) => plan.hasMonthlyPrice)
    const anyYearly = plans.some((plan) => plan.hasYearlyPrice)
    if (billingInterval === 'MONTHLY' && !anyMonthly && anyYearly) {
      setBillingInterval('YEARLY')
    } else if (billingInterval === 'YEARLY' && !anyYearly && anyMonthly) {
      setBillingInterval('MONTHLY')
    }
  }, [billingInterval, plans])

  async function handleStartTrial(planKey: string) {
    setStartingTrialPlanKey(planKey)
    try {
      const nextStatus = await startTrial({ planKey, billingInterval })
      setBillingStatus(nextStatus)
      showAlert({
        title: 'Teste grátis iniciado',
        description: 'Seu acesso ao DentalFlow foi liberado por 7 dias.',
        tone: 'success',
      })
      window.location.href = '/app'
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível iniciar o teste grátis.'
      showAlert({ title: 'Erro ao iniciar teste', description: msg, tone: 'error' })
      setStartingTrialPlanKey(null)
    }
  }

  async function handleCheckout(planKey: string) {
    setCheckingOutPlanKey(planKey)
    try {
      const { url } = await createCheckoutSession({ planKey, billingInterval })
      showAlert({ title: 'Redirecionando para o Stripe...', tone: 'info' })
      window.location.href = url
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível iniciar o checkout.'
      showAlert({ title: 'Erro no checkout', description: msg, tone: 'error' })
      setCheckingOutPlanKey(null)
    }
  }

  async function handleChangePlan(planKey: string) {
    setChangingPlanKey(planKey)
    try {
      const nextStatus = await changeSubscriptionPlan({ planKey, billingInterval })
      setCachedBillingStatus(nextStatus)
      setBillingStatus(nextStatus)
      showAlert({
        title: 'Plano atualizado',
        description: 'A alteração foi enviada para a Stripe e sua assinatura foi sincronizada.',
        tone: 'success',
      })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível alterar o plano.'
      showAlert({ title: 'Erro ao alterar plano', description: msg, tone: 'error' })
    } finally {
      setChangingPlanKey(null)
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
        title: 'Cancelamento agendado para o fim do período atual.',
        tone: 'success',
      })
      setShowCancelDialog(false)
      loadBillingStatus()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível cancelar a assinatura. Tente novamente ou entre em contato com o suporte.'
      showAlert({ title: 'Erro ao cancelar assinatura', description: msg, tone: 'error' })
    } finally {
      setIsCanceling(false)
    }
  }

  const anyPlanHasMonthly = plans.some((plan) => plan.hasMonthlyPrice)
  const anyPlanHasYearly = plans.some((plan) => plan.hasYearlyPrice)
  const showIntervalToggle = anyPlanHasMonthly || anyPlanHasYearly
  const canCancel =
    billingStatus?.accessAllowed === true &&
    billingStatus.stripeSubscriptionId != null &&
    !billingStatus.cancelAtPeriodEnd
  const isAnyActionPending =
    checkingOutPlanKey != null ||
    startingTrialPlanKey != null ||
    changingPlanKey != null ||
    isOpeningPortal

  return {
    plans,
    campaign,
    billingStatus,
    isLoadingPlans,
    isLoadingBillingStatus,
    plansError,
    billingStatusError,
    billingInterval,
    setBillingInterval,
    checkingOutPlanKey,
    startingTrialPlanKey,
    changingPlanKey,
    isOpeningPortal,
    showCancelDialog,
    setShowCancelDialog,
    isCanceling,
    canCancel,
    isAnyActionPending,
    anyPlanHasMonthly,
    anyPlanHasYearly,
    showIntervalToggle,
    handleStartTrial,
    handleCheckout,
    handleChangePlan,
    handlePortal,
    handleCancelConfirm,
  }
}
