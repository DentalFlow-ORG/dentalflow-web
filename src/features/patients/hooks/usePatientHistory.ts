import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import { getPatientHistory } from '../services/patients.service'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'

export function usePatientHistory(patient: PatientSummary | null) {
  const { showAlert } = useGlobalAlerts()
  const [history, setHistory] = useState<{
    identifier: string
    appointments: PatientAppointment[]
  } | null>(null)

  const appointments =
    patient && history?.identifier === patient.identifier ? history.appointments : []
  const isLoading = !!patient && history?.identifier !== patient.identifier

  useEffect(() => {
    if (!patient) return

    const identifier = patient.identifier
    let isCurrent = true

    getPatientHistory(identifier)
      .then((response) => {
        if (isCurrent) {
          setHistory({ identifier, appointments: response.appointments })
        }
      })
      .catch((error) => {
        if (!isCurrent) return

        const message = error instanceof ApiError ? error.message : 'Erro ao carregar histórico.'
        showAlert({ title: 'Erro', description: message, tone: 'error' })
        setHistory({ identifier, appointments: [] })
      })

    return () => {
      isCurrent = false
    }
  }, [patient, showAlert])

  return {
    appointments,
    isLoading,
  }
}
