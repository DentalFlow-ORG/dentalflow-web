import { useState } from 'react'
import { ChevronRight, ClipboardList, Loader2, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useClinicalRecordByAppointment } from '@/features/clinical-records/hooks/useClinicalRecord'
import { createClinicalRecord } from '@/features/clinical-records/services/clinical-records.service'

import type { Appointment } from '../../types/scheduling.types'
import { AppointmentDetailsSection } from './AppointmentDetailsSection'

type Props = {
  appointment: Appointment
  onClose: () => void
}

/**
 * Clinical record section with role gate.
 * Visible to OWNER and DENTIST only.
 */
export function AppointmentClinicalSection({ appointment, onClose }: Props) {
  const { user } = useAuth()
  const canManage = user?.role === 'OWNER' || user?.role === 'DENTIST'
  if (!canManage) return null

  return <ClinicalRecordManagerSection appointment={appointment} onClose={onClose} />
}

function ClinicalRecordManagerSection({ appointment, onClose }: Props) {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const { record, isLoading } = useClinicalRecordByAppointment(appointment.id)
  const [isCreating, setIsCreating] = useState(false)

  const handleOpen = () => {
    if (!record) return
    onClose()
    void navigate({
      to: '/app/prontuario/$clinicalRecordId',
      params: { clinicalRecordId: record.id },
    })
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const created = await createClinicalRecord({
        appointmentId: appointment.id,
        profileId: appointment.profile?.id ?? appointment.profileId,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail ?? undefined,
        patientPhone: appointment.patientPhone ?? undefined,
      })
      onClose()
      void navigate({
        to: '/app/prontuario/$clinicalRecordId',
        params: { clinicalRecordId: created.id },
      })
    } catch {
      showAlert({
        title: 'Erro',
        description: 'Não foi possível criar o prontuário.',
        tone: 'error',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AppointmentDetailsSection title="Prontuário">
      {isLoading ? (
        <div className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          Verificando prontuário...
        </div>
      ) : record ? (
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          onClick={handleOpen}
          aria-label="Abrir prontuário clínico"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">Abrir prontuário</p>
            <p className="text-xs text-muted-foreground">Visualizar ficha clínica do paciente</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleCreate}
          disabled={isCreating}
          aria-label={isCreating ? 'Criando prontuário' : 'Criar prontuário clínico'}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {isCreating ? 'Criando prontuário...' : 'Criar prontuário'}
            </p>
            <p className="text-xs text-muted-foreground">Iniciar ficha clínica para este paciente</p>
          </div>
          {!isCreating && (
            <Plus className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
      )}
    </AppointmentDetailsSection>
  )
}
