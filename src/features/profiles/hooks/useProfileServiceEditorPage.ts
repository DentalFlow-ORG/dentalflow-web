import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import { useRequestErrorHandler } from './useRequestErrorHandler'
import {
  deleteProfileService,
  getProfile,
  updateProfileService,
} from '../services/profiles.service'
import type { ProfileDetail, ProfileService } from '../types'
import {
  emptyServiceForm,
  serviceFormToPayload,
  serviceToFormValues,
  type ServiceFormValues,
} from '../utils/profile-formatters'
import { hasDuplicateDisplayOrder } from '../utils/service-validation'

export function useProfileServiceEditorPage() {
  const { profileId, serviceId } = useParams({
    from: '/app/perfis/$profileId/servicos/$serviceId',
  })
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()

  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [service, setService] = useState<ProfileService | null>(null)
  const [values, setValues] = useState<ServiceFormValues>(emptyServiceForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestError = useRequestErrorHandler(setError)

  useEffect(() => {
    getProfile(profileId)
      .then((response) => {
        const selectedService = response.services.find((item) => item.id === serviceId)

        if (!selectedService) {
          setError('Serviço não encontrado neste perfil.')
          return
        }

        setProfile(response)
        setService(selectedService)
        setValues(serviceToFormValues(selectedService))
      })
      .catch((err) => handleRequestError(err, 'Não foi possível carregar o serviço.'))
      .finally(() => setIsLoading(false))
  }, [handleRequestError, profileId, serviceId])

  const handleSubmit = async () => {
    if (!profile || !service) return

    setError(null)
    setIsSubmitting(true)

    try {
      if (hasDuplicateDisplayOrder(profile.services, values.displayOrder, service.id)) {
        const message = 'Já existe outro serviço com essa ordem de exibição neste perfil.'
        setError(message)
        showAlert({
          title: 'Ordem de exibição duplicada',
          description: message,
          tone: 'warning',
        })
        return
      }

      const updatedService = await updateProfileService(
        profileId,
        serviceId,
        serviceFormToPayload(values),
      )

      setService(updatedService)
      setValues(serviceToFormValues(updatedService))
      showAlert({
        title: 'Serviço salvo',
        description: 'As alterações do serviço foram salvas.',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível salvar o serviço.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!service) return
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!service) return

    setError(null)
    setIsDeleting(true)

    try {
      await deleteProfileService(profileId, serviceId)
      setDeleteDialogOpen(false)
      await navigate({ to: '/app/perfis/$profileId', params: { profileId } })
      showAlert({ title: 'Serviço removido', tone: 'success' })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível remover o serviço.')
      setIsDeleting(false)
    }
  }

  return {
    profileId,
    profile,
    service,
    values,
    setValues,
    isLoading,
    isSubmitting,
    isDeleting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    error,
    handleSubmit,
    handleDelete,
    confirmDelete,
  }
}
