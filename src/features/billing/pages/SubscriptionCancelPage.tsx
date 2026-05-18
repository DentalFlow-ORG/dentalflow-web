import { Link } from '@tanstack/react-router'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { BackButton } from '@/components/common/BackButton'
import { Button } from '@/components/ui/button'

export function SubscriptionCancelPage() {
  return (
    <AppPage>
      <AppPageHeader
        title="Assinatura não concluída"
        description="O processo de assinatura foi cancelado ou não foi concluído. Nenhum plano foi ativado. Você pode escolher um plano novamente quando quiser."
      />
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/app/assinatura">Escolher plano</Link>
        </Button>
        <BackButton to="/app" label="Voltar ao painel" size="default" />
      </div>
    </AppPage>
  )
}
