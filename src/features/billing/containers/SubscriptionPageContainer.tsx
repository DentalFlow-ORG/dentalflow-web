import { AlertCircle, Check, ExternalLink, Loader2, Package, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { formatCurrencyBR } from '@/lib/number-formatters'
import { cn } from '@/lib/utils'

import {
  STATUS_COLORS,
  STATUS_LABELS,
  getPlanFeatures,
  intervalAvailableForPlan,
  useSubscriptionPage,
} from '../hooks/useSubscriptionPage'

export function SubscriptionPageContainer() {
  const {
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
  } = useSubscriptionPage()

  return (
    <AppPage>
      <AppPageHeader
        title="Assinatura"
        description="Gerencie o plano e as informações de cobrança da sua clínica."
      />

      {/* Current subscription */}
      <PanelCard>
        <h2 className="mb-4 text-base font-semibold text-slate-950">Assinatura atual</h2>

        {isLoadingSubscription ? (
          <p className="text-sm text-slate-500">Carregando assinatura...</p>
        ) : subscriptionError ? (
          <p className="text-sm text-red-600">{subscriptionError}</p>
        ) : !subscription || subscription.status === 'CANCELED' ? (
          <p className="text-sm text-slate-500">
            Nenhuma assinatura ativa. Escolha um plano abaixo para começar.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Plano
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {subscription.plan?.name ?? '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    STATUS_COLORS[subscription.status],
                  )}
                >
                  {STATUS_LABELS[subscription.status]}
                </span>
              </div>

              {subscription.billingInterval && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Cobrança
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {subscription.billingInterval === 'MONTHLY' ? 'Mensal' : 'Anual'}
                  </p>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {subscription.cancelAtPeriodEnd ? 'Acesso até' : 'Próxima cobrança'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDateBR(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Sua assinatura está agendada para cancelamento ao fim do período atual. O
                  acesso continua até{' '}
                  <strong>{formatDateBR(subscription.currentPeriodEnd)}</strong>.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePortal}
                disabled={isAnyActionPending}
              >
                {isOpeningPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Gerenciar assinatura
              </Button>

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isAnyActionPending}
                >
                  <X className="h-4 w-4" />
                  Cancelar assinatura
                </Button>
              )}
            </div>
          </div>
        )}
      </PanelCard>

      {/* Plans */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-950">Planos disponíveis</h2>

          {showIntervalToggle && (
            <div className="flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-slate-50 p-1 sm:self-auto">
              {anyPlanHasMonthly && (
                <button
                  type="button"
                  onClick={() => setBillingInterval('MONTHLY')}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
                    billingInterval === 'MONTHLY'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  Mensal
                </button>
              )}
              {anyPlanHasYearly && (
                <button
                  type="button"
                  onClick={() => setBillingInterval('YEARLY')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
                    billingInterval === 'YEARLY'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  Anual
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                    Economize
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {isLoadingPlans ? (
          <LoadingCard message="Carregando planos..." />
        ) : plansError ? (
          <PanelCard>
            <p className="text-sm text-red-600">{plansError}</p>
          </PanelCard>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum plano disponível."
            description="Nenhum plano está disponível no momento. Entre em contato com o suporte."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const available = intervalAvailableForPlan(plan, billingInterval)
              const price =
                billingInterval === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly
              const isCurrentPlan = subscription?.plan?.id === plan.id
              const features = getPlanFeatures(plan)
              const isCheckingOutThisPlan = checkingOutPlanId === plan.id
              const isDisabled = isCurrentPlan || !available || isAnyActionPending

              return (
                <PanelCard
                  key={plan.id}
                  className={cn(isCurrentPlan && 'ring-2 ring-primary ring-offset-2')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950">{plan.name}</h3>
                      {plan.description && (
                        <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                      )}
                    </div>
                    {isCurrentPlan && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Atual
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    {available ? (
                      <>
                        <span className="text-3xl font-bold text-slate-950">
                          {formatCurrencyBR(price / 100)}
                        </span>
                        <span className="ml-1 text-sm text-slate-500">
                          /{billingInterval === 'MONTHLY' ? 'mês' : 'ano'}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Sem preço {billingInterval === 'MONTHLY' ? 'mensal' : 'anual'}
                      </span>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6">
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : 'default'}
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleCheckout(plan.id)}
                    >
                      {isCheckingOutThisPlan && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isCurrentPlan
                        ? 'Plano atual'
                        : !available
                          ? 'Indisponível neste período'
                          : isCheckingOutThisPlan
                            ? 'Redirecionando para o Stripe...'
                            : hasActiveSubscription
                              ? 'Alterar plano'
                              : 'Assinar plano'}
                    </Button>
                  </div>
                </PanelCard>
              )
            })}
          </div>
        )}
      </div>

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
