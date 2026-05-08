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
  const spotsPercent = campaign
    ? Math.min(100, Math.round((campaign.claimedSpots / campaign.totalSpots) * 100))
    : 0
  const isActive = Boolean(campaign?.enabled && displayedTimeLeft)

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
    <section className="overflow-hidden rounded-lg border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#fef2f2_100%)] shadow-md shadow-orange-100/70">
      <div className="grid gap-5 p-5 lg:grid-cols-[1.35fr_0.65fr] lg:p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-lg shadow-orange-200">
            <Flame className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-orange-700">
              {campaign.name}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Primeiro mês com condição especial para as 100 primeiras clínicas.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              {campaign.claimedSpots} de {campaign.totalSpots} clínicas já garantiram essa
              condição. Garanta sua vaga antes que a oferta acabe.
            </p>

            <div className="mt-5 max-w-xl">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-orange-800">
                <span>Últimas vagas da condição de lançamento</span>
                <span>{campaign.claimedSpots}/{campaign.totalSpots}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-orange-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#dc2626)]"
                  style={{ width: `${spotsPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-700">
            <Clock3 className="h-4 w-4" />
            {isActive ? 'Oferta termina em:' : 'Oferta encerrada'}
          </div>
          {isActive && displayedTimeLeft ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <TimePart value={displayedTimeLeft.days} label="dias" />
              <TimePart value={displayedTimeLeft.hours} label="horas" />
              <TimePart value={displayedTimeLeft.minutes} label="min" />
              <TimePart value={displayedTimeLeft.seconds} label="seg" />
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-slate-600">
              A condição especial não está disponível no momento.
            </p>
          )}
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            Garanta seu preço promocional antes que acabe.
          </p>
        </div>
      </div>
    </section>
  )
}

function TimePart({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-slate-950 px-2 py-3 text-center text-white">
      <p className="text-xl font-black tabular-nums">{String(value).padStart(2, '0')}</p>
      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-orange-200">
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
