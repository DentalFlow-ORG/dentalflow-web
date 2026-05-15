import { ArrowLeft, ShieldOff } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { AppPage } from '@/components/layout/AppPage'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { AvailabilityManager } from '@/features/scheduling/components/availability/AvailabilityManager'
import { ExceptionManager } from '@/features/scheduling/components/availability/ExceptionManager'

import { useTeamMemberProfile } from '../hooks/useTeamMemberProfile'

type Props = {
  profileId: string
}

export function TeamMemberProfileContainer({ profileId }: Props) {
  const { profile, status, displayName, email, phone, isActive, availability, setAvailability, exceptions, setExceptions, user, load } =
    useTeamMemberProfile(profileId)

  const isDentist = user?.role === 'DENTIST'
  const backPath = isDentist ? '/app/agenda' : '/app/equipe'
  const backLabel = isDentist ? 'Voltar para agenda' : 'Voltar para equipe'

  return (
    <AppPage>
      {/* Back navigation */}
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to={backPath}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      </div>

      {/* Status states */}
      {status === 'loading' && <LoadingState />}
      {status === 'forbidden' && <ForbiddenState backPath={backPath} backLabel={backLabel} />}
      {status === 'not-found' && <NotFoundState backPath={backPath} backLabel={backLabel} />}
      {status === 'error' && <ErrorState onRetry={load} />}

      {/* Main content */}
      {status === 'ready' && profile && (
        <>
          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Equipe
              </p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-slate-950 sm:text-3xl">
                {displayName || profile.displayName}
              </h1>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <StatusBadge tone="muted">Profissional</StatusBadge>
              {isActive !== null && (
                <StatusBadge tone={isActive ? 'success' : 'muted'}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              )}
              <StatusBadge tone={profile.isPublished ? 'success' : 'muted'}>
                {profile.isPublished ? 'Perfil publicado' : 'Perfil não publicado'}
              </StatusBadge>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic information */}
            <PanelCard>
              <h2 className="mb-4 text-base font-semibold text-slate-950">
                Informações do profissional
              </h2>
              <dl className="space-y-3">
                <InfoRow label="Nome profissional" value={profile.displayName} />
                {displayName && displayName !== profile.displayName && (
                  <InfoRow label="Nome completo" value={displayName} />
                )}
                {email && <InfoRow label="E-mail" value={email} />}
                {phone && <InfoRow label="Telefone" value={phone} />}
                {profile.crmNumber && (
                  <InfoRow
                    label="CRO"
                    value={
                      profile.crmState
                        ? `${profile.crmNumber} — ${profile.crmState}`
                        : profile.crmNumber
                    }
                  />
                )}
                {profile.bio && <InfoRow label="Sobre" value={profile.bio} />}
                {profile.profileSpecialties.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Especialidades
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.profileSpecialties.map(({ specialty }) => (
                        <span
                          key={specialty.id}
                          className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary"
                        >
                          {specialty.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {profile.profileSpecialties.length === 0 && (
                  <InfoRow label="Especialidades" value="Nenhuma especialidade cadastrada" muted />
                )}
              </dl>
            </PanelCard>

            {/* Availability editor */}
            <PanelCard>
              <AvailabilityManager
                profileId={profileId}
                slots={availability}
                onSlotsChange={setAvailability}
              />
            </PanelCard>
          </div>

          {/* Exceptions editor */}
          <PanelCard>
            <ExceptionManager
              profileId={profileId}
              exceptions={exceptions}
              onExceptionsChange={setExceptions}
              title="Exceções e bloqueios"
            />
          </PanelCard>
        </>
      )}
    </AppPage>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-sm font-medium ${muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {value}
      </dd>
    </div>
  )
}

function LoadingState() {
  return (
    <PanelCard className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary"
          role="status"
          aria-label="Carregando perfil profissional"
        />
        <p className="text-sm text-slate-500">Carregando perfil profissional...</p>
      </div>
    </PanelCard>
  )
}

function ForbiddenState({ backPath, backLabel }: { backPath: string; backLabel: string }) {
  return (
    <PanelCard className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <ShieldOff className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-slate-900">Acesso não autorizado</p>
        <p className="mt-1 text-sm text-slate-500">
          Você não tem permissão para acessar este perfil profissional.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to={backPath}>{backLabel}</Link>
      </Button>
    </PanelCard>
  )
}

function NotFoundState({ backPath, backLabel }: { backPath: string; backLabel: string }) {
  return (
    <PanelCard className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="font-semibold text-slate-900">Profissional não encontrado.</p>
      <Button variant="outline" size="sm" asChild>
        <Link to={backPath}>{backLabel}</Link>
      </Button>
    </PanelCard>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <PanelCard className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="font-semibold text-slate-900">
        Não foi possível carregar o perfil profissional.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </PanelCard>
  )
}
