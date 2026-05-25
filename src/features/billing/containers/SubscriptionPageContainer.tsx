import { Check, Lock, Package, ShieldCheck } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { useAuth } from '@/features/auth/hooks/useAuth'

import { BillingIntervalToggle } from '../components/BillingIntervalToggle'
import { CurrentSubscriptionCard } from '../components/CurrentSubscriptionCard'
import { LaunchOfferBanner } from '../components/LaunchOfferBanner'
import { PlanValueSection } from '../components/PlanValueSection'
import { PricingCard } from '../components/PricingCard'
import { SubscriptionHero } from '../components/SubscriptionHero'
import {
  commercialFeatures,
  type CommercialPlanKey,
  type PlanCardFeature,
} from '@/features/marketing/config/features'

import {
  intervalAvailableForPlan,
  normalizeBillingInterval,
  useSubscriptionPage,
} from '../hooks/useSubscriptionPage'
import {
  getPlanCtaState,
  type PlanCtaState,
} from '../utils/billing-cta-utils'

const COMPARISON_FEATURE_IDS = [
  'clinic-agenda',
  'clinical-records',
  'patients-register',
  'crm-leads',
  'clinic-finance',
  'inventory-control',
  'management-reports',
  'google-calendar',
  'role-permissions',
  'ai-assistant',
  'whatsapp-notifications',
  'priority-support',
] as const

function getComparisonFeatures(planKey: CommercialPlanKey): PlanCardFeature[] {
  return COMPARISON_FEATURE_IDS.map((id) => {
    const feature = commercialFeatures.find((f) => f.id === id)
    if (!feature) return null
    return { label: feature.title, availability: feature.availability[planKey] }
  }).filter((f): f is PlanCardFeature => f !== null)
}

const REASSURANCE_ITEMS = [
  { icon: Check, text: 'Teste grátis por 7 dias, sem cartão de crédito' },
  { icon: Check, text: 'Cancele quando quiser, sem fidelidade' },
  { icon: ShieldCheck, text: 'Pagamentos processados com segurança via Stripe' },
  { icon: Lock, text: 'Migração assistida pela nossa equipe no início' },
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
  const hasMonthlyPromo = plans.some((p) => p.campaign.promotionReady)

  return (
    <AppPage>
      <SubscriptionHero />

      <LaunchOfferBanner
        campaign={campaign}
        billingInterval={billingInterval}
        hasMonthlyPromo={hasMonthlyPromo}
      />

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
        {showIntervalToggle && (
          <div className="flex justify-start sm:justify-center">
            <BillingIntervalToggle
              value={billingInterval}
              onChange={setBillingInterval}
              showMonthly={anyPlanHasMonthly}
              showYearly={anyPlanHasYearly}
              discountPercent={annualDiscountPercent}
              hasMonthlyPromo={hasMonthlyPromo}
            />
          </div>
        )}

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
          <div className="grid grid-cols-1 items-stretch gap-5 pt-5 lg:grid-cols-3 lg:gap-6">
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
                  features={getComparisonFeatures(plan.slug as CommercialPlanKey)}
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

        <div className="mt-16 sm:mt-20 lg:mt-24">
          <PlanValueSection />
        </div>

        <PanelCard className="p-4 sm:p-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {REASSURANCE_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2.5 text-muted-foreground">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium leading-5">{text}</span>
              </div>
            ))}
          </div>
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
