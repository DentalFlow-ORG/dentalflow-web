import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Eye,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { IconCard } from '@/components/common/IconCard'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { MetricCard } from '@/components/common/MetricCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getUserDisplayName } from '@/features/auth/utils/name'
import { listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem } from '@/features/profiles/types'
import { ApiError } from '@/services/http'

export function DashboardPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listProfiles()
      .then(setProfiles)
      .catch((requestError) => {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Não foi possível carregar os indicadores de perfis.',
        )
      })
      .finally(() => setIsLoadingProfiles(false))
  }, [])

  const metrics = useMemo(() => {
    const publishedProfiles = profiles.filter((profile) => profile.isPublished)
    const draftProfiles = profiles.filter((profile) => !profile.isPublished)
    const totalViews = profiles.reduce(
      (total, profile) => total + profile.viewsCount,
      0,
    )
    const mostViewedProfile = [...profiles].sort(
      (first, second) => second.viewsCount - first.viewsCount,
    )[0]

    return {
      publishedProfiles,
      draftProfiles,
      totalViews,
      mostViewedProfile,
    }
  }, [profiles])

  const hasProfiles = profiles.length > 0
  const setupSteps = [
    {
      label: 'Criar primeiro perfil profissional',
      isDone: profiles.length > 0,
    },
    {
      label: 'Publicar uma página pública',
      isDone: metrics.publishedProfiles.length > 0,
    },
    {
      label: 'Acompanhar visualizações iniciais',
      isDone: metrics.totalViews > 0,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AppPageHeader
        eyebrow="Plataforma"
        title="Visão geral"
        description="Acompanhe a presença pública da clínica e avance nos próximos passos do MVP."
        action={
          <Button asChild>
            <Link to="/app/perfis">Gerenciar perfis</Link>
          </Button>
        }
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoadingProfiles ? (
        <LoadingCard message="Carregando indicadores..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            value={String(profiles.length)}
            label="perfis profissionais cadastrados"
          />
          <MetricCard
            value={String(metrics.publishedProfiles.length)}
            label="páginas públicas publicadas"
          />
          <MetricCard
            value={String(metrics.draftProfiles.length)}
            label="rascunhos aguardando publicação"
          />
          <MetricCard
            value={String(metrics.totalViews)}
            label="visualizações acumuladas"
          />
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <IconCard icon={UserRound} title="Usuário autenticado">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Nome</dt>
              <dd className="mt-1 text-slate-900">
                {user ? getUserDisplayName(user) : '-'}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">E-mail</dt>
              <dd className="mt-1 text-slate-900">{user?.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Perfil</dt>
              <dd className="mt-1 text-slate-900">{user?.role}</dd>
            </div>
          </dl>
        </IconCard>

        <IconCard
          icon={BriefcaseBusiness}
          title="Perfis profissionais"
          description={
            hasProfiles
              ? 'Gerencie páginas públicas, status de publicação e canais de contato dos profissionais.'
              : 'Crie o primeiro perfil para começar a montar a presença pública da clínica.'
          }
          iconClassName="bg-emerald-50 text-emerald-700"
        >
          <Button variant="outline" size="sm" asChild>
            <Link to={hasProfiles ? '/app/perfis' : '/app/perfis/novo'}>
              {hasProfiles ? 'Abrir perfis' : 'Criar perfil'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </IconCard>

        <IconCard
          icon={metrics.mostViewedProfile ? Eye : BarChart3}
          title={
            metrics.mostViewedProfile
              ? 'Perfil com mais alcance'
              : 'Próximos módulos'
          }
          description={
            metrics.mostViewedProfile
              ? `${metrics.mostViewedProfile.displayName} concentra ${metrics.mostViewedProfile.viewsCount} visualizações.`
              : 'Leads, métricas e billing devem entrar depois que o fluxo de perfil público estiver sólido.'
          }
          iconClassName="bg-indigo-50 text-[#6366f1]"
        >
          {metrics.mostViewedProfile && (
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/app/perfis/$profileId"
                params={{ profileId: metrics.mostViewedProfile.id }}
              >
                Ver perfil
              </Link>
            </Button>
          )}
        </IconCard>
      </div>

      <PanelCard>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Progresso do setup
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Complete a base pública antes de abrir módulos como leads,
              assinatura e métricas avançadas.
            </p>
          </div>
          <StatusBadge
            tone={setupSteps.every((step) => step.isDone) ? 'success' : 'warning'}
          >
            {setupSteps.filter((step) => step.isDone).length}/{setupSteps.length}{' '}
            concluídos
          </StatusBadge>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {setupSteps.map((step) => (
            <div
              key={step.label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <StatusBadge tone={step.isDone ? 'success' : 'muted'}>
                {step.isDone ? 'Concluído' : 'Pendente'}
              </StatusBadge>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </PanelCard>

      {!hasProfiles && !isLoadingProfiles && (
        <PanelCard className="border-blue-200 bg-blue-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-sm">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Comece pela página pública
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Esse é o primeiro ativo visível para pacientes e a base para
                  capturar oportunidades nos próximos módulos.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/app/perfis/novo">
                Criar primeiro perfil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </PanelCard>
      )}
    </div>
  )
}
