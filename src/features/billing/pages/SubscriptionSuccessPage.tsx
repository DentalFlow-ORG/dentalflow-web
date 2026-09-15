import { Link, useSearch } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Lock,
  type LucideIcon,
  Package,
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
import { BRAZIL_TZ } from '@/lib/brazil-timezone'
import { cn } from '@/lib/utils'

import { clearBillingStatusCache, setCachedBillingStatus } from '../services/billing-status-cache'
import {
  createPortalSession,
  getCurrentBillingStatus,
  syncCheckoutSession,
} from '../services/billing.service'
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
  icon: LucideIcon
  iconBg: string
  iconText: string
  label: string
  description: string
  actionLabel: string
  to: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: Building2,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    label: 'Complete os dados da clínica',
    description:
      'Adicione endereço, telefone, logo e outras informações essenciais da sua clínica.',
    actionLabel: 'Configurar',
    to: '/app/configuracoes',
  },
  {
    icon: Users,
    iconBg: 'bg-violet-50 dark:bg-violet-900/30',
    iconText: 'text-violet-600 dark:text-violet-400',
    label: 'Cadastre sua equipe',
    description: 'Convide dentistas, assistentes e recepcionistas para começarem a usar o sistema.',
    actionLabel: 'Começar',
    to: '/app/equipe',
  },
  {
    icon: CalendarCheck2,
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    label: 'Configure a agenda',
    description: 'Defina horários de atendimento, dias úteis e disponibilidades da sua clínica.',
    actionLabel: 'Configurar',
    to: '/app/agendamentos',
  },
  {
    icon: UserPlus,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    label: 'Adicione seus pacientes',
    description: 'Importe ou cadastre pacientes manualmente para centralizar os atendimentos.',
    actionLabel: 'Adicionar',
    to: '/app/pacientes',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    label: 'Comece a usar',
    description:
      'Agende consultas e acompanhe resultados com relatórios e indicadores em tempo real.',
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
  {
    color: 'bg-emerald-400',
    dx: '-14px',
    dy: '-28px',
    delay: '0.08s',
    pos: { top: '-4px', left: 'calc(50% - 4px)' },
  },
  {
    color: 'bg-blue-400',
    dx: '22px',
    dy: '-18px',
    delay: '0.18s',
    pos: { top: '8%', right: '-6px' },
  },
  {
    color: 'bg-cyan-400',
    dx: '26px',
    dy: '14px',
    delay: '0.04s',
    pos: { bottom: '18%', right: '-8px' },
  },
  {
    color: 'bg-emerald-500',
    dx: '14px',
    dy: '28px',
    delay: '0.13s',
    pos: { bottom: '-4px', left: 'calc(50% - 4px)' },
  },
  {
    color: 'bg-sky-400',
    dx: '-26px',
    dy: '14px',
    delay: '0.22s',
    pos: { bottom: '18%', left: '-8px' },
  },
  {
    color: 'bg-teal-400',
    dx: '-22px',
    dy: '-18px',
    delay: '0.09s',
    pos: { top: '8%', left: '-6px' },
  },
  {
    color: 'bg-indigo-400',
    dx: '6px',
    dy: '-30px',
    delay: '0.16s',
    pos: { top: '-2px', right: 'calc(50% - 4px)' },
  },
  {
    color: 'bg-emerald-300',
    dx: '-6px',
    dy: '30px',
    delay: '0.05s',
    pos: { bottom: '-2px', right: 'calc(50% - 4px)' },
  },
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
  // The outer div IS the CSS Grid container. On mobile: auto-height stacked rows.
  // On lg+: fixed-minimum-height two-column layout with stretch alignment.
  // min-h calc: header h-20 (5rem) + main py-8 top+bottom (4rem) = 9rem.

  return (
    <div
      className={cn(
        'grid w-full overflow-hidden rounded-2xl border border-border bg-card',
        'shadow-xl shadow-slate-900/10 dark:shadow-none',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-500',
        'grid-rows-[auto_auto]',
        'lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1fr_1px_1fr] lg:grid-rows-[1fr]',
        'xl:grid-cols-[3fr_1px_2fr]',
      )}
    >
      {/* ── Left column ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex flex-col overflow-hidden',
          'border-b border-border lg:border-b-0',
          'p-5 sm:p-8 lg:p-8 xl:p-12',
        )}
      >
        {/* Ambient glows — hidden on mobile to avoid any clipping/overflow issues */}
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 hidden h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/5 sm:block"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-16 left-24 hidden h-48 w-48 rounded-full bg-cyan-200/20 blur-3xl dark:bg-transparent sm:block"
          aria-hidden="true"
        />

        {/* 1 — Brand */}
        <div className="relative shrink-0">
          <BrandLink />
        </div>

        {/* 2 — Hero: flex-1 centers content vertically on desktop; auto-height on mobile */}
        <div
          className={cn(
            'relative flex flex-col items-center text-center',
            'gap-5 py-6 sm:gap-6 sm:py-8 lg:flex-1 lg:justify-center lg:gap-7 lg:py-10',
          )}
        >
          <SuccessStatusIcon state={visualState} />

          <StatusPill status={status?.status ?? 'incomplete'} state={visualState} />

          <div className="w-full max-w-md">
            <h1
              className={cn(
                'font-extrabold tracking-tight text-foreground',
                'text-3xl sm:text-4xl lg:text-5xl',
              )}
            >
              {visualState === 'confirmed'
                ? 'Assinatura confirmada'
                : visualState === 'processing'
                  ? 'Confirmando assinatura'
                  : 'Pagamento recebido'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              {visualState === 'confirmed'
                ? 'Seu plano foi ativado e o acesso ao DentalFlow está liberado. Tudo pronto para você começar!'
                : visualState === 'processing'
                  ? 'A Stripe confirmou o checkout. Estamos sincronizando a assinatura para liberar seu acesso com segurança.'
                  : 'A Stripe confirmou o pagamento. A sincronização ainda está em andamento no DentalFlow.'}
            </p>
          </div>

          {/* Feedback */}
          {message && (
            <div className="w-full max-w-md">
              <InlineFeedback tone="warning">{message}</InlineFeedback>
            </div>
          )}
          {!message && visualState === 'attention' && (
            <div className="w-full max-w-md">
              <InlineFeedback tone="warning">
                A assinatura ainda aparece como pendente. Isso pode acontecer por atraso no webhook
                da Stripe. Verifique novamente ou abra o portal de assinatura.
              </InlineFeedback>
            </div>
          )}

          {/* Subscription summary — confirmed state only */}
          {isConfirmed && status && (
            <div className="w-full max-w-md">
              <SubscriptionSummary status={status} />
            </div>
          )}

          {/* Retry counter */}
          {visualState === 'processing' && (
            <p className="text-sm text-muted-foreground">
              Tentativa {Math.min(attempt, MAX_ATTEMPTS)} de {MAX_ATTEMPTS}
            </p>
          )}
        </div>

        {/* 3 — Actions */}
        <div className="relative shrink-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="h-11 w-full text-sm sm:h-12 sm:w-auto sm:min-w-[196px] sm:text-base"
              disabled={!isConfirmed}
            >
              <Link to="/app">
                Ir para o painel
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full text-sm sm:h-12 sm:w-auto sm:min-w-[196px] sm:text-base"
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
            >
              {isOpeningPortal ? (
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              ) : (
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              Gerenciar assinatura
            </Button>
            {!isConfirmed && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="h-11 w-full text-sm sm:h-12 sm:w-auto sm:text-base"
                onClick={handleManualRefresh}
                disabled={isChecking}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                ) : (
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                Verificar novamente
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Lock className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
            Ambiente seguro e criptografado
          </div>
        </div>
      </div>

      {/* ── Column divider (desktop only) ────────────────────────────────── */}
      <div className="hidden bg-border lg:block" aria-hidden="true" />

      {/* ── Right column ─────────────────────────────────────────────────── */}
      <div className="flex flex-col p-5 sm:p-8 lg:p-8 xl:p-12">
        {/* Header: stacks on mobile, side-by-side on sm+ */}
        <div className="shrink-0 pb-5 sm:pb-6 lg:pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Rocket + title group */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">Próximos passos</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Siga os passos abaixo para configurar sua clínica e aproveitar ao máximo o
                  DentalFlow.
                </p>
              </div>
            </div>

            {/* Time estimate card: full-width on mobile, shrunk on sm+ */}
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-muted/40',
                'px-4 py-3 sm:flex-col sm:items-center sm:gap-1 sm:px-4 sm:py-3 sm:text-center',
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Tempo estimado</span>
              </div>
              <p className="text-base font-semibold tabular-nums text-foreground sm:mt-0.5">
                15–20 min
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <ol className="flex flex-col gap-0">
          {onboardingSteps.map((step, index) => (
            <StepItem
              key={step.to}
              step={step}
              index={index}
              isLast={index === onboardingSteps.length - 1}
            />
          ))}
        </ol>

        {/* Footer trust block — anchored to bottom of column */}
        <div
          className="mt-auto shrink-0 pt-5 sm:pt-6 animate-in fade-in-0 duration-700"
          style={{ animationDelay: '380ms', animationFillMode: 'both' }}
        >
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3.5 dark:bg-muted/20">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Comece no seu ritmo
            </p>
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Ambiente seguro
                </span>
              </div>
              <div className="h-6 w-px bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Lock
                    className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Dados protegidos
                </span>
              </div>
              <div className="h-6 w-px bg-border" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
                  <Sparkles
                    className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Configuração rápida
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuccessStatusIcon({ state }: { state: 'confirmed' | 'processing' | 'attention' }) {
  // Icon container scales up progressively: 112px mobile → 128px sm → 144px lg
  const containerCls = 'h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36'
  const iconCls = 'h-14 w-14 sm:h-16 sm:w-16'

  if (state === 'confirmed') {
    return (
      <div
        className={cn('relative flex items-center justify-center', containerCls)}
        role="img"
        aria-label="Assinatura confirmada"
      >
        {/* Outer pulse ring — inset scales with icon */}
        <span
          className="absolute inset-[-10px] rounded-full bg-emerald-300/25 df-ring-pulse sm:inset-[-12px] lg:inset-[-14px] dark:bg-emerald-500/15"
          aria-hidden="true"
        />
        {/* Inner pulse ring */}
        <span
          className="absolute inset-[-4px] rounded-full bg-emerald-200/30 df-ring-pulse sm:inset-[-5px] lg:inset-[-6px] dark:bg-emerald-500/20"
          style={{ animationDelay: '0.45s' }}
          aria-hidden="true"
        />
        {/* Main circle */}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-100 df-success-pop dark:bg-emerald-900/40">
          <CheckCircle2
            className={cn(iconCls, 'text-emerald-600 dark:text-emerald-400')}
            aria-hidden="true"
          />
        </div>
        {/* Confetti particles */}
        {confettiDots.map(({ color, dx, dy, delay, pos }, i) => (
          <span
            key={i}
            className={cn('df-particle absolute h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5', color)}
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
        className={cn(
          'flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30',
          containerCls,
        )}
        role="img"
        aria-label="Processando confirmação"
      >
        <Loader2 className={cn(iconCls, 'animate-spin text-primary')} aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30',
        containerCls,
      )}
      role="img"
      aria-label="Atenção: sincronização pendente"
    >
      <ShieldCheck
        className={cn(iconCls, 'text-amber-600 dark:text-amber-400')}
        aria-hidden="true"
      />
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
    confirmed:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-400',
    processing:
      'border-blue-200 bg-blue-50 text-primary dark:border-blue-800/40 dark:bg-blue-900/30',
    attention:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/30 dark:text-amber-400',
  }[state]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide',
        tone,
      )}
    >
      Status: {getStatusLabel(status)}
    </span>
  )
}

function SubscriptionSummary({ status }: { status: CurrentBillingStatus }) {
  const renewalDate = status.status === 'trialing' ? status.trialEndsAt : status.currentPeriodEnd

  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Package, label: 'Plano', value: status.planName ?? 'Não definido' },
    { icon: RefreshCw, label: 'Ciclo', value: formatBillingInterval(status.billingInterval) },
    { icon: CheckCircle2, label: 'Status', value: getStatusLabel(status.status) },
    {
      icon: Calendar,
      label: status.cancelAtPeriodEnd ? 'Acesso até' : 'Próxima renovação',
      value: formatDate(renewalDate),
    },
  ]

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 text-left sm:p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Resumo da assinatura
      </p>
      <dl className="divide-y divide-border">
        {rows.map(({ icon: RowIcon, label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
          >
            <dt className="flex items-center gap-2 text-muted-foreground">
              <RowIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="shrink-0">{label}</span>
            </dt>
            <dd className="min-w-0 truncate text-right font-semibold text-foreground">{value}</dd>
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
  const { icon: Icon, iconBg, iconText, label, description, actionLabel, to } = step

  return (
    <li
      className={cn(
        'flex gap-2 animate-in fade-in-0 slide-in-from-left-2 duration-500',
        !isLast && 'pb-3 sm:pb-4',
      )}
      style={{ animationDelay: `${index * 65}ms`, animationFillMode: 'both' }}
    >
      {/* Number bubble + vertical connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/15 sm:h-8 sm:w-8">
          {index + 1}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Card — entire card is the link */}
      <Link
        to={to}
        aria-label={label}
        className={cn(
          'group/card block w-full rounded-xl border border-border bg-background',
          'p-3.5 sm:p-4 lg:p-5',
          'transition-all duration-200',
          'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm',
          'dark:hover:bg-primary/10 dark:hover:shadow-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'mb-0',
        )}
      >
        {/* Icon + text */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
              'transition-all duration-200 group-hover/card:scale-105',
              iconBg,
            )}
          >
            <Icon className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5', iconText)} aria-hidden="true" />
          </div>

          {/* Text block with responsive action label */}
          <div className="min-w-0 flex-1">
            {/* On xl+: title and action side-by-side */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <span
                className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary xl:flex"
                aria-hidden="true"
              >
                {actionLabel}
                <ArrowRight
                  className="h-3 w-3 transition-transform duration-200 group-hover/card:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>

            {/* On mobile and lg: action below description */}
            <div className="mt-1.5 flex items-center justify-end xl:hidden">
              <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                {actionLabel}
                <ArrowRight
                  className="h-3 w-3 transition-transform duration-200 group-hover/card:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
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
      timeZone: BRAZIL_TZ,
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return 'Não definido'
  }
}
