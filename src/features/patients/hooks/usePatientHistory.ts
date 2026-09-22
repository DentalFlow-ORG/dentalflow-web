import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { ApiError } from '@/services/http'

import { getPatientHistory } from '../services/patients.service'
import type { PatientAppointment, PatientSummary } from '../types/patients.types'

/**
 * Key the loaded history belongs to.
 *
 * A household shares one contact identifier, so two patients can present the
 * same one. Keying on identity keeps the previous patient's appointments from
 * being shown as the next patient's history while their request is in flight.
 */
function historyKey(patient: PatientSummary): string {
  return patient.patientId ?? patient.identifier
}

export function usePatientHistory(patient: PatientSummary | null) {
  const { showAlert } = useGlobalAlerts()
  const [history, setHistory] = useState<{
    key: string
    appointments: PatientAppointment[]
  } | null>(null)

  const appointments = patient && history?.key === historyKey(patient) ? history.appointments : []
  const isLoading = !!patient && history?.key !== historyKey(patient)

  useEffect(() => {
    if (!patient) return

    const key = historyKey(patient)
    let isCurrent = true

    getPatientHistory(patient.identifier, patient.patientId)
      .then((response) => {
        if (isCurrent) {
          setHistory({ key, appointments: response.appointments })
        }
      })
      .catch((error) => {
        if (!isCurrent) return

        const message = error instanceof ApiError ? error.message : 'Erro ao carregar histórico.'
        showAlert({ title: 'Erro', description: message, tone: 'error' })
        setHistory({ key, appointments: [] })
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
