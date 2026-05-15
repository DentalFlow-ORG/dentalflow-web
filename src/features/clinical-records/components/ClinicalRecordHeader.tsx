import { Calendar, Clock, Stethoscope, User } from 'lucide-react'

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

export function ClinicalRecordHeader({ record }: Props) {
  const appt = record.appointment

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
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
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{appt.service.name}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
