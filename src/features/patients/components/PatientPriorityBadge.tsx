import { cn } from '@/lib/utils'

import { PRIORITY_LABEL } from '../constants/attention-display'
import type { AttentionPriority } from '../types/attention.types'

// ── Tone map ──────────────────────────────────────────────────────────────────

const PRIORITY_CLASSES: Record<AttentionPriority, string> = {
  HIGH: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-300',
  MEDIUM:
    'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-300',
  LOW: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400',
}

type PatientPriorityBadgeProps = {
  priority: AttentionPriority
  className?: string
}

/**
 * Renders a patient attention priority as a labelled badge.
 *
 * Distinct colours per tier (HIGH = red, MEDIUM = amber, LOW = slate) with
 * text labels so the meaning is accessible without colour discrimination.
 */
export function PatientPriorityBadge({ priority, className }: PatientPriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  )
}
