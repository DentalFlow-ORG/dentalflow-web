import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import {
  createClinicalTemplate,
  deactivateClinicalTemplate,
  listClinicalTemplates,
  updateClinicalTemplate,
} from '../services/clinical-templates.service'
import type {
  ClinicalTemplate,
  CreateClinicalTemplateDto,
  UpdateClinicalTemplateDto,
} from '../types/clinical-record.types'

export function useClinicalTemplates() {
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showAlert } = useGlobalAlerts()

  const load = () => {
    let isCurrent = true
    setIsLoading(true)
    setError(null)

    listClinicalTemplates()
      .then((data) => {
        if (isCurrent) setTemplates(data)
      })
      .catch(() => {
        if (isCurrent) setError('Não foi possível carregar os modelos clínicos.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }

  useEffect(load, [])

  const create = async (dto: CreateClinicalTemplateDto) => {
    setIsSaving(true)
    try {
      const created = await createClinicalTemplate(dto)
      setTemplates((prev) => [...prev, created])
      showAlert({
        title: 'Modelo criado.',
        description: 'Modelo clínico salvo com sucesso.',
        tone: 'success',
      })
      return created
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível salvar o modelo.', tone: 'error' })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const update = async (id: string, dto: UpdateClinicalTemplateDto) => {
    setIsSaving(true)
    try {
      const updated = await updateClinicalTemplate(id, dto)
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)))
      showAlert({
        title: 'Modelo atualizado.',
        description: 'Modelo clínico atualizado com sucesso.',
        tone: 'success',
      })
      return updated
    } catch {
      showAlert({
        title: 'Erro',
        description: 'Não foi possível atualizar o modelo.',
        tone: 'error',
      })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const deactivate = async (id: string) => {
    setIsSaving(true)
    try {
      await deactivateClinicalTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      showAlert({
        title: 'Modelo removido.',
        description: 'Modelo clínico desativado.',
        tone: 'info',
      })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível remover o modelo.', tone: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return { templates, isLoading, isSaving, error, refresh: load, create, update, deactivate }
}
