import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

import { FiscalProfilePageContainer } from '../containers/FiscalProfilePageContainer'

export function FiscalProfilePage() {
  return (
    <AppPage spacing="loose">
      <div>
        <Link
          to="/app/configuracoes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Configurações
        </Link>
      </div>

      <AppPageHeader
        title="Perfil Fiscal"
        description="Dados usados em rascunhos fiscais internos e futuras integrações de emissão."
      />

      <FiscalProfilePageContainer />
    </AppPage>
  )
}
