import { Clock3, Flame } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { BillingCampaign } from '../types/billing.types'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

type Props = {
  campaign: BillingCampaign | null
}

export function LaunchOfferBanner({ campaign }: Props) {
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
    if (!endsAt) {
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt))
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [endsAt])

  if (!campaign) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-lg border border-orange-200 bg-card shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_0.65fr] lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <span className="df-orange-flame-flicker" aria-hidden="true">
              <Flame className="h-6 w-6" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              {campaign.name}
            </p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
              Condição especial de lançamento para clínicas que querem organizar a operação agora.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {hasSpots
                ? `${claimedSpots} de ${totalSpots} clínicas já garantiram essa condição.`
                : 'A condição especial está vinculada à campanha ativa.'}{' '}
              A oferta usa os dados atuais da campanha e pode encerrar quando o prazo terminar.
            </p>

            {hasSpots && (
              <div className="mt-5 max-w-xl">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-orange-700">
                  <span>Vagas da condição de lançamento</span>
                  <span>
                    {claimedSpots}/{totalSpots}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-orange-50">
                  <div
                    className="h-full rounded-full bg-orange-600"
                    style={{ width: `${spotsPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {isActive ? 'Oferta termina em' : 'Oferta encerrada'}
          </div>

          {isActive && displayedTimeLeft && (
            <p className="sr-only">
              Oferta encerra em {displayedTimeLeft.days} dias, {displayedTimeLeft.hours} horas
              e {displayedTimeLeft.minutes} minutos.
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

          <p className="mt-4 rounded-md bg-card px-3 py-2 text-xs font-semibold leading-5 text-orange-700">
            Sem cartão no teste grátis. A assinatura só avança quando você escolher continuar.
          </p>
        </div>
      </div>
    </section>
  )
}

function TimePart({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-card px-2 py-3 text-center text-foreground shadow-sm">
      <p className="text-lg font-bold tabular-nums sm:text-xl">{String(value).padStart(2, '0')}</p>
      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-orange-700">
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
