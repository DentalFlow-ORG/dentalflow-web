import { Link } from '@tanstack/react-router'
import { BarChart3, BriefcaseBusiness, UserRound } from 'lucide-react'

import { IconCard } from '@/components/common/IconCard'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getUserDisplayName } from '@/features/auth/utils/name'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AppPageHeader
        eyebrow="Plataforma"
        title="Visão geral"
        description="Acompanhe a estrutura inicial da clínica e acesse os módulos operacionais do DentalFlow."
        action={
          <Button asChild>
            <Link to="/app/perfis">Gerenciar perfis</Link>
          </Button>
        }
      />

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
          description="Primeiro módulo operacional conectado ao backend para criar páginas públicas, publicar profissionais e cadastrar serviços."
          iconClassName="bg-emerald-50 text-emerald-700"
        >
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/perfis">Abrir perfis</Link>
          </Button>
        </IconCard>

        <IconCard
          icon={BarChart3}
          title="Próximos módulos"
          description="Leads, métricas e billing já têm base no backend, mas ainda precisam evoluir para contratos reais antes de virar UI definitiva."
          iconClassName="bg-indigo-50 text-[#6366f1]"
        />
      </div>
    </div>
  )
}
