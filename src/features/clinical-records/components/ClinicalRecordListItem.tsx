import { Link } from '@tanstack/react-router'
import { Calendar, ChevronRight } from 'lucide-react'

import { formatTimestampDateBR } from '@/lib/date-time-formatters'

import type { ClinicalRecord } from '../types/clinical-record.types'
import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'

type Props = {
  record: ClinicalRecord
}

/*
 * Column widths are mirrored in RecordListHeader inside ClinicalRecordsListContainer.
 * Keep both in sync when changing column layout.
 *
 * sm+:  patient(flex-1) | professional(w-36, lg+) | complaint(w-44, xl+) | status(w-24) | date(w-24) | arrow(w-4)
 */
export function ClinicalRecordListItem({ record }: Props) {
  return (
    <Link
      to="/app/prontuario/$clinicalRecordId"
      params={{ clinicalRecordId: record.id }}
      className={[
        'group block rounded-xl border border-border bg-card',
        'transition-all duration-150',
        'hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      ].join(' ')}
    >
      {/* ── Mobile layout (< sm) ───────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 sm:hidden">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <p className="text-sm font-semibold leading-tight text-foreground">
              {record.patientName}
            </p>
            <ClinicalRecordStatusBadge status={record.status} />
          </div>
          {record.patientEmail && (
            <p className="truncate text-xs text-muted-foreground">{record.patientEmail}</p>
          )}
          <p className="text-xs text-muted-foreground">{record.profile.displayName}</p>
          {record.chiefComplaint && (
            <p className="line-clamp-1 text-xs text-muted-foreground/70">{record.chiefComplaint}</p>
          )}
          <div className="flex items-center gap-1 pt-0.5 text-xs text-muted-foreground/50">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{formatTimestampDateBR(record.createdAt)}</span>
          </div>
        </div>
        <ChevronRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>

      {/* ── Desktop / tablet layout (≥ sm) ────────────────────────── */}
      <div className="hidden items-center gap-4 px-4 py-3.5 sm:flex">
        {/* Patient */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{record.patientName}</p>
          {record.patientEmail && (
            <p className="truncate text-xs text-muted-foreground">{record.patientEmail}</p>
          )}
        </div>

        {/* Professional (lg+) */}
        <div className="hidden w-36 shrink-0 lg:block">
          <p className="truncate text-sm text-muted-foreground">{record.profile.displayName}</p>
        </div>

        {/* Chief complaint (xl+) */}
        <div className="hidden w-44 shrink-0 xl:block">
          {record.chiefComplaint ? (
            <p className="truncate text-xs text-muted-foreground/80" title={record.chiefComplaint}>
              {record.chiefComplaint}
            </p>
          ) : (
            <span className="text-xs italic text-muted-foreground/30">—</span>
          )}
        </div>

        {/* Status */}
        <div className="w-24 shrink-0">
          <ClinicalRecordStatusBadge status={record.status} />
        </div>

        {/* Date */}
        <div className="flex w-24 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{formatTimestampDateBR(record.createdAt)}</span>
        </div>

        {/* Open indicator */}
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
