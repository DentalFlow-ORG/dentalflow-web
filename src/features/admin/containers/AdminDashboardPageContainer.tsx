import { Link } from '@tanstack/react-router'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

import { ADMIN_NAV_CARDS } from '../constants/admin-display'

export function AdminDashboardPageContainer() {
  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Administração"
        title="Painel administrativo"
        description="Gerencie a plataforma DentalFlow e acompanhe as clínicas."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_NAV_CARDS.map(({ to, icon: Icon, label, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppPage>
  )
}
