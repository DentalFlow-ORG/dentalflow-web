import { Calendar, Clock, Stethoscope, Tag } from 'lucide-react'

import { formatDateBR } from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { usePatientAvatar } from '@/features/patients/hooks/usePatientAvatar'
import { PatientAvatarWidget } from '@/features/patients/components/PatientAvatarWidget'

import { ClinicalRecordStatusBadge } from './ClinicalRecordStatusBadge'
import type { ClinicalRecord } from '../types/clinical-record.types'

type Props = {
  record: ClinicalRecord
  /** When true, the avatar upload button is hidden. Defaults to false. */
  readOnly?: boolean
}

function formatTime(value: string) {
  return value.slice(11, 16)
}

export function ClinicalRecordHeader({ record, readOnly = false }: Props) {
  const appt = record.appointment
  const { showAlert } = useGlobalAlerts()

  const identifier = record.patientEmail ?? record.patientName
  const { avatarUrl, isSaving, update } = usePatientAvatar(identifier)

  const handleAvatarChange = async (base64: string | null) => {
    try {
      await update(base64)
      showAlert({
        title: base64 ? 'Foto atualizada.' : 'Foto removida.',
        description: base64
          ? 'A foto do paciente foi salva com sucesso.'
          : 'A foto do paciente foi removida.',
        tone: 'success',
      })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível salvar a foto.', tone: 'error' })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {/* Patient avatar — shows photo when available, initials otherwise.
              Upload/remove controls are hidden when readOnly is true. */}
          <PatientAvatarWidget
            name={record.patientName}
            avatarUrl={avatarUrl}
            isSaving={isSaving}
            onUpload={readOnly ? undefined : handleAvatarChange}
            size="lg"
          />

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
