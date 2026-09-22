import { Clock } from 'lucide-react'
import { useState } from 'react'

import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'

import { usePatientClinicalTimeline } from '../hooks/usePatientClinicalTimeline'
import type { ClinicalRecord } from '../types/clinical-record.types'
import { ClinicalTimeline } from './ClinicalTimeline'

// ── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_VISIBLE = 5

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  /** The id of the record currently being edited — excluded from the history list. */
  currentRecordId: string
  /** Patient identifier: `patientEmail ?? patientName` — same convention as odontogram. */
  identifier: string
  patientId?: string | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PatientHistoryPanel({ currentRecordId, identifier, patientId }: Props) {
  const { records, isLoading, error } = usePatientClinicalTimeline(identifier, patientId)
  const [showAll, setShowAll] = useState(false)

  // Filter out the record currently being edited, then sort most-recent-first.
  // String comparison is safe for ISO 8601 timestamps.
  const historyRecords: ClinicalRecord[] = records
    .filter((r) => r.id !== currentRecordId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const visibleRecords = showAll ? historyRecords : historyRecords.slice(0, INITIAL_VISIBLE)
  const remainingCount = historyRecords.length - INITIAL_VISIBLE

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-start gap-2">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">Histórico do paciente</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Atendimentos anteriores deste paciente na clínica.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden="true"
          />
          Carregando histórico...
        </div>
      )}

      {/* Error — non-blocking; editing the current record is unaffected */}
      {!isLoading && error && <InlineFeedback tone="warning">{error}</InlineFeedback>}

      {/* Empty state */}
      {!isLoading && !error && historyRecords.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          Este paciente não tem outros atendimentos registrados.
        </p>
      )}

      {/* Timeline */}
      {!isLoading && !error && historyRecords.length > 0 && (
        <div className="space-y-3">
          <ClinicalTimeline records={visibleRecords} />

          {/* Show-more expander — only when collapsed and there are hidden records */}
          {!showAll && remainingCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowAll(true)}
            >
              Mostrar mais {remainingCount} atendimento{remainingCount !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
