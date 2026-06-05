import { cn } from '@/lib/utils'
import { formatCurrencyBRL } from '@/lib/number-formatters'

// ── Types ─────────────────────────────────────────────────────────────────────

type ServicePriceDurationBadgeProps = {
  durationMinutes?: number | null
  priceFrom?: number | null
  priceTo?: number | null
  isPriceDisplayed?: boolean
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPriceLabel(
  priceFrom: number | null | undefined,
  priceTo: number | null | undefined,
  isPriceDisplayed: boolean | undefined,
): string | null {
  if (isPriceDisplayed === false) return 'Preço sob consulta'
  if (priceFrom != null && priceTo != null) {
    return `${formatCurrencyBRL(priceFrom)} – ${formatCurrencyBRL(priceTo)}`
  }
  if (priceFrom != null) return `A partir de ${formatCurrencyBRL(priceFrom)}`
  if (priceTo != null) return `Até ${formatCurrencyBRL(priceTo)}`
  return 'Preço sob consulta'
}

// ── Chip ─────────────────────────────────────────────────────────────────────

const chipClass =
  'inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground'

// ── Component ─────────────────────────────────────────────────────────────────

export function ServicePriceDurationBadge({
  durationMinutes,
  priceFrom,
  priceTo,
  isPriceDisplayed,
  className,
}: ServicePriceDurationBadgeProps) {
  const priceLabel = buildPriceLabel(priceFrom, priceTo, isPriceDisplayed)
  const hasDuration = durationMinutes != null

  if (!hasDuration && priceLabel == null) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {hasDuration && (
        <span className={chipClass}>
          {durationMinutes} min
        </span>
      )}
      {priceLabel != null && (
        <span className={chipClass}>{priceLabel}</span>
      )}
    </div>
  )
}
