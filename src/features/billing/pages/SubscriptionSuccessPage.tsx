import { Link, useSearch } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Lock,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  createPortalSession,
  getCurrentBillingStatus,
  syncCheckoutSession,
} from '../services/billing.service'
import {
  clearBillingStatusCache,
  setCachedBillingStatus,
} from '../services/billing-status-cache'
import type {
  CurrentBillingStatus,
  NormalizedBillingInterval,
  NormalizedBillingStatus,
} from '../types/billing.types'

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 6
const RETRY_INTERVAL_MS = 2500

// ── Onboarding steps ─────────────────────────────────────────────────────────

type OnboardingStep = {
  icon: React.ElementType
  label: string
  description: string
  actionLabel: string
  to: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: Building2,
    label: 'Complete os dados da clínica',
    description: 'Adicione endereço, telefone, logo e outras informações essenciais da sua clínica.',
    actionLabel: 'Configurar',
    to: '/app/configuracoes',
  },
  {
    icon: Users,
    label: 'Cadastre sua equipe',
    description: 'Convide dentistas, assistentes e recepcionistas para começarem a usar o sistema.',
    actionLabel: 'Começar',
    to: '/app/equipe',
  },
  {
    icon: CalendarCheck2,
    label: 'Configure a agenda',
    description: 'Defina horários de atendimento, dias úteis e disponibilidades da sua clínica.',
    actionLabel: 'Configurar',
    to: '/app/agendamentos',
  },
  {
    icon: UserPlus,
    label: 'Adicione seus pacientes',
    description: 'Importe ou cadastre pacientes manualmente para centralizar os atendimentos.',
    actionLabel: 'Adicionar',
    to: '/app/pacientes',
  },
  {
    icon: Sparkles,
    label: 'Comece a usar',
    description: 'Agende consultas e acompanhe resultados com relatórios e indicadores em tempo real.',
    actionLabel: 'Explorar',
    to: '/app',
  },
]

// ── Confetti dot positions for confirmed state ────────────────────────────────

type ConfettiDot = {
  color: string
  dx: string
  dy: string
  delay: string
  style: React.CSSProperties
}

const confettiDots: ConfettiDot[] = [
  { color: 'bg-emerald-400', dx: '-14px', dy: '-22px', delay: '0.1s', style: { top: '-6px', left: 'calc(50% - 4px)' } },
  { color: 'bg-blue-400', dx: '18px', dy: '-14px', delay: '0.2s', style: { top: '12%', right: '-8px' } },
  { color: 'bg-cyan-400', dx: '22px', dy: '10px', delay: '0.05s', style: { bottom: '20%', right: '-10px' } },
  { color: 'bg-emerald-500', dx: '12px', dy: '22px', delay: '0.15s', style: { bottom: '-6px', left: 'calc(50% - 4px)' } },
  { color: 'bg-sky-400', dx: '-22px', dy: '10px', delay: '0.25s', style: { bottom: '20%', left: '-10px' } },
  { color: 'bg-teal-400', dx: '-18px', dy: '-14px', delay: '0.1s', style: { top: '12%', left: '-8px' } },
]

// ── Main component ────────────────────────────────────────────────────────────

