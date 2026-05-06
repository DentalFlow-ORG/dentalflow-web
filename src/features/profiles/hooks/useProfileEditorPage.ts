import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { isValidPhoneBR } from '@/lib/field-formatters'

import { useRequestErrorHandler } from './useRequestErrorHandler'
import {
  createProfile,
  createProfileService,
  deleteProfile,
  deleteProfileService,
  getProfile,
  toggleProfilePublish,
  updateProfile,
} from '../services/profiles.service'
import type { ProfileDetail } from '../types'
import {
  emptyProfileForm,
  emptyServiceForm,
  profileFormToPayload,
  profileToFormValues,
  serviceFormToPayload,
  toPublicProfileUrl,
  type ProfileFormValues,
  type ServiceFormValues,
} from '../utils/profile-formatters'
import { hasDuplicateDisplayOrder } from '../utils/service-validation'

export type ProfileEditorMode = 'create' | 'edit'

export function useProfileEditorPage(mode: ProfileEditorMode) {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const profileId =
    mode === 'edit' && 'profileId' in params ? String(params.profileId) : undefined
  const isCreate = mode === 'create'

  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [formValues, setFormValues] = useState<ProfileFormValues>(emptyProfileForm)
  const [serviceValues, setServiceValues] =
    useState<ServiceFormValues>(emptyServiceForm)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<string | null>(
    null,
  )

  const handleRequestError = useRequestErrorHandler(setError)

  useEffect(() => {
    if (isCreate || !profileId) return

    getProfile(profileId)
      .then((response) => {
        setProfile(response)
        setFormValues(profileToFormValues(response))
      })
      .catch((err) => handleRequestError(err, 'Não foi possível carregar o perfil.'))
      .finally(() => setIsLoading(false))
  }, [handleRequestError, isCreate, profileId])

  const publicUrl = useMemo(() => {
    if (!profile) return null

    return toPublicProfileUrl(profile.slug)
  }, [profile])

  const handleSubmitProfile = async () => {
    setError(null)

    if (formValues.phone && !isValidPhoneBR(formValues.phone)) {
      setError(
        'Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.',
      )
      return
    }

    if (formValues.whatsappNumber && !isValidPhoneBR(formValues.whatsappNumber)) {
      setError(
        'Número de WhatsApp inválido. Informe um número com DDD e 10 ou 11 dígitos no total.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      const payload = profileFormToPayload(formValues)

      if (isCreate) {
        const createdProfile = await createProfile(payload)
        await navigate({
          to: '/app/perfis/$profileId',
          params: { profileId: createdProfile.id },
        })
        showAlert({
          title: 'Perfil criado',
          description: 'O perfil profissional foi criado com sucesso.',
          tone: 'success',
        })
      } else if (profileId) {
        const updatedProfile = await updateProfile(profileId, payload)
        setProfile(updatedProfile)
        setFormValues(profileToFormValues(updatedProfile))
        showAlert({
          title: 'Perfil salvo',
          description: 'As alterações do perfil foram salvas.',
          tone: 'success',
        })
      }
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível salvar o perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!profile) return

    setError(null)

    try {
      const response = await toggleProfilePublish(profile.id)

      setProfile({
        ...profile,
        isPublished: response.isPublished,
        slug: response.slug,
      })
      showAlert({
        title: response.isPublished ? 'Perfil publicado' : 'Perfil despublicado',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível alterar a publicação.')
    }
  }

  const handleAddService = async () => {
    if (!profile) return

    setError(null)
    setIsServiceSubmitting(true)

    try {
      if (hasDuplicateDisplayOrder(profile.services, serviceValues.displayOrder)) {
        const message =
          'Já existe um serviço com essa ordem de exibição neste perfil.'
        showAlert({
          title: 'Ordem de exibição duplicada',
          description: message,
          tone: 'warning',
        })
        setError(message)
        return
      }

      await createProfileService(profile.id, serviceFormToPayload(serviceValues))
      const refreshedProfile = await getProfile(profile.id)

      setProfile(refreshedProfile)
      setServiceValues(emptyServiceForm)
      showAlert({
        title: 'Serviço adicionado',
        description: 'O serviço foi cadastrado no perfil.',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível salvar o serviço.')
    } finally {
      setIsServiceSubmitting(false)
    }
  }

  const handleDeleteService = (serviceId: string) => {
    setPendingDeleteServiceId(serviceId)
  }

  const confirmDeleteService = async () => {
    if (!profile || !pendingDeleteServiceId) return

    const serviceId = pendingDeleteServiceId
    setPendingDeleteServiceId(null)
    setError(null)

    try {
      await deleteProfileService(profile.id, serviceId)
      setProfile({
        ...profile,
        services: profile.services.filter((service) => service.id !== serviceId),
      })
      showAlert({
        title: 'Serviço removido',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível remover o serviço.')
    }
  }

  const handleDeleteProfile = () => {
    if (!profile) return
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProfile = async () => {
    if (!profile) return

    setError(null)
    setIsDeleting(true)

    try {
      await deleteProfile(profile.id)
      setDeleteDialogOpen(false)
      await navigate({ to: '/app/perfis' })
      showAlert({
        title: 'Perfil excluído',
        description: 'O perfil profissional foi removido.',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível excluir o perfil.')
      setIsDeleting(false)
    }
  }

  return {
    isCreate,
    profile,
    formValues,
    setFormValues,
    serviceValues,
    setServiceValues,
    isLoading,
    isSubmitting,
    isDeleting,
    isServiceSubmitting,
    error,
    deleteDialogOpen,
    setDeleteDialogOpen,
    pendingDeleteServiceId,
    setPendingDeleteServiceId,
    publicUrl,
    handleSubmitProfile,
    handleTogglePublish,
    handleAddService,
    handleDeleteService,
    confirmDeleteService,
    handleDeleteProfile,
    confirmDeleteProfile,
  }
}
