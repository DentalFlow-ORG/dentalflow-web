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

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 6
const RETRY_INTERVAL_MS = 2500

// ── Onboarding steps ──────────────────────────────────────────────────────────
// Routes verified against router.tsx:
//   /app/configuracoes → SettingsPage (OWNER)
//   /app/equipe        → TeamPage (OWNER)
//   /app/agendamentos  → AppointmentsPage (OWNER, ASSISTANT)
//   /app/pacientes     → PatientsPage (OWNER, ASSISTANT)
//   /app               → DashboardPage (OWNER, ASSISTANT)

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

// ── Confetti dots ─────────────────────────────────────────────────────────────

type ConfettiDot = {
  color: string
  dx: string
  dy: string
  delay: string
  pos: React.CSSProperties
}

const confettiDots: ConfettiDot[] = [
  { color: 'bg-emerald-400', dx: '-14px', dy: '-28px', delay: '0.08s', pos: { top: '-4px', left: 'calc(50% - 4px)' } },
  { color: 'bg-blue-400',    dx:  '22px', dy: '-18px', delay: '0.18s', pos: { top: '8%',  right: '-6px' } },
  { color: 'bg-cyan-400',    dx:  '26px', dy:  '14px', delay: '0.04s', pos: { bottom: '18%', right: '-8px' } },
  { color: 'bg-emerald-500', dx:  '14px', dy:  '28px', delay: '0.13s', pos: { bottom: '-4px', left: 'calc(50% - 4px)' } },
  { color: 'bg-sky-400',     dx: '-26px', dy:  '14px', delay: '0.22s', pos: { bottom: '18%', left: '-8px' } },
  { color: 'bg-teal-400',    dx: '-22px', dy: '-18px', delay: '0.09s', pos: { top: '8%',  left: '-6px' } },
  { color: 'bg-indigo-400',  dx:   '6px', dy: '-30px', delay: '0.16s', pos: { top: '-2px', right: 'calc(50% - 4px)' } },
  { color: 'bg-emerald-300', dx:  '-6px', dy:  '30px', delay: '0.05s', pos: { bottom: '-2px', right: 'calc(50% - 4px)' } },
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

  // ── Stripe sync/polling (unchanged) ────────────────────────────────────────

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

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  // ── Layout ─────────────────────────────────────────────────────────────────
  // The outer div IS the grid container so CSS Grid's min-height correctly
  // stretches both columns to fill the authenticated app viewport area.
  // Calculation: header h-20 (5rem) + main py-8 top (2rem) + pb-8 bottom (2rem) = 9rem.

  return (
    <div
      className={cn(
        'grid w-full rounded-2xl border border-border bg-card',
        'shadow-lg shadow-slate-950/8 dark:shadow-none',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-500',
        // Stack vertically on mobile/tablet, two columns on desktop
        'grid-rows-[auto_auto]',
        'lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[3fr_1px_2fr] lg:grid-rows-[1fr]',
      )}
    >
      {/* ── Left column: logo · hero · actions ──────────────────────────── */}
      <div className="flex flex-col border-b border-border p-6 sm:p-8 lg:border-b-0 lg:p-10">

        {/* 1 — Logo */}
        <div className="shrink-0">
          <BrandLink compact />
        </div>

        {/* 2 — Hero (fills remaining height, centers content vertically) */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center sm:py-10">

          <SuccessStatusIcon state={visualState} />

          <StatusPill status={status?.status ?? 'incomplete'} state={visualState} />

          <div className="max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {visualState === 'confirmed'
                ? 'Assinatura confirmada'
                : visualState === 'processing'
                  ? 'Confirmando assinatura'
                  : 'Pagamento recebido'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
              {visualState === 'confirmed'
                ? 'Seu plano foi ativado e o acesso ao DentalFlow está liberado. Tudo pronto para você começar!'
                : visualState === 'processing'
                  ? 'A Stripe confirmou o checkout. Estamos sincronizando a assinatura para liberar seu acesso com segurança.'
                  : 'A Stripe confirmou o pagamento. A sincronização ainda está em andamento no DentalFlow.'}
            </p>
          </div>

          {/* Error / warning feedback */}
          {message && (
            <div className="w-full max-w-sm">
              <InlineFeedback tone="warning">{message}</InlineFeedback>
            </div>
          )}
          {!message && visualState === 'attention' && (
            <div className="w-full max-w-sm">
              <InlineFeedback tone="warning">
                A assinatura ainda aparece como pendente. Isso pode acontecer por atraso no webhook da Stripe. Verifique novamente ou abra o portal de assinatura.
              </InlineFeedback>
            </div>
          )}

          {/* Subscription summary — confirmed state only */}
          {isConfirmed && status && (
            <div className="w-full max-w-sm">
              <SubscriptionSummary status={status} />
            </div>
          )}

          {/* Retry counter */}
          {visualState === 'processing' && (
            <p className="text-xs text-muted-foreground">
              Tentativa {Math.min(attempt, MAX_ATTEMPTS)} de {MAX_ATTEMPTS}
            </p>
          )}
        </div>

        {/* 3 — Actions */}
        <div className="shrink-0 space-y-3">
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

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Ambiente seguro e criptografado
          </div>
        </div>
      </div>

      {/* ── Column divider (desktop only) ────────────────────────────────── */}
      <div className="hidden bg-border lg:block" aria-hidden="true" />

      {/* ── Right column: onboarding timeline ────────────────────────────── */}
      <div className="flex flex-col p-6 sm:p-8 lg:p-10">

        {/* Header */}
        <div className="shrink-0 pb-5 sm:pb-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Próximos passos</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Siga os passos abaixo para configurar sua clínica e aproveitar ao máximo o DentalFlow.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Tempo estimado · 15–20 min
          </div>
        </div>

        {/* Timeline — fills remaining column height */}
        <ol className="flex flex-1 flex-col gap-0">
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
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuccessStatusIcon({ state }: { state: 'confirmed' | 'processing' | 'attention' }) {
  if (state === 'confirmed') {
    return (
      <div
        className="relative flex h-28 w-28 items-center justify-center"
        role="img"
        aria-label="Assinatura confirmada"
      >
        {/* Outer pulse ring */}
        <span
          className="absolute inset-[-10px] rounded-full bg-emerald-300/25 df-ring-pulse dark:bg-emerald-500/15"
          aria-hidden="true"
        />
        {/* Inner pulse ring */}
        <span
          className="absolute inset-[-4px] rounded-full bg-emerald-200/30 df-ring-pulse dark:bg-emerald-500/20"
          style={{ animationDelay: '0.45s' }}
          aria-hidden="true"
        />
        {/* Main icon circle */}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-100 df-success-pop dark:bg-emerald-900/40">
          <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        {/* Confetti particles */}
        {confettiDots.map(({ color, dx, dy, delay, pos }, i) => (
          <span
            key={i}
            className={cn('df-particle absolute h-2 w-2 rounded-full', color)}
            style={{ ...pos, animationDelay: delay, '--dx': dx, '--dy': dy } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
        role="img"
        aria-label="Processando confirmação"
      >
        <Loader2 className="h-14 w-14 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
      role="img"
      aria-label="Atenção: sincronização pendente"
    >
      <ShieldCheck className="h-14 w-14 text-amber-600 dark:text-amber-400" aria-hidden="true" />
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
    attention:  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400',
  }[state]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-widest',
      tone,
    )}>
      Status: {getStatusLabel(status)}
    </span>
  )
}

function SubscriptionSummary({ status }: { status: CurrentBillingStatus }) {
  const renewalDate =
    status.status === 'trialing' ? status.trialEndsAt : status.currentPeriodEnd

  const rows = [
    { label: 'Plano',            value: status.planName ?? 'Não definido' },
    { label: 'Ciclo',            value: formatBillingInterval(status.billingInterval) },
    { label: 'Status',           value: getStatusLabel(status.status) },
    { label: 'Próxima renovação',value: formatDate(renewalDate) },
  ]

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 text-left">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
      className={cn(
        'flex gap-3 animate-in fade-in-0 slide-in-from-left-2 duration-500',
        !isLast && 'flex-1',
      )}
      style={{ animationDelay: `${index * 65}ms`, animationFillMode: 'both' }}
    >
      {/* Number bubble + connector line */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15">
          {index + 1}
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-border" />
        )}
      </div>

      {/* Card */}
      <div
        className={cn(
          'group w-full rounded-xl border border-border bg-background p-4',
          'transition-colors duration-200',
          'hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10',
          isLast ? 'mb-1' : 'mb-3',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary"
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
            className="h-7 shrink-0 px-2.5 text-xs font-semibold text-primary hover:text-primary"
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
    missing:   'Sem assinatura',
    trialing:  'Teste ativo',
    active:    'Ativa',
    past_due:  'Pagamento pendente',
    canceled:  'Cancelada',
    incomplete:'Incompleta',
    unpaid:    'Sem pagamento confirmado',
    paused:    'Pausada',
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
