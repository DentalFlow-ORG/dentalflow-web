import { Link } from '@tanstack/react-router'

import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'

export function SubscriptionSuccessPage() {
  return (
    <AppPage>
      <AppPageHeader
        title="Assinatura iniciada com sucesso"
        description="Sua assinatura foi iniciada com sucesso. Estamos sincronizando os dados com a Stripe. Se a assinatura ainda não aparecer, aguarde alguns segundos e atualize a página."
      />
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/app/assinatura">Voltar para assinatura</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/app">Ir para o painel</Link>
        </Button>
      </div>
    </AppPage>
  )
}
