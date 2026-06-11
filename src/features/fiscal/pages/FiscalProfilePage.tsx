import { BackButton } from '@/components/common/BackButton'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

import { FiscalProfilePageContainer } from '../containers/FiscalProfilePageContainer'

export function FiscalProfilePage() {
  return (
    <AppPage spacing="loose">
      <div>
        <BackButton to="/app/configuracoes" label="Configurações" variant="ghost" />
      </div>

      <AppPageHeader
        title="Perfil Fiscal"
        description="Dados usados em rascunhos fiscais internos e futuras integrações de emissão."
      />

      <FiscalProfilePageContainer />
    </AppPage>
  )
}
