import { Link, useSearch } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import {
  createPortalSession,
  getCurrentBillingStatus,
  syncCheckoutSession,
} from '../services/billing.service'
import {
  clearBillingStatusCache,
  setCachedBillingStatus,
} from '../services/billing-status-cache'
import type { CurrentBillingStatus, NormalizedBillingStatus } from '../types/billing.types'

const MAX_ATTEMPTS = 6
const RETRY_INTERVAL_MS = 2500

const onboardingSteps = [
  {
    icon: ShieldCheck,
    label: 'Complete os dados da clínica',
    description: 'Adicione endereço, telefone e logotipo.',
  },
  {
    icon: Users,
    label: 'Cadastre sua equipe',
    description: 'Convide dentistas e assistentes.',
  },
  {
    icon: CalendarCheck2,
    label: 'Configure a agenda',
    description: 'Defina horários e disponibilidades.',
  },
  {
    icon: UserPlus,
    label: 'Adicione seus pacientes',
    description: 'Importe ou cadastre manualmente.',
  },
  {
    icon: Sparkles,
    label: 'Comece a usar',
    description: 'Agende consultas e acompanhe resultados.',
  },
] as const

export function SubscriptionSuccessPage() {
  useForceLightTheme()
  const { session_id: sessionId } = useSearch({ from: '/app/assinatura/sucesso' })
  const [status, setStatus] = useState<CurrentBillingStatus | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [isChecking, setIsChecking] = useState(true)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isConfirmed = status?.accessAllowed === true
  const hasFinishedRetries = attempt >= MAX_ATTEMPTS

  const visualState = useMemo(() => {
    if (isConfirmed) return 'confirmed'
    if (isChecking || !hasFinishedRetries) return 'processing'
    return 'attention'
  }, [hasFinishedRetries, isChecking, isConfirmed])

  const refreshStatus = useCallback(
    async (options: { reconcileCheckout: boolean }) => {
      setIsChecking(true)
      setMessage(null)

      try {
        clearBillingStatusCache()
        const nextStatus =
          options.reconcileCheckout && sessionId
            ? await syncCheckoutSession(sessionId)
            : await getCurrentBillingStatus()

        setStatus(nextStatus)
        setCachedBillingStatus(nextStatus)
        return nextStatus
      } catch {
        setMessage(
          'Não foi possível confirmar a assinatura agora. Tente verificar novamente em alguns instantes.',
        )
        return null
      } finally {
        setIsChecking(false)
      }
    },
    [sessionId],
  )

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null

    async function runCheck(currentAttempt: number) {
      if (cancelled) return
      setAttempt(currentAttempt)
      const nextStatus = await refreshStatus({ reconcileCheckout: currentAttempt === 1 })

      if (cancelled || nextStatus?.accessAllowed || currentAttempt >= MAX_ATTEMPTS) {
        return
      }

      timeoutId = window.setTimeout(() => {
        void runCheck(currentAttempt + 1)
      }, RETRY_INTERVAL_MS)
    }

    void runCheck(1)

    return () => {
      cancelled = true
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [refreshStatus])

  const handleManualRefresh = () => {
    setAttempt(1)
    void refreshStatus({ reconcileCheckout: Boolean(sessionId) })
  }

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true)
    try {
      const { url } = await createPortalSession()
      window.location.assign(url)
    } catch {
      setMessage('Não foi possível abrir o portal de assinatura agora.')
    } finally {
      setIsOpeningPortal(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-5xl items-center justify-center overflow-x-hidden py-6 text-slate-950">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 sm:p-7 lg:p-8">
        <div className="flex justify-center">
          <BrandLink compact />
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center text-center">
          <StatusIcon state={visualState} />
          <StatusBadge status={status?.status ?? 'incomplete'} state={visualState} />

          <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {visualState === 'confirmed'
              ? 'Assinatura confirmada'
              : visualState === 'processing'
                ? 'Estamos confirmando sua assinatura'
                : 'Pagamento recebido, sincronização em andamento'}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            {visualState === 'confirmed'
              ? 'Seu plano foi ativado e o acesso ao DentalFlow está liberado.'
              : 'A Stripe confirmou o retorno do checkout. Estamos atualizando a assinatura no DentalFlow para liberar o acesso com segurança.'}
          </p>

          {message && (
            <div className="mt-5 w-full">
              <InlineFeedback tone="warning">{message}</InlineFeedback>
            </div>
          )}
          {!message && visualState === 'attention' && (
            <div className="mt-5 w-full">
              <InlineFeedback tone="warning">
                A assinatura ainda aparece como pendente no DentalFlow. Isso pode acontecer por atraso no webhook da Stripe. Verifique novamente ou abra o portal de assinatura.
              </InlineFeedback>
            </div>
          )}
        </div>

        {/* Onboarding steps */}
        <div className="mx-auto mt-10 max-w-4xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Próximos passos
          </p>
          <div className="grid gap-3 sm:grid-cols-5">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold leading-5 text-slate-800">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" disabled={!isConfirmed}>
            <Link to="/app">
              Ir para o painel
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xl"
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            className="border-slate-200 bg-white text-slate-800 hover:border-primary/40 hover:bg-primary/5"
          >
            {isOpeningPortal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Gerenciar assinatura
          </Button>
          {!isConfirmed && (
            <Button type="button" variant="ghost" size="xl" onClick={handleManualRefresh} disabled={isChecking}>
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verificar novamente
            </Button>
          )}
        </div>

        {visualState === 'processing' && (
          <p className="mt-5 text-center text-xs font-medium text-slate-500">
            Tentativa {Math.min(attempt, MAX_ATTEMPTS)} de {MAX_ATTEMPTS}
          </p>
        )}
      </div>
    </section>
  )
}

function StatusIcon({ state }: { state: 'confirmed' | 'processing' | 'attention' }) {
  if (state === 'confirmed') {
    return (
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-300/40 df-ring-pulse" />
        <div
          className="absolute inset-0 rounded-full bg-emerald-200/30 df-ring-pulse"
          style={{ animationDelay: '0.4s' }}
        />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-100 df-success-pop">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        </div>
      </div>
    )
  }

  const classes = {
    processing: 'bg-blue-100 text-primary',
    attention: 'bg-amber-100 text-amber-700',
  }
  const Icon = state === 'processing' ? Clock3 : ShieldCheck

  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${classes[state]}`}>
      <Icon className="h-10 w-10" aria-hidden="true" />
    </div>
  )
}

function StatusBadge({
  status,
  state,
}: {
  status: NormalizedBillingStatus
  state: 'confirmed' | 'processing' | 'attention'
}) {
  const tone = {
    confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    processing: 'border-blue-200 bg-blue-50 text-primary',
    attention: 'border-amber-200 bg-amber-50 text-amber-700',
  }[state]

  return (
    <span className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`}>
      Status: {getStatusLabel(status)}
    </span>
  )
}

function getStatusLabel(status: NormalizedBillingStatus) {
  const labels: Record<NormalizedBillingStatus, string> = {
    missing: 'sem assinatura',
    trialing: 'teste ativo',
    active: 'ativa',
    past_due: 'pagamento pendente',
    canceled: 'cancelada',
    incomplete: 'incompleta',
    unpaid: 'sem pagamento confirmado',
    paused: 'pausada',
  }

  return labels[status]
}
