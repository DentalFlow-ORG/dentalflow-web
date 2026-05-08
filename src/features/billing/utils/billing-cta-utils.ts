import type {
  BillingInterval,
  BillingPlan,
  CurrentBillingStatus,
} from '../types/billing.types'

export type PlanCtaAction =
  | 'start_trial'
  | 'checkout'
  | 'change_plan'
  | 'current_plan'
  | 'reactivate'

export type PlanCtaButtonState = {
  label: string
  helperText: string
  actionType: PlanCtaAction
  disabled: boolean
  variant: 'default' | 'outline'
}

export type PlanCtaState = {
  primary: PlanCtaButtonState
  secondary?: PlanCtaButtonState
}

type GetPlanCtaStateArgs = {
  plan: BillingPlan
  selectedInterval: BillingInterval
  currentSubscription: CurrentBillingStatus | null
  isCurrentPlan: boolean
  canManageBilling: boolean
  isAvailable: boolean
  isActionPending: boolean
  currentPlanDisplayOrder: number | null
}

export function getPlanCtaState({
  plan,
  selectedInterval,
  currentSubscription,
  isCurrentPlan,
  canManageBilling,
  isAvailable,
  isActionPending,
  currentPlanDisplayOrder,
}: GetPlanCtaStateArgs): PlanCtaState {
  const disabledBase = !canManageBilling || !isAvailable || isActionPending

  if (isCurrentPlan) {
    const isTrial = currentSubscription?.status === 'trialing'
    return {
      primary: {
        label: isTrial ? 'Teste grátis ativo' : 'Plano atual',
        helperText: isTrial
          ? 'Seu teste grátis está ativo neste plano.'
          : 'Este é o plano ativo neste período de cobrança.',
        actionType: 'current_plan',
        disabled: true,
        variant: 'outline',
      },
    }
  }

  if (!currentSubscription?.hasSubscription) {
    return {
      primary: {
        label: 'Começar teste grátis',
        helperText: '7 dias grátis, sem cartão',
        actionType: 'start_trial',
        disabled: disabledBase || !plan.trialEligible,
        variant: 'default',
      },
      secondary: {
        label: 'Assinar agora',
        helperText: plan.campaign.promotionReady
          ? 'Garanta a oferta de lançamento'
          : 'Continuar para o checkout seguro',
        actionType: 'checkout',
        disabled: disabledBase,
        variant: 'outline',
      },
    }
  }

  if (!currentSubscription.accessAllowed) {
    return {
      primary: {
        label:
          currentSubscription.status === 'canceled'
            ? 'Reativar assinatura'
            : 'Assinar novamente',
        helperText: 'Escolha um plano para recuperar o acesso.',
        actionType: 'reactivate',
        disabled: disabledBase,
        variant: 'default',
      },
    }
  }

  if (!currentSubscription.stripeSubscriptionId) {
    return {
      primary: {
        label: 'Assinar agora',
        helperText: 'Conclua a assinatura para ativar a cobrança.',
        actionType: 'checkout',
        disabled: disabledBase,
        variant: 'default',
      },
    }
  }

  const samePlan = currentSubscription.planKey === plan.slug
  const currentInterval =
    currentSubscription.billingInterval === 'annual' ? 'YEARLY' : 'MONTHLY'
  const changingInterval = samePlan && currentInterval !== selectedInterval
  const isUpgrade =
    currentPlanDisplayOrder != null && plan.displayOrder > currentPlanDisplayOrder

  return {
    primary: {
      label: changingInterval
        ? selectedInterval === 'YEARLY'
          ? 'Mudar para anual'
          : 'Mudar para mensal'
        : isUpgrade
          ? 'Fazer upgrade'
          : 'Trocar para este plano',
      helperText: 'A alteração será aplicada na assinatura atual.',
      actionType: 'change_plan',
      disabled: disabledBase,
      variant: 'default',
    },
  }
}
