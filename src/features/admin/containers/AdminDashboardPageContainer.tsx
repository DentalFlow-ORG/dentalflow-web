import { AppPage } from '@/components/layout/AppPage'

import { HomeActionGrid } from '@/features/home/components/HomeActionGrid'
import { HomeDashboardHeader } from '@/features/home/components/HomeDashboardHeader'
import { HomeQuickActionCard } from '@/features/home/components/HomeQuickActionCard'
import { HomeSection } from '@/features/home/components/HomeSection'

import { ADMIN_NAV_CARDS } from '../constants/admin-display'

/**
 * ADMIN home — platform management dashboard.
 *
 * Live platform health KPIs (clinic count, user count, MRR, compliance queue)
 * are deferred: they require a dedicated /admin/stats summary endpoint that does
 * not exist yet. When that endpoint ships, add HomeKpiCard rows here.
 */
export function AdminDashboardPageContainer() {
  return (
    <AppPage spacing="loose">
      <HomeDashboardHeader
        eyebrow="Administração"
        title="Painel da plataforma"
        description="Acompanhe a operação do DentalFlow, clínicas, usuários, financeiro SaaS e compliance."
      />

      <HomeSection
        title="Acessos rápidos"
        description="Navegue para as áreas de administração da plataforma."
      >
        <div className="mt-4">
          <HomeActionGrid columns={2}>
            {ADMIN_NAV_CARDS.map(({ to, icon, label, description }) => (
              <HomeQuickActionCard
                key={to}
                to={to}
                icon={icon}
                title={label}
                description={description}
              />
            ))}
          </HomeActionGrid>
        </div>
      </HomeSection>
    </AppPage>
  )
}
