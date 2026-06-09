import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { BackButton } from '@/components/common/BackButton'

import { FiscalProfilePageContainer } from '../containers/FiscalProfilePageContainer'

export function FiscalProfilePage() {
  return (
    <AppPage spacing="loose">
      <AppPageHeader
        eyebrow="Configurações"
        title="Perfil Fiscal"
        description="Dados usados em rascunhos fiscais internos e futuras integrações de emissão."
        action={<BackButton to="/app/configuracoes" label="Configurações" variant="ghost" />}
      />

      <FiscalProfilePageContainer />
    </AppPage>
  )
}
