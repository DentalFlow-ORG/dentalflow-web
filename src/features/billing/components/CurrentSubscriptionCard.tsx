import {
  AlertCircle,
  CalendarDays,
  ExternalLink,
  Loader2,
  X,
  type LucideIcon,
} from 'lucide-react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'

import { BillingStatusBadge } from './BillingStatusBadge'
import type { CurrentBillingStatus } from '../types/billing.types'

type Props = {
  billingStatus: CurrentBillingStatus | null
  isLoading: boolean
  error: string | null
  canCancel: boolean
  isOpeningPortal: boolean
  isAnyActionPending: boolean
  onOpenPortal: () => void
  onCancel: () => void
}

export function CurrentSubscriptionCard({
  billingStatus,
  isLoading,
  error,
  canCancel,
  isOpeningPortal,
  isAnyActionPending,
  onOpenPortal,
  onCancel,
}: Props) {
  return (
    <PanelCard>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Assinatura atual</h2>
          <p className="mt-1 text-sm text-slate-500">
            Status de acesso e cobrança da sua clínica.
          </p>
        </div>
        {billingStatus && (
          <BillingStatusBadge
            status={billingStatus.status}
            cancelAtPeriodEnd={billingStatus.cancelAtPeriodEnd}
          />
        )}
      </div>

      {isLoading ? (
        <LoadingCard message="Carregando assinatura..." />
      ) : error ? (
        <InlineFeedback tone="error">
          Não foi possível carregar sua assinatura. Tente novamente.
        </InlineFeedback>
      ) : !billingStatus || billingStatus.status === 'missing' ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">Nenhuma assinatura encontrada.</p>
          <p className="mt-1 text-sm text-slate-500">
            Escolha um plano para continuar usando o DentalFlow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <StatusInfo label="Plano" value={billingStatus.planName ?? 'Não definido'} />
            <StatusInfo
              label="Cobrança"
              value={
                billingStatus.billingInterval === 'annual'
                  ? 'Anual'
                  : billingStatus.billingInterval === 'monthly'
                    ? 'Mensal'
                    : 'Não definida'
              }
            />
            <StatusInfo
              label={billingStatus.status === 'trialing' ? 'Teste até' : 'Próxima cobrança'}
              value={
                billingStatus.status === 'trialing'
                  ? formatNullableDate(billingStatus.trialEndsAt)
                  : formatNullableDate(billingStatus.currentPeriodEnd)
              }
            />
            <StatusInfo
              label="Acesso"
              value={billingStatus.accessAllowed ? 'Liberado' : 'Bloqueado'}
            />
          </div>

          {billingStatus.status === 'trialing' && billingStatus.accessAllowed && (
            <InfoBox
              icon={CalendarDays}
              tone="blue"
              text={`Seu teste grátis termina em ${formatNullableDate(billingStatus.trialEndsAt)}.`}
            />
          )}

          {billingStatus.cancelAtPeriodEnd && (
            <InfoBox
              icon={AlertCircle}
              tone="amber"
              text={`Cancelamento agendado. O acesso continua até ${formatNullableDate(
                billingStatus.currentPeriodEnd,
              )}.`}
            />
          )}

          {!billingStatus.accessAllowed && (
            <InfoBox icon={AlertCircle} tone="amber" text={billingStatus.message} />
          )}

          <div className="flex flex-wrap gap-3">
            {billingStatus.stripeCustomerId && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPortal}
                disabled={isAnyActionPending}
              >
                {isOpeningPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Gerenciar assinatura
              </Button>
            )}

            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={onCancel}
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
  )
}

function StatusInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function InfoBox({
  icon: Icon,
  text,
  tone,
}: {
  icon: LucideIcon
  text: string
  tone: 'amber' | 'blue'
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-blue-200 bg-blue-50 text-blue-800'

  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${toneClass}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{text}</p>
    </div>
  )
}

function formatNullableDate(value: string | null) {
  return value ? formatDateBR(value) : 'Não definida'
}
