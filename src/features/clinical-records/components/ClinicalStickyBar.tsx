import { AlertCircle, CheckCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { AutosaveStatus } from '../hooks/useClinicalRecordAutosave'
import type { ClinicalRecord } from '../types/clinical-record.types'
import { isClinicalRecordEditable } from '../utils/clinical-record-status-rules'
import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  record: ClinicalRecord
  isSaving: boolean
  autosaveStatus: AutosaveStatus
  onSaveDraft: () => void
  onComplete: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Compact sticky bar that stays below the app header as the user scrolls.
 * Shows patient identity and—for DRAFT records—quick Save + Complete actions.
 * Destructive status transitions (Lock, Cancel, Restore) remain in the full
 * ClinicalRecordActions bar so they keep their confirmation dialogs.
 *
 * Breakout pattern: negative horizontal margins cancel the parent <main> padding
 * so the bar stretches edge-to-edge while keeping internal content aligned.
 */
export function ClinicalStickyBar({
  record,
  isSaving,
  autosaveStatus,
  onSaveDraft,
  onComplete,
}: Props) {
  const isDraft = isClinicalRecordEditable(record.status)

  return (
    <div
      className={cn(
        // Breakout: cancel parent <main> px-4 / sm:px-6 / lg:px-8 then restore internally
        '-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
        // Sticky below app header (h-20 = top-20) and above most content
        'sticky top-20 z-20',
        // Visual style — matches app header aesthetic
        'border-b border-border bg-background/95 backdrop-blur-sm',
        'print:hidden',
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 py-2.5">

        {/* ── Patient identity ─────────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
            aria-hidden="true"
          >
            {getAvatarInitials(record.patientName)}
          </div>
          <span className="truncate text-sm font-semibold text-foreground">
            {record.patientName}
          </span>
          <ClinicalRecordStatusBadge status={record.status} />
        </div>

        {/* ── Quick actions (DRAFT only) ───────────────────────────── */}
        {isDraft && (
          <div className="flex shrink-0 items-center gap-2">
            <CompactAutosaveIndicator status={autosaveStatus} />

            {/* Save — secondary action, hidden on small screens to keep the
                bar uncluttered. The primary "Concluir" is always visible.  */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="hidden sm:flex"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>

            {/* Complete — primary action, text always visible on every viewport.
                min-w keeps the button from becoming a square icon on very
                narrow screens; the patient name truncates to give it room.  */}
            <Button
              size="sm"
              onClick={onComplete}
              disabled={isSaving}
              className="min-w-[5.5rem]"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Concluir
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CompactAutosaveIndicator ──────────────────────────────────────────────────

function CompactAutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === 'idle' || status === 'pending') return null

  return (
    <span
      className="flex items-center gap-1 text-xs text-muted-foreground"
      aria-live="polite"
      aria-atomic="true"
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          {/* Text label visible from sm up — icon alone serves mobile */}
          <span className="hidden sm:inline">Salvando</span>
        </>
      )}
      {status === 'saved' && (
        <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-amber-500" aria-hidden="true" />
          <span className="hidden sm:inline text-amber-600 dark:text-amber-400">Erro ao salvar</span>
        </>
      )}
    </span>
  )
}
