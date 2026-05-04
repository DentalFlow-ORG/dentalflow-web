import { Link } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { formatCurrencyBR } from '@/lib/number-formatters'

import { ProfileForm } from '../components/ProfileForm'
import { ServiceForm } from '../components/ServiceForm'
import {
  type ProfileEditorMode,
  useProfileEditorPage,
} from '../hooks/useProfileEditorPage'

type ProfileEditorPageContainerProps = {
  mode: ProfileEditorMode
}

export function ProfileEditorPageContainer({
  mode,
}: ProfileEditorPageContainerProps) {
  const {
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
  } = useProfileEditorPage(mode)

  if (isLoading) {
    return (
      <div>
        <LoadingCard message="Carregando perfil..." />
      </div>
    )
  }

  return (
    <AppPage spacing="loose">
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
                const priceFrom = formatCurrencyBR(service.priceFrom)
                const priceTo = formatCurrencyBR(service.priceTo)

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
    </AppPage>
  )
}
