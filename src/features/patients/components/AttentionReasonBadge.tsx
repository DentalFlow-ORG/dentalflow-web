import { cn } from '@/lib/utils'

import { REASON_LABEL } from '../constants/attention-display'
import type { AttentionReason } from '../types/attention.types'

// ── Tone map ──────────────────────────────────────────────────────────────────
//
// Uses a distinct visual tone per reason so staff can tell them apart at a
// glance without relying on color alone (label always present).
//
// Light / dark variants are explicit so the badges remain readable in both modes.

const REASON_CLASSES: Record<AttentionReason, string> = {
  INACTIVE:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300',
  NO_UPCOMING_APPOINTMENT:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/25 dark:text-blue-300',
  PENDING_PAYMENT:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/25 dark:text-amber-300',
  RECENTLY_CANCELED:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/25 dark:text-rose-400',
  RECENT_NO_SHOW:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-900/25 dark:text-red-400',
}

type AttentionReasonBadgeProps = {
  reason: AttentionReason
  className?: string
}

/**
 * Renders a patient attention reason as a labelled, colour-coded badge.
 *
 * The label is always visible in text — colour is supplementary, not the
 * sole indicator. Maps directly to the `AttentionReason` enum values
 * returned by the backend `/patients/attention` endpoint.
 */
export function AttentionReasonBadge({ reason, className }: AttentionReasonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        REASON_CLASSES[reason],
        className,
      )}
    >
      {REASON_LABEL[reason]}
    </span>
  )
}
