import { Link } from '@tanstack/react-router'
import { ClipboardList, Plus, Stethoscope, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import { listClinicMembers } from '../services/team.service'
import type { MemberListItem } from '../types/team.types'

const ROLE_LABEL: Record<string, string> = {
  DENTIST: 'Profissional',
  ASSISTANT: 'Assistente',
}

const ROLE_ICON: Record<string, React.ElementType> = {
  DENTIST: Stethoscope,
  ASSISTANT: ClipboardList,
}

export function TeamPage() {
  const { showAlert } = useGlobalAlerts()
  const [members, setMembers] = useState<MemberListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClinicMembers()
      .then(setMembers)
      .catch((err) => {
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar a equipe.'
        setError(msg)
        showAlert({ title: 'Erro ao carregar equipe', description: msg, tone: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [showAlert])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AppPageHeader
        eyebrow="Equipe"
        title="Membros da clínica"
        description="Gerencie profissionais e assistentes cadastrados na sua clínica."
        action={
          <Button asChild>
            <Link to="/app/equipe/novo">
              <Plus className="h-4 w-4" />
              Adicionar membro
            </Link>
          </Button>
        }
      />

      {error && <InlineFeedback>{error}</InlineFeedback>}

      {isLoading ? (
        <LoadingCard message="Carregando membros..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro cadastrado"
          description="Adicione profissionais e assistentes para gerenciar a equipe da clínica."
          action={
            <Button asChild>
              <Link to="/app/equipe/novo">
                <Plus className="h-4 w-4" />
                Adicionar membro
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {members.map((member) => {
            const RoleIcon = ROLE_ICON[member.role] ?? Users
            return (
              <PanelCard key={member.id}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <RoleIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <StatusBadge tone={member.isActive ? 'success' : 'muted'}>
                        {member.isActive ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                      <StatusBadge tone="muted">
                        {ROLE_LABEL[member.role] ?? member.role}
                      </StatusBadge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{member.email}</p>
                    {member.profile && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {member.profile.displayName}
                        {member.profile.slug ? ` · /${member.profile.slug}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </PanelCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
