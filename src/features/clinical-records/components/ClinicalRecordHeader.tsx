import { Calendar, Clock, Stethoscope, Tag } from 'lucide-react'

import { formatDateBR } from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'

import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'
import type { ClinicalRecord } from '../types/clinical-record.types'

type Props = {
  record: ClinicalRecord
}

function formatTime(value: string) {
  return value.slice(11, 16)
}

// Patient avatar helpers — purely visual, derived from patientName.
// No persistent patient photo support yet; this is a placeholder until the
// backend adds a dedicated patient profile photo API.
function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ClinicalRecordHeader({ record }: Props) {
  const appt = record.appointment

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {/* Avatar — shows patient initials until persistent photo support is available */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            aria-hidden="true"
            title={record.patientName}
          >
            {getAvatarInitials(record.patientName)}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Prontuário digital
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              {record.patientName}
            </h1>
            {record.patientEmail && (
              <p className="mt-0.5 text-sm text-muted-foreground">{record.patientEmail}</p>
            )}
            {record.patientPhone && (
              <p className="text-sm text-muted-foreground">{formatPhoneBR(record.patientPhone)}</p>
            )}
          </div>
        </div>
        <ClinicalRecordStatusBadge status={record.status} className="mt-1" />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span>{record.profile.displayName}</span>
        </div>

        {appt && (
          <>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateBR(appt.appointmentDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
              </span>
            </div>
            {appt.service && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>{appt.service.name}</span>
              </div>
            )}
          </>
        )}

        {/* Audit trail */}
        <p className="w-full text-xs text-muted-foreground/85">
          Criado por{' '}
          <span className="font-medium text-muted-foreground">
            {record.createdByUser.firstName} {record.createdByUser.lastName}
          </span>
          {' em '}{formatDateBR(record.createdAt.slice(0, 10))}
          {record.updatedByUser && (
            <>
              {' · '}Atualizado por{' '}
              <span className="font-medium text-muted-foreground">
                {record.updatedByUser.firstName} {record.updatedByUser.lastName}
              </span>
              {' em '}{formatDateBR(record.updatedAt.slice(0, 10))}
            </>
          )}
        </p>
      </div>
    </div>
  )
}