export function SubscriptionSuccessPage() {
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
    <div className="flex min-h-[calc(100svh-5rem)] items-start justify-center py-4 lg:items-center lg:py-6">
      <div className="w-full max-w-6xl rounded-2xl border border-border bg-card shadow-xl shadow-slate-950/8 dark:shadow-none animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
        {/* Two-column grid — stacks on mobile */}
        <div className="grid divide-y divide-border lg:grid-cols-[3fr_1px_2fr] lg:divide-x lg:divide-y-0">

          {/* ── Left column: status + summary + actions ──────────────────── */}
          <div className="flex flex-col gap-5 p-6 sm:p-8">

            {/* Logo */}
            <BrandLink compact />

            {/* Status icon */}
            <div className="flex justify-center pt-2">
              <SuccessStatusIcon state={visualState} />
            </div>

            {/* Status pill */}
            <div className="flex justify-center">
              <StatusPill status={status?.status ?? 'incomplete'} state={visualState} />
            </div>

            {/* Title + subtitle */}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {visualState === 'confirmed'
                  ? 'Assinatura confirmada'
                  : visualState === 'processing'
                    ? 'Confirmando assinatura'
                    : 'Pagamento recebido'}
              </h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
                {visualState === 'confirmed'
                  ? 'Seu plano foi ativado e o acesso ao DentalFlow está liberado. Tudo pronto para você começar!'
                  : visualState === 'processing'
                    ? 'A Stripe confirmou o checkout. Estamos sincronizando a assinatura para liberar seu acesso com segurança.'
                    : 'A Stripe confirmou o pagamento. A sincronização ainda está em andamento no DentalFlow.'}
              </p>
            </div>

            {/* Feedback messages */}
            {message && (
              <InlineFeedback tone="warning">{message}</InlineFeedback>
            )}
            {!message && visualState === 'attention' && (
              <InlineFeedback tone="warning">
                A assinatura ainda aparece como pendente. Isso pode acontecer por atraso no webhook da Stripe. Verifique novamente ou abra o portal de assinatura.
              </InlineFeedback>
            )}

            {/* Subscription summary — only when confirmed and data available */}
            {isConfirmed && status && (
              <SubscriptionSummary status={status} />
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="flex-1 sm:flex-none" disabled={!isConfirmed}>
                <Link to="/app">
                  Ir para o painel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CreditCard className="h-4 w-4" />}
                Gerenciar assinatura
              </Button>
              {!isConfirmed && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleManualRefresh}
                  disabled={isChecking}
                >
                  {isChecking
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <RefreshCw className="h-4 w-4" />}
                  Verificar novamente
                </Button>
              )}
            </div>

            {visualState === 'processing' && (
              <p className="text-center text-xs text-muted-foreground">
                Tentativa {Math.min(attempt, MAX_ATTEMPTS)} de {MAX_ATTEMPTS}
              </p>
            )}

            {/* Security note */}
            <div className="mt-auto flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Ambiente seguro e criptografado
            </div>
          </div>

          {/* ── Column divider (desktop only) ────────────────────────────── */}
          <div className="hidden bg-border lg:block" aria-hidden="true" />

          {/* ── Right column: onboarding timeline ────────────────────────── */}
          <div className="p-6 sm:p-8">

            {/* Header */}
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Rocket className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Próximos passos</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Siga os passos abaixo para configurar sua clínica e aproveitar ao máximo o DentalFlow.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Tempo estimado · 15–20 min
              </div>
            </div>

            {/* Timeline */}
            <ol className="space-y-0">
              {onboardingSteps.map((step, index) => (
                <StepItem
                  key={step.to}
                  step={step}
                  index={index}
                  isLast={index === onboardingSteps.length - 1}
                />
              ))}
            </ol>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuccessStatusIcon({ state }: { state: 'confirmed' | 'processing' | 'attention' }) {
  if (state === 'confirmed') {
    return (
      <div className="relative flex h-24 w-24 items-center justify-center" role="img" aria-label="Assinatura confirmada">
        {/* Pulse rings */}
        <span className="absolute inset-[-8px] rounded-full bg-emerald-300/30 df-ring-pulse dark:bg-emerald-500/20" aria-hidden="true" />
        <span className="absolute inset-[-14px] rounded-full bg-emerald-200/20 df-ring-pulse dark:bg-emerald-500/10" style={{ animationDelay: '0.5s' }} aria-hidden="true" />
        {/* Main icon circle */}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-100 df-success-pop dark:bg-emerald-900/40">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        {/* Confetti particles */}
        {confettiDots.map(({ color, dx, dy, delay, style }, i) => (
          <span
            key={i}
            className={cn('df-particle absolute h-2 w-2 rounded-full', color)}
            style={{ ...style, animationDelay: delay, '--dx': dx, '--dy': dy } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
        role="img"
        aria-label="Processando confirmação"
      >
        <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
      role="img"
      aria-label="Atenção: sincronização pendente"
    >
      <ShieldCheck className="h-11 w-11 text-amber-600 dark:text-amber-400" aria-hidden="true" />
    </div>
  )
}

function StatusPill({
  status,
  state,
}: {
  status: NormalizedBillingStatus
  state: 'confirmed' | 'processing' | 'attention'
}) {
  const tone = {
    confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-400',
    processing: 'border-blue-200 bg-blue-50 text-primary dark:border-blue-800/40 dark:bg-blue-900/30',
    attention: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400',
  }[state]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide', tone)}>
      STATUS: {getStatusLabel(status)}
    </span>
  )
}

function SubscriptionSummary({ status }: { status: CurrentBillingStatus }) {
  const renewalDate =
    status.status === 'trialing' ? status.trialEndsAt : status.currentPeriodEnd

  const rows = [
    { label: 'Plano', value: status.planName ?? 'Não definido' },
    { label: 'Ciclo de cobrança', value: formatBillingInterval(status.billingInterval) },
    { label: 'Status', value: getStatusLabel(status.status) },
    { label: 'Próxima renovação', value: formatDate(renewalDate) },
  ]

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resumo da assinatura
      </p>
      <dl className="divide-y divide-border">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function StepItem({
  step,
  index,
  isLast,
}: {
  step: OnboardingStep
  index: number
  isLast: boolean
}) {
  const { icon: Icon, label, description, actionLabel, to } = step

  return (
    <li
      className="flex gap-3 animate-in fade-in-0 slide-in-from-left-2 duration-500"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Number bubble + connector line */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </div>
        {!isLast && <div className="flex-1 w-px bg-border" style={{ minHeight: '1rem' }} />}
      </div>

      {/* Card */}
      <div
        className={cn(
          'group w-full rounded-xl border border-border bg-background p-3.5 transition-colors duration-200',
          'hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10',
          isLast ? 'mb-1' : 'mb-2',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2.5 text-xs"
          >
            <Link to={to}>{actionLabel}</Link>
          </Button>
        </div>
      </div>
    </li>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusLabel(status: NormalizedBillingStatus): string {
  const labels: Record<NormalizedBillingStatus, string> = {
    missing: 'Sem assinatura',
    trialing: 'Teste ativo',
    active: 'Ativa',
    past_due: 'Pagamento pendente',
    canceled: 'Cancelada',
    incomplete: 'Incompleta',
    unpaid: 'Sem pagamento confirmado',
    paused: 'Pausada',
  }
  return labels[status]
}

function formatBillingInterval(interval: NormalizedBillingInterval | null): string {
  if (interval === 'monthly') return 'Mensal'
  if (interval === 'annual') return 'Anual'
  return 'Não definido'
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Não definido'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return 'Não definido'
  }
}
