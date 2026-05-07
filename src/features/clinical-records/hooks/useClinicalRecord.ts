import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import {
  cancelClinicalRecord,
  completeClinicalRecord,
  getClinicalRecord,
  getClinicalRecordByAppointment,
  lockClinicalRecord,
  restoreClinicalRecord,
  updateClinicalRecord,
} from '../services/clinical-records.service'
import type { ClinicalRecord, UpdateClinicalRecordDto } from '../types/clinical-record.types'

export function useClinicalRecord(id: string) {
  const [record, setRecord] = useState<ClinicalRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showAlert } = useGlobalAlerts()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    getClinicalRecord(id)
      .then((data) => {
        if (isCurrent) setRecord(data)
      })
      .catch(() => {
        if (isCurrent) setError('Não foi possível carregar o prontuário.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id])

  const save = async (dto: UpdateClinicalRecordDto) => {
    if (!record) return
    setIsSaving(true)
    try {
      const updated = await updateClinicalRecord(record.id, dto)
      setRecord(updated)
      showAlert({ title: 'Prontuário salvo.', description: 'Rascunho atualizado com sucesso.', tone: 'success' })
    } catch {
      showAlert({ title: 'Erro ao salvar.', description: 'Não foi possível salvar o prontuário.', tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const saveDraft = (dto: UpdateClinicalRecordDto) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => save(dto), 800)
  }

  const complete = async () => {
    if (!record) return
    setIsSaving(true)
    try {
      const updated = await completeClinicalRecord(record.id)
      setRecord(updated)
      showAlert({ title: 'Atendimento concluído.', description: 'Prontuário marcado como concluído.', tone: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível concluir o prontuário.'
      showAlert({ title: 'Erro', description: msg, tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const lock = async () => {
    if (!record) return
    setIsSaving(true)
    try {
      const updated = await lockClinicalRecord(record.id)
      setRecord(updated)
      showAlert({ title: 'Prontuário bloqueado.', description: 'O prontuário não pode mais ser editado.', tone: 'success' })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível bloquear o prontuário.', tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const cancel = async () => {
    if (!record) return
    setIsSaving(true)
    try {
      const updated = await cancelClinicalRecord(record.id)
      setRecord(updated)
      showAlert({ title: 'Prontuário cancelado.', description: 'O prontuário foi cancelado.', tone: 'info' })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível cancelar o prontuário.', tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const restore = async () => {
    if (!record) return
    setIsSaving(true)
    try {
      const updated = await restoreClinicalRecord(record.id)
      setRecord(updated)
      showAlert({ title: 'Prontuário restaurado.', description: 'O prontuário foi reativado com sucesso.', tone: 'success' })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível restaurar o prontuário.', tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return { record, isLoading, isSaving, error, save, saveDraft, complete, lock, cancel, restore }
}

type AppointmentRecordState = {
  record: ClinicalRecord | null
  isLoading: boolean
  error: string | null
}
type AppointmentRecordAction =
  | { type: 'loading' }
  | { type: 'success'; record: ClinicalRecord | null }
  | { type: 'error' }

function appointmentRecordReducer(
  state: AppointmentRecordState,
  action: AppointmentRecordAction,
): AppointmentRecordState {
  switch (action.type) {
    case 'loading': return { ...state, isLoading: true, error: null }
    case 'success': return { record: action.record, isLoading: false, error: null }
    case 'error': return { ...state, isLoading: false, error: 'Não foi possível carregar o prontuário.' }
  }
}

export function useClinicalRecordByAppointment(appointmentId: string) {
  const [state, dispatch] = useReducer(appointmentRecordReducer, {
    record: null,
    isLoading: true,
    error: null,
  })

  const load = useCallback(() => {
    dispatch({ type: 'loading' })
    let isCurrent = true

    getClinicalRecordByAppointment(appointmentId)
      .then((data) => {
        if (isCurrent) dispatch({ type: 'success', record: data })
      })
      .catch(() => {
        if (isCurrent) dispatch({ type: 'error' })
      })

    return () => {
      isCurrent = false
    }
  }, [appointmentId])

  useEffect(load, [load])

  return { record: state.record, isLoading: state.isLoading, error: state.error }
}
