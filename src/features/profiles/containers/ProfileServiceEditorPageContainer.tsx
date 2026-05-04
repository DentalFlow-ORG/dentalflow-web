import { Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

import { ServiceForm } from '../components/ServiceForm'
import { useProfileServiceEditorPage } from '../hooks/useProfileServiceEditorPage'

export function ProfileServiceEditorPageContainer() {
  const {
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
  } = useProfileServiceEditorPage()

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
