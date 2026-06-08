import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type HomeQuickActionCardTone = 'neutral' | 'primary' | 'warning' | 'danger'

type BaseProps = {
  title: string
  description?: string
  icon?: LucideIcon
  /**
   * Optional badge — typically a count of pending items (e.g. "3").
   * Rendered as a pill next to the title.
   */
  badge?: string | number
  tone?: HomeQuickActionCardTone
  disabled?: boolean
  className?: string
}

type LinkCardProps = BaseProps & {
  to: string
  onClick?: never
}

type ButtonCardProps = BaseProps & {
  onClick: () => void
  to?: never
}

type HomeQuickActionCardProps = LinkCardProps | ButtonCardProps

// ── Tone maps ─────────────────────────────────────────────────────────────────

const TONE_BASE: Record<HomeQuickActionCardTone, string> = {
  neutral: [
    'border-border bg-card',
    'hover:border-primary/40 hover:bg-accent',
  ].join(' '),
  primary: [
    'border-primary/20 bg-primary/5 dark:border-primary/25 dark:bg-primary/10',
    'hover:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/15',
  ].join(' '),
  warning: [
    'border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20',
    'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30',
  ].join(' '),
  danger: [
    'border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-950/20',
    'hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30',
  ].join(' '),
}

const TONE_ICON_BG: Record<HomeQuickActionCardTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary dark:bg-primary/15',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const TONE_BADGE: Record<HomeQuickActionCardTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

// ── Shared card content ───────────────────────────────────────────────────────

function CardContent({
  icon: Icon,
  title,
  description,
  badge,
  tone = 'neutral',
}: Pick<BaseProps, 'icon' | 'title' | 'description' | 'badge' | 'tone'>) {
  return (
    <>
      {Icon && (
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            TONE_ICON_BG[tone],
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="whitespace-normal break-words text-sm font-semibold leading-snug text-foreground">{title}</p>
          {badge !== undefined && badge !== null && String(badge) !== '' && (
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                TONE_BADGE[tone],
              )}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 line-clamp-2 break-words text-xs leading-snug text-muted-foreground">{description}</p>
        )}
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground/50"
        aria-hidden="true"
      />
    </>
  )
}

// ── Shared class builder ──────────────────────────────────────────────────────

function cardClasses(
  tone: HomeQuickActionCardTone,
  disabled: boolean,
  className?: string,
) {
  return cn(
    'flex min-w-0 w-full max-w-full items-center gap-3 overflow-hidden rounded-xl border p-4 text-left shadow-sm',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    TONE_BASE[tone],
    disabled && 'pointer-events-none opacity-50',
    className,
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Premium action card for home/dashboard quick-action grids.
 *
 * Renders as a `<Link>` when `to` is provided, or a `<button>` when `onClick`
 * is provided. Exactly one of the two must be present.
 *
 * Use inside `HomeActionGrid` for consistent spacing.
 */
export function HomeQuickActionCard({
  title,
  description,
  icon,
  to,
  onClick,
  badge,
  tone = 'neutral',
  disabled = false,
  className,
}: HomeQuickActionCardProps) {
  const sharedProps = { icon, title, description, badge, tone }

  if (to !== undefined) {
    return (
      <Link
        to={to as never}
        className={cardClasses(tone, disabled, className)}
        aria-disabled={disabled || undefined}
      >
        <CardContent {...sharedProps} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cardClasses(tone, disabled, className)}
    >
      <CardContent {...sharedProps} />
    </button>
  )
}
