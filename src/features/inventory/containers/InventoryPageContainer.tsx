import { Package } from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { PanelCard } from '@/components/common/PanelCard'

export function InventoryPageContainer() {
  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Estoque"
        title="Controle de Estoque"
        description="Gerencie produtos, categorias e acompanhe os níveis de estoque da clínica."
      />
      <PanelCard>
        <div className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
          <Package className="h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm">O módulo de estoque está em construção.</p>
        </div>
      </PanelCard>
    </AppPage>
  )
}
