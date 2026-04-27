import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PanelCard } from '@/components/common/PanelCard'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { LoadingCard } from '@/components/common/LoadingCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

import { useRequestErrorHandler } from '../hooks/useRequestErrorHandler'

import { ProfileForm } from '../components/ProfileForm'
import { ServiceForm } from '../components/ServiceForm'
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
  formatCurrency,
  profileFormToPayload,
  profileToFormValues,
  serviceFormToPayload,
  toPublicProfileUrl,
  type ProfileFormValues,
  type ServiceFormValues,
} from '../utils/profile-formatters'
import { hasDuplicateDisplayOrder } from '../utils/service-validation'

type ProfileEditorPageProps = {
  mode: 'create' | 'edit'
}

export function ProfileEditorPage({ mode }: ProfileEditorPageProps) {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()
  const profileId = mode === 'edit' && 'profileId' in params ? String(params.profileId) : undefined
  const isCreate = mode === 'create'

  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [formValues, setFormValues] =
    useState<ProfileFormValues>(emptyProfileForm)
  const [serviceValues, setServiceValues] =
    useState<ServiceFormValues>(emptyServiceForm)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<string | null>(null)

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
  }, [isCreate, profileId, showAlert])

  const publicUrl = useMemo(() => {
    if (!profile) return null

    return toPublicProfileUrl(profile.slug)
  }, [profile])

  const handleSubmitProfile = async () => {
    setError(null)
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
          description: 'As alteracoes do perfil foram salvas.',
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
        showAlert({
          title: 'Ordem de exibicao duplicada',
          description:
            'Ja existe um servico com essa ordem de exibicao neste perfil.',
          tone: 'warning',
        })
        setError('Já existe um serviço com essa ordem de exibição neste perfil.')
        return
      }

      await createProfileService(profile.id, serviceFormToPayload(serviceValues))
      const refreshedProfile = await getProfile(profile.id)

      setProfile(refreshedProfile)
      setServiceValues(emptyServiceForm)
      showAlert({
        title: 'Servico adicionado',
        description: 'O servico foi cadastrado no perfil.',
        tone: 'success',
      })
    } catch (requestError) {
      handleRequestError(requestError, 'Não foi possível salvar o serviço.')
    } finally {
      setIsServiceSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <LoadingCard message="Carregando perfil..." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AppPageHeader
        eyebrow="Perfis profissionais"
        title={isCreate ? 'Novo perfil' : 'Gerenciar perfil'}
        description={
          isCreate
            ? 'Crie uma página pública para apresentar o profissional, canais de contato e serviços.'
            : 'Atualize a presença pública do profissional e controle os serviços exibidos.'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/perfis">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            {profile && (
              <Button
                variant={profile.isPublished ? 'outline' : 'secondary'}
                onClick={handleTogglePublish}
              >
                {profile.isPublished ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {profile.isPublished ? 'Despublicar' : 'Publicar'}
              </Button>
            )}
          </div>
        }
      />

      {profile && (
        <PanelCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                {profile.displayName}
              </h2>
              <StatusBadge tone={profile.isPublished ? 'success' : 'muted'}>
                {profile.isPublished ? 'Publicado' : 'Rascunho'}
              </StatusBadge>
            </div>
            <p className="mt-2 text-sm text-slate-500">{publicUrl}</p>
          </div>
          {profile.isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/p/$slug" params={{ slug: profile.slug }}>
                <ExternalLink className="h-4 w-4" />
                Abrir página pública
              </Link>
            </Button>
          )}
        </PanelCard>
      )}

      <ProfileForm
        values={formValues}
        isSubmitting={isSubmitting}
        submitLabel={isCreate ? 'Criar perfil' : 'Salvar alterações'}
        error={error}
        onChange={setFormValues}
        onSubmit={handleSubmitProfile}
      />

      {!isCreate && profile && (
        <PanelCard>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Serviços</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Serviços ativos aparecem na página pública do profissional.
              </p>
            </div>
            <StatusBadge>{profile.services.length} cadastrados</StatusBadge>
          </div>

          <div className="mt-6 space-y-3">
            {profile.services.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                Nenhum serviço cadastrado para este perfil.
              </div>
            ) : (
              profile.services.map((service) => {
                const priceFrom = formatCurrency(service.priceFrom)
                const priceTo = formatCurrency(service.priceTo)

                return (
                  <div
                    key={service.id}
                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-950">
                          {service.name}
                        </h3>
                        <StatusBadge tone={service.isActive ? 'success' : 'muted'}>
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {service.description || 'Sem descrição cadastrada.'}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {[priceFrom, priceTo].filter(Boolean).join(' até ') ||
                          'Preço não informado'}
                        {service.durationMinutes
                          ? ` · ${service.durationMinutes} min`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to="/app/perfis/$profileId/servicos/$serviceId"
                          params={{ profileId: profile.id, serviceId: service.id }}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                      <ConfirmDialog
                        open={pendingDeleteServiceId === service.id}
                        title="Remover serviço"
                        subject={service.name}
                        description="Este serviço será removido permanentemente do perfil e não poderá ser recuperado."
                        confirmLabel="Remover serviço"
                        onConfirm={confirmDeleteService}
                        onCancel={() => setPendingDeleteServiceId(null)}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <ServiceForm
              values={serviceValues}
              isSubmitting={isServiceSubmitting}
              submitLabel="Adicionar serviço"
              onChange={setServiceValues}
              onSubmit={handleAddService}
            />
          </div>
        </PanelCard>
      )}

      {!isCreate && profile && (
        <PanelCard className="border-red-200 bg-red-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Excluir profissional
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-700">
                Remove o perfil profissional e os serviços cadastrados para ele.
                Use apenas quando essa página não deve mais existir na clínica.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteProfile}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Excluindo...' : 'Excluir perfil'}
            </Button>
          </div>
        </PanelCard>
      )}

      {profile && (
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Excluir perfil profissional"
          subject={profile.displayName}
          description="Esta ação também remove todos os serviços vinculados a este profissional e não pode ser desfeita."
          confirmLabel="Excluir perfil"
          isConfirming={isDeleting}
          onConfirm={confirmDeleteProfile}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  )
}
