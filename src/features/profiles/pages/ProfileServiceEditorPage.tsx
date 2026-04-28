import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

import { ServiceForm } from '../components/ServiceForm'
import { useRequestErrorHandler } from '../hooks/useRequestErrorHandler'
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

export function ProfileServiceEditorPage() {
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
        const selectedService = response.services.find(
          (item) => item.id === serviceId,
        )

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
      await navigate({
        to: '/app/perfis/$profileId',
        params: { profileId },
      })
      showAlert({
        title: 'Serviço removido',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível remover o serviço.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <LoadingCard message="Carregando serviço..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AppPageHeader
        eyebrow="Serviço profissional"
        title={service?.name ?? 'Editar serviço'}
        description={
          profile
            ? `Edite apenas este serviço vinculado ao perfil de ${profile.displayName}.`
            : 'Edite os dados deste serviço.'
        }
        action={
          <Button variant="outline" asChild>
            <Link to="/app/perfis/$profileId" params={{ profileId }}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao perfil
            </Link>
          </Button>
        }
      />

      {service && (
        <PanelCard className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Status</p>
            <div className="mt-2">
              <StatusBadge tone={service.isActive ? 'success' : 'muted'}>
                {service.isActive ? 'Ativo' : 'Inativo'}
              </StatusBadge>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Removendo...' : 'Remover serviço'}
          </Button>
        </PanelCard>
      )}

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {service && (
        <PanelCard>
          <ServiceForm
            values={values}
            isSubmitting={isSubmitting}
            submitLabel="Salvar serviço"
            onChange={setValues}
            onSubmit={handleSubmit}
          />
        </PanelCard>
      )}

      {service && (
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Remover serviço"
          subject={service.name}
          description="Este serviço será removido permanentemente do perfil e não poderá ser recuperado."
          confirmLabel="Remover serviço"
          isConfirming={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  )
}
