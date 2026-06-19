import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type HomeKpiCardTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

type HomeKpiCardProps = {
  /** Metric label (e.g. "Consultas hoje"). */
  label: string
  /** Metric value as a pre-formatted string (e.g. "12" or "R$ 1.250,00"). */
  value: string
  /** Optional secondary line below the value (e.g. "vs. 8 ontem"). */
  description?: string
  /** Lucide icon rendered in a toned icon box on the left. */
  icon?: LucideIcon
  /** Visual tone applied to card border, icon bg, and value text. */
  tone?: HomeKpiCardTone
  /** Replaces the value with a shimmer placeholder while data loads. */
  isLoading?: boolean
  className?: string
}

// ── Tone maps ─────────────────────────────────────────────────────────────────

const TONE_CARD: Record<HomeKpiCardTone, string> = {
  neutral: 'border-border bg-card',
  primary: 'border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10',
  success: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/40 dark:bg-emerald-950/20',
  warning: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/40 dark:bg-amber-950/20',
  danger: 'border-red-200 bg-red-50/70 dark:border-red-800/40 dark:bg-red-950/20',
  info: 'border-blue-200 bg-blue-50/70 dark:border-blue-800/40 dark:bg-blue-950/20',
}

const TONE_ICON_BG: Record<HomeKpiCardTone, string> = {
  neutral: 'bg-muted',
  primary: 'bg-primary/10 dark:bg-primary/15',
  success: 'bg-emerald-100 dark:bg-emerald-900/40',
  warning: 'bg-amber-100 dark:bg-amber-900/40',
  danger: 'bg-red-100 dark:bg-red-900/40',
  info: 'bg-blue-100 dark:bg-blue-900/40',
}

const TONE_ICON_COLOR: Record<HomeKpiCardTone, string> = {
  neutral: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  danger: 'text-red-700 dark:text-red-400',
  info: 'text-blue-700 dark:text-blue-400',
}

const TONE_VALUE: Record<HomeKpiCardTone, string> = {
  neutral: 'text-card-foreground',
  primary: 'text-primary',
  success: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-red-700 dark:text-red-300',
  info: 'text-blue-700 dark:text-blue-300',
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Premium KPI metric card for home/dashboard use.
 *
 * Designed for 2–4 column grids. Supports icons, tones, a loading state,
 * and an optional description line for secondary context.
 *
 * Does not fetch data — pass pre-formatted value strings.
 */
export function HomeKpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
  isLoading = false,
  className,
}: HomeKpiCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-sm',
        TONE_CARD[tone],
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            TONE_ICON_BG[tone],
          )}
          aria-hidden="true"
        >
          <Icon className={cn('h-4 w-4', TONE_ICON_COLOR[tone])} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium text-muted-foreground">{label}</p>

        {isLoading ? (
          <div
            className="mt-1.5 h-5 w-14 animate-pulse rounded bg-muted"
            aria-label="Carregando..."
            role="status"
          />
        ) : (
          <p
            className={cn('mt-1 text-xl font-semibold leading-none tabular-nums', TONE_VALUE[tone])}
          >
            {value}
          </p>
        )}

        {description && !isLoading && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
