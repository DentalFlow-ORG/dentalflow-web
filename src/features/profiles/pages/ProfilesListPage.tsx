import { Link } from '@tanstack/react-router'
import { ExternalLink, Plus, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

import { useRequestErrorHandler } from '../hooks/useRequestErrorHandler'
import { listProfiles } from '../services/profiles.service'
import type { ProfileListItem } from '../types'

export function ProfilesListPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleRequestError = useRequestErrorHandler(setError)

  useEffect(() => {
    listProfiles()
      .then(setProfiles)
      .catch((err) => handleRequestError(err, 'Não foi possível carregar os perfis.'))
      .finally(() => setIsLoading(false))
  }, [handleRequestError])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AppPageHeader
        eyebrow="Perfis profissionais"
        title="Páginas públicas da clínica"
        description="Cadastre profissionais, organize dados de contato e publique páginas com serviços para captação de pacientes."
        action={
          <Button asChild>
            <Link to="/app/perfis/novo">
              <Plus className="h-4 w-4" />
              Novo perfil
            </Link>
          </Button>
        }
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando perfis..." />
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Nenhum perfil criado"
          description="Crie o primeiro perfil profissional para começar a montar a presença pública da clínica."
          action={
            <Button asChild>
              <Link to="/app/perfis/novo">
                <Plus className="h-4 w-4" />
                Criar perfil
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <PanelCard key={profile.id}>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {profile.displayName}
                    </h2>
                    <StatusBadge tone={profile.isPublished ? 'success' : 'muted'}>
                      {profile.isPublished ? 'Publicado' : 'Rascunho'}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    /p/{profile.slug}
                    {profile.city || profile.state
                      ? ` - ${[profile.city, profile.state].filter(Boolean).join(' - ')}`
                      : ''}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {profile.viewsCount} visualizações
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.isPublished && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/p/$slug" params={{ slug: profile.slug }}>
                        <ExternalLink className="h-4 w-4" />
                        Ver público
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link to="/app/perfis/$profileId" params={{ profileId: profile.id }}>
                      Gerenciar
                    </Link>
                  </Button>
                </div>
              </div>
            </PanelCard>
          ))}
        </div>
      )}
    </div>
  )
}
