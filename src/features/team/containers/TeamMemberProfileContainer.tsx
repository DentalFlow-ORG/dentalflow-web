import { useState } from 'react'
import {
  Award,
  CalendarClock,
  CalendarOff,
  Loader2,
  ShieldOff,
  Stethoscope,
} from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { BackButton } from '@/components/common/BackButton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeEmptyState } from '@/features/home/components/HomeEmptyState'
import { HomeKpiCard } from '@/features/home/components/HomeKpiCard'
import { HomeSection } from '@/features/home/components/HomeSection'
import { AvailabilityManager } from '@/features/scheduling/components/availability/AvailabilityManager'
import { ExceptionManager } from '@/features/scheduling/components/availability/ExceptionManager'

import { useTeamMemberProfile } from '../hooks/useTeamMemberProfile'
import { TeamMemberAvatar } from '../components/TeamMemberAvatar'
import { TeamRoleBadge } from '../components/TeamRoleBadge'
import { ProfilePublishBadge } from '../components/ProfilePublishBadge'
import { ServicesPanel } from '../components/ServicesPanel'
import type { ProfileDetail, ServiceItem } from '../types/team.types'
import type { Availability } from '@/features/scheduling/types/scheduling.types'

type Props = {
  profileId: string
}

type ProfileKpis = {
  activeServices: number
  specialties: number
  availabilityDays: number
}

export function computeProfileKpis(
  profile: ProfileDetail,
  availability: Availability[],
  services: ServiceItem[],
): ProfileKpis {
  return {
    activeServices: services.filter((service) => service.isActive).length,
    specialties: profile.profileSpecialties.length,
    availabilityDays: new Set(
      availability
        .filter((slot) => slot.isActive)
        .map((slot) => slot.dayOfWeek),
    ).size,
  }
}

export function TeamMemberProfileContainer({ profileId }: Props) {
  const [confirmUnpublishOpen, setConfirmUnpublishOpen] = useState(false)
  const {
    profile,
    status,
    displayName,
    email,
    phone,
    isActive,
    availability,
    setAvailability,
    exceptions,
    setExceptions,
    services,
    setServices,
    user,
    isPublishingProfile,
    publishError,
    togglePublishStatus,
    load,
  } =
    useTeamMemberProfile(profileId)

  const isDentist = user?.role === 'DENTIST'
  const isOwner = user?.role === 'OWNER'
  const backPath = isDentist ? '/app/agenda' : '/app/equipe'
  const backLabel = isDentist ? 'Voltar para agenda' : 'Voltar para equipe'

  async function handlePublishClick() {
    if (!profile) return
    if (profile.isPublished) {
      setConfirmUnpublishOpen(true)
      return
    }
    await togglePublishStatus()
  }

  async function handleConfirmUnpublish() {
    const updated = await togglePublishStatus()
    if (updated) setConfirmUnpublishOpen(false)
  }

  return (
    <AppPage>
      <div>
        <BackButton to={backPath} label={backLabel} variant="ghost" className="-ml-2" />
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'forbidden' && <ForbiddenState backPath={backPath} backLabel={backLabel} />}
      {status === 'not-found' && <NotFoundState backPath={backPath} backLabel={backLabel} />}
      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'ready' && profile && (
        <>
          <ProfileCommandHeader
            profile={profile}
            displayName={displayName}
            email={email}
            isActive={isActive}
            isOwner={isOwner}
            isPublishingProfile={isPublishingProfile}
            publishError={publishError}
            onPublishClick={handlePublishClick}
          />

          <ProfileKpiStrip
            profile={profile}
            availability={availability}
            services={services}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <ProfileInfoSection
              profile={profile}
              displayName={displayName}
              email={email}
              phone={phone}
            />

            <HomeSection
              title="Disponibilidade semanal"
              description="Configure dias e horários recorrentes de atendimento deste profissional."
            >
              <div className="mt-4">
                <AvailabilityManager
                  profileId={profileId}
                  slots={availability}
                  onSlotsChange={setAvailability}
                />
              </div>
            </HomeSection>
          </div>

          <HomeSection
            title="Exceções e bloqueios"
            description="Registre folgas, bloqueios e horários especiais em datas específicas."
          >
            <div className="mt-4">
              <ExceptionManager
                profileId={profileId}
                exceptions={exceptions}
                onExceptionsChange={setExceptions}
                hideTitle
              />
            </div>
          </HomeSection>

          <HomeSection
            title="Serviços e procedimentos"
            description="Configure duração, valores e custos estimados dos atendimentos deste profissional."
          >
            <div className="mt-4">
              <ServicesPanel
                profileId={profileId}
                services={services}
                onServicesChange={setServices}
                readOnly={user?.role !== 'OWNER'}
                hideTitle
              />
            </div>
          </HomeSection>

          <ConfirmDialog
            open={confirmUnpublishOpen}
            tone="warning"
            title="Despublicar perfil?"
            subject={profile.displayName}
            description="O perfil deixará de aparecer publicamente até ser publicado novamente."
            confirmLabel="Despublicar"
            cancelLabel="Cancelar"
            isConfirming={isPublishingProfile}
            onConfirm={handleConfirmUnpublish}
            onCancel={() => setConfirmUnpublishOpen(false)}
          />
        </>
      )}
    </AppPage>
  )
}

