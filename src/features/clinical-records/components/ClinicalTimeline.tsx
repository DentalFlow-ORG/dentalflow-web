import { Link } from '@tanstack/react-router'
import { ClipboardList, ExternalLink } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { formatDateLongBR } from '@/lib/date-time-formatters'

import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'
import type { ClinicalRecord } from '../types/clinical-record.types'

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

function ClinicalTimelineItem({ record }: ItemProps) {
  return (
    <li className="relative">
      <span className="absolute -left-[1.375rem] top-1.5 flex h-3 w-3 items-center justify-center">
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
