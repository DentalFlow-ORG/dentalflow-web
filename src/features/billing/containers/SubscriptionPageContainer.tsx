import { Check, Package } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { useAuth } from '@/features/auth/hooks/useAuth'

import { BillingIntervalToggle } from '../components/BillingIntervalToggle'
import { CurrentSubscriptionCard } from '../components/CurrentSubscriptionCard'
import { LaunchOfferBanner } from '../components/LaunchOfferBanner'
import { PricingCard } from '../components/PricingCard'
import {
  getPlanFeatures,
  intervalAvailableForPlan,
  normalizeBillingInterval,
  useSubscriptionPage,
} from '../hooks/useSubscriptionPage'
import {
  getPlanCtaState,
  type PlanCtaState,
} from '../utils/billing-cta-utils'

const TRUST_MESSAGES = [
  'Teste grátis por 7 dias',
  'Cancele quando quiser',
  'Sem compromisso durante o teste',
]

export function SubscriptionPageContainer() {
  const { user } = useAuth()
  const canManageBilling = user?.role === 'OWNER'

  const {
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
  } = useSubscriptionPage()

  const annualDiscountPercent =
    plans.find((plan) => plan.annualDiscountPercent != null)?.annualDiscountPercent ?? null
  const currentPlan = plans.find((plan) => plan.slug === billingStatus?.planKey)
  const currentPlanDisplayOrder = currentPlan?.displayOrder ?? null

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Planos e cobrança"
        title="Assinatura"
        description="Escolha o plano ideal, acompanhe seu teste grátis e gerencie a cobrança da clínica."
      />

      <LaunchOfferBanner campaign={campaign} />

      {billingStatus?.accessAllowed === false && (
        <InlineFeedback tone="warning">
          {canManageBilling
            ? (billingStatus.message || 'Sua assinatura precisa ser regularizada para continuar usando o DentalFlow.')
            : 'O acesso ao DentalFlow está suspenso. Entre em contato com o proprietário da clínica para regularizar a assinatura e restaurar o acesso.'}
        </InlineFeedback>
      )}

      {!canManageBilling && billingStatus?.accessAllowed !== false && (
        <InlineFeedback tone="info">
          Apenas o proprietário da clínica pode iniciar teste grátis, assinar ou gerenciar a
          cobrança. Você ainda pode visualizar os planos disponíveis.
        </InlineFeedback>
      )}

      <CurrentSubscriptionCard
        billingStatus={billingStatus}
        isLoading={isLoadingBillingStatus}
        error={billingStatusError}
        canCancel={canCancel && canManageBilling}
        isOpeningPortal={isOpeningPortal}
        isAnyActionPending={isAnyActionPending || !canManageBilling}
        onOpenPortal={handlePortal}
        onCancel={() => setShowCancelDialog(true)}
      />

      <section className="space-y-6">
        <div className="space-y-5 text-left sm:text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Planos DentalFlow
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Libere a gestão completa da clínica
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Comece com 7 dias grátis, sem cartão de crédito. Centralize agenda, pacientes e
              financeiro em um só lugar e pare de perder tempo com desorganização.
            </p>
          </div>

          {showIntervalToggle && (
            <div className="flex justify-start sm:justify-center">
              <BillingIntervalToggle
                value={billingInterval}
                onChange={setBillingInterval}
                showMonthly={anyPlanHasMonthly}
                showYearly={anyPlanHasYearly}
                discountPercent={annualDiscountPercent}
              />
            </div>
          )}
        </div>

        {isLoadingPlans ? (
          <LoadingCard message="Carregando planos..." />
        ) : plansError ? (
          <PanelCard>
            <InlineFeedback tone="error">{plansError}</InlineFeedback>
          </PanelCard>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum plano disponível."
            description="Nenhum plano está disponível no momento. Entre em contato com o suporte."
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan, index) => {
              const normalizedInterval = normalizeBillingInterval(billingInterval)
              const isCurrentPlan =
                billingStatus?.accessAllowed === true &&
                billingStatus.planKey === plan.slug &&
                billingStatus.billingInterval === normalizedInterval
              const isAvailable = intervalAvailableForPlan(plan, billingInterval)
              const ctaState: PlanCtaState = getPlanCtaState({
                plan,
                selectedInterval: billingInterval,
                currentSubscription: billingStatus,
                isCurrentPlan,
                canManageBilling,
                isAvailable,
                isActionPending: isAnyActionPending,
                currentPlanDisplayOrder,
              })

              return (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  billingInterval={billingInterval}
                  features={getPlanFeatures(plan)}
                  isAvailable={isAvailable}
                  isCurrentPlan={isCurrentPlan}
                  isRecommended={index === 1 || (plans.length === 1 && plan.hasAnalytics)}
                  billingStatus={billingStatus}
                  ctaState={ctaState}
                  checkingOutPlanKey={checkingOutPlanKey}
                  startingTrialPlanKey={startingTrialPlanKey}
                  changingPlanKey={changingPlanKey}
                  onStartTrial={handleStartTrial}
                  onCheckout={handleCheckout}
                  onChangePlan={handleChangePlan}
                />
              )
            })}
          </div>
        )}

        <PanelCard className="p-4 sm:p-5">
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            {TRUST_MESSAGES.map((message) => (
              <div key={message} className="flex items-center gap-2 font-medium">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>{message}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
            Clínicas dentárias usam o DentalFlow para organizar agenda, pacientes e financeiro em
            um só lugar, com cobrança transparente e gestão centralizada.
          </p>
        </PanelCard>
      </section>

      <ConfirmDialog
        open={showCancelDialog}
        title="Cancelar assinatura"
        description="Sua assinatura será cancelada ao fim do período de cobrança atual. Você continuará com acesso ao plano até essa data e não será cobrado no próximo ciclo."
        confirmLabel="Confirmar cancelamento"
        cancelLabel="Manter assinatura"
        tone="warning"
        isConfirming={isCanceling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelDialog(false)}
      />
    </AppPage>
  )
}
