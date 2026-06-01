import { Link } from '@tanstack/react-router'
import { ClipboardList, ExternalLink } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { formatDateLongBR } from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'
import type { ClinicalRecord } from '../types/clinical-record.types'
import { getSnapshotSummary } from '../utils/odontogram-status-utils'

type Props = {
  records: ClinicalRecord[]
}

export function ClinicalTimeline({ records }: Props) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum prontuário encontrado"
        description="Não há prontuários registrados para este paciente."
      />
    )
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {records.map((record) => (
        <ClinicalTimelineItem key={record.id} record={record} />
      ))}
    </ol>
  )
}

type ItemProps = {
  record: ClinicalRecord
}

// ── OdontogramSnapshotRow ──────────────────────────────────────────────────────

type SnapshotRowProps = { snapshot: unknown }

/**
 * Renders a compact row of condition-count chips derived from the saved
 * odontogram snapshot. Returns null when there is no snapshot, when the
 * snapshot is malformed, or when all recorded teeth are healthy.
 *
 * Accepts `unknown` to match `ClinicalRecord.odontogramSnapshot` typing;
 * normalization and safety checks happen inside `getSnapshotSummary`.
 */
function OdontogramSnapshotRow({ snapshot }: SnapshotRowProps) {
  const summary = getSnapshotSummary(snapshot)
  if (summary.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Resumo do odontograma">
      <span className="text-[10px] font-medium text-muted-foreground/60" aria-hidden="true">
        Odontograma:
      </span>
      {summary.map(({ condition, label, count, legendClass }) => (
        <span
          key={condition}
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
            legendClass,
          )}
        >
          {count}× {label}
        </span>
      ))}
    </div>
  )
}

// ── ClinicalTimelineItem ───────────────────────────────────────────────────────

function ClinicalTimelineItem({ record }: ItemProps) {
  return (
    <li className="relative">
      <span className="absolute -left-5 top-1.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center">
        <span className="h-3 w-3 rounded-full border-2 border-primary bg-card" />
      </span>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {record.profile.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateLongBR(record.createdAt.slice(0, 10))}
              {record.appointment?.service && (
                <> &middot; {record.appointment.service.name}</>
              )}
            </p>
          </div>
          <ClinicalRecordStatusBadge status={record.status} />
        </div>

        {record.chiefComplaint && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Queixa principal:</span>{' '}
            {record.chiefComplaint}
          </p>
        )}

        {record.clinicalEvolution && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {record.clinicalEvolution}
          </p>
        )}

        {/* Odontogram snapshot — only shown when the record was completed with
            a snapshot captured. Uses only the stored data; makes no API calls. */}
        <OdontogramSnapshotRow snapshot={record.odontogramSnapshot} />

        <div className="mt-3">
          <Link
            to="/app/prontuario/$clinicalRecordId"
            params={{ clinicalRecordId: record.id }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver prontuário completo
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </li>
  )
}