function ProfileCommandHeader({
  profile,
  displayName,
  email,
  isActive,
  isOwner,
  isPublishingProfile,
  publishError,
  onPublishClick,
}: {
  profile: ProfileDetail
  displayName: string
  email: string | null
  isActive: boolean | null
  isOwner: boolean
  isPublishingProfile: boolean
  publishError: string | null
  onPublishClick: () => void
}) {
  const [firstName, ...lastNameParts] = (displayName || profile.displayName).split(' ')

  return (
    <div className="space-y-4">
      <HomeDashboardHeader
        eyebrow="Perfil profissional"
        title={profile.displayName}
        description="Gerencie dados, disponibilidade, exceções e serviços deste profissional."
        actions={
          isOwner ? (
            <Button
              variant={profile.isPublished ? 'outline' : 'default'}
              size="sm"
              onClick={onPublishClick}
              disabled={isPublishingProfile}
            >
              {isPublishingProfile && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isPublishingProfile
                ? 'Atualizando...'
                : profile.isPublished
                  ? 'Despublicar perfil'
                  : 'Publicar perfil'}
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <TeamMemberAvatar
          firstName={firstName}
          lastName={lastNameParts.join(' ')}
          email={email}
          role="DENTIST"
          size="lg"
        />
        <TeamRoleBadge role="DENTIST" />
        {isActive !== null && (
          <StatusBadge tone={isActive ? 'success' : 'muted'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        )}
        <ProfilePublishBadge isPublished={profile.isPublished} />
      </div>

      {publishError && (
        <InlineFeedback tone="error">{publishError}</InlineFeedback>
      )}
    </div>
  )
}

function ProfileKpiStrip({
  profile,
  availability,
  services,
  isLoading,
}: {
  profile: ProfileDetail
  availability: Availability[]
  services: ServiceItem[]
  isLoading?: boolean
}) {
  const kpis = computeProfileKpis(profile, availability, services)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <HomeKpiCard
        label="Serviços ativos"
        value={String(kpis.activeServices)}
        description={`${services.length} cadastrados`}
        icon={Stethoscope}
        tone="primary"
        isLoading={isLoading}
      />
      <HomeKpiCard
        label="Especialidades"
        value={String(kpis.specialties)}
        description="Áreas vinculadas"
        icon={Award}
        tone="info"
        isLoading={isLoading}
      />
      <HomeKpiCard
        label="Disponibilidade"
        value={String(kpis.availabilityDays)}
        description="dias com horários"
        icon={CalendarClock}
        tone="neutral"
        isLoading={isLoading}
      />
    </div>
  )
}

function ProfileInfoSection({
  profile,
  displayName,
  email,
  phone,
}: {
  profile: ProfileDetail
  displayName: string
  email: string | null
  phone: string | null
}) {
  return (
    <HomeSection
      title="Informações do profissional"
      description="Dados públicos e clínicos usados para identificar este perfil."
    >
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
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
                ? `${profile.crmNumber} - ${profile.crmState}`
                : profile.crmNumber
            }
          />
        )}
        {profile.bio && <InfoRow label="Sobre" value={profile.bio} className="sm:col-span-2" />}
        {profile.profileSpecialties.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Especialidades
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {profile.profileSpecialties.map(({ specialty }) => (
                <span
                  key={specialty.id}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  {specialty.name}
                </span>
              ))}
            </dd>
          </div>
        ) : (
          <InfoRow
            label="Especialidades"
            value="Nenhuma especialidade cadastrada"
            muted
            className="sm:col-span-2"
          />
        )}
      </dl>
    </HomeSection>
  )
}

function InfoRow({
  label,
  value,
  muted = false,
  className,
}: {
  label: string
  value: string
  muted?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
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
          className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
          role="status"
          aria-label="Carregando perfil profissional"
        />
        <p className="text-sm text-muted-foreground">Carregando perfil profissional...</p>
      </div>
    </PanelCard>
  )
}

function ForbiddenState({ backPath, backLabel }: { backPath: string; backLabel: string }) {
  return (
    <HomeEmptyState
      icon={ShieldOff}
      title="Acesso não autorizado"
      description="Você não tem permissão para acessar este perfil profissional."
      action={<BackButton to={backPath} label={backLabel} />}
    />
  )
}

function NotFoundState({ backPath, backLabel }: { backPath: string; backLabel: string }) {
  return (
    <HomeEmptyState
      icon={Stethoscope}
      title="Profissional não encontrado."
      action={<BackButton to={backPath} label={backLabel} />}
    />
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <HomeEmptyState
      icon={CalendarOff}
      title="Não foi possível carregar o perfil profissional."
      action={(
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    />
  )
}
