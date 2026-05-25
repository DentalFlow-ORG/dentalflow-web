import { Clock3, Flame, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { BillingCampaign, BillingInterval } from '../types/billing.types'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

type Props = {
  campaign: BillingCampaign | null
  billingInterval: BillingInterval
  hasMonthlyPromo: boolean
}

export function LaunchOfferBanner({ campaign, billingInterval, hasMonthlyPromo }: Props) {
  const endsAt = useMemo(
    () => parsePromotionDate(campaign?.promotionEndDate),
    [campaign?.promotionEndDate],
  )
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(endsAt))
  const displayedTimeLeft = endsAt ? timeLeft : null
  const totalSpots = campaign?.totalSpots ?? 0
  const claimedSpots = campaign?.claimedSpots ?? 0
  const spotsPercent =
    totalSpots > 0 ? Math.min(100, Math.round((claimedSpots / totalSpots) * 100)) : 0
  const isActive = Boolean(campaign?.enabled && displayedTimeLeft)
  const hasSpots = totalSpots > 0

  useEffect(() => {
    if (!endsAt) return
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt))
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [endsAt])

  if (!campaign) return null

  // Monthly + active promo: launch offer card with animated flame and countdown
  if (billingInterval === 'MONTHLY' && hasMonthlyPromo) {
    return (
      <section
        className="overflow-hidden rounded-lg border border-amber-400/55 bg-gradient-to-br from-amber-50 to-white shadow-md dark:border-amber-500/25 dark:from-amber-950/20 dark:to-card dark:shadow-lg"
        aria-label="Condição especial de lançamento"
      >
        <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_0.65fr] lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Animated flame icon — purely decorative */}
            <div
              className="relative flex h-12 w-12 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <div className="absolute inset-0 motion-safe:animate-pulse rounded-xl bg-amber-500/30 blur-md" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/25">
                <span className="df-orange-flame-flicker">
                  <Flame className="h-6 w-6 text-white drop-shadow" />
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Condição de lançamento
              </p>
              <h2 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
                Condição especial de lançamento
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Comece com um valor reduzido no primeiro mês e valide o impacto do DentalFlow na
                rotina da sua clínica.
              </p>

              {hasSpots && (
                <div className="mt-5 max-w-xl">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <span>Clínicas com essa condição ativa</span>
                    <span>
                      {claimedSpots}/{totalSpots}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-950/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${spotsPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-700/40 dark:bg-amber-950/15">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {isActive ? 'Oferta termina em' : 'Oferta encerrada'}
            </div>

            {isActive && displayedTimeLeft && (
              <p className="sr-only">
                Oferta encerra em {displayedTimeLeft.days} dias, {displayedTimeLeft.hours} horas e{' '}
                {displayedTimeLeft.minutes} minutos.
              </p>
            )}

            <div aria-hidden="true">
              {isActive && displayedTimeLeft ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <TimePart value={displayedTimeLeft.days} label="dias" />
                  <TimePart value={displayedTimeLeft.hours} label="horas" />
                  <TimePart value={displayedTimeLeft.minutes} label="min" />
                  <TimePart value={displayedTimeLeft.seconds} label="seg" />
                </div>
              ) : (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  A condição especial não está disponível no momento.
                </p>
              )}
            </div>

            <p className="mt-4 rounded-md border border-amber-100 bg-white/80 px-3 py-2 text-xs font-semibold leading-5 text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-300">
              Após o primeiro mês, o plano continua pelo valor mensal normal.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Annual mode: value/savings card — no urgency, no first-month messaging
  if (billingInterval === 'YEARLY') {
    return (
      <section
        className="overflow-hidden rounded-lg border border-emerald-500/25 bg-gradient-to-r from-emerald-50/60 to-white shadow-sm dark:border-emerald-700/30 dark:from-emerald-950/15 dark:to-card"
        aria-label="Plano anual selecionado"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start lg:p-6">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            aria-hidden="true"
          >
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Plano anual selecionado
            </p>
            <p className="mt-1.5 text-base font-semibold leading-snug text-foreground sm:text-lg">
              Mais previsibilidade, melhor custo-benefício e foco total em estruturar a gestão da
              sua clínica.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sem desconto de primeiro mês: o benefício do anual está no valor equivalente mensal
              mais econômico.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Monthly + no active promo: nothing
  return null
}

function TimePart({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-amber-200/80 bg-white px-2 py-3 text-center shadow-sm dark:border-amber-800/40 dark:bg-card">
      <p className="text-xl font-extrabold tabular-nums text-foreground sm:text-2xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        {label}
      </p>
    </div>
  )
}

function parsePromotionDate(value: string | undefined) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getTimeLeft(endsAt: Date | null): TimeLeft | null {
  if (!endsAt) return null
  const diff = endsAt.getTime() - Date.now()
  if (diff <= 0) return null

  const totalSeconds = Math.floor(diff / 1_000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}
