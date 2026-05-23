import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppPage } from '@/components/layout/AppPage'
import { AppPageHeader } from '@/components/layout/AppPageHeader'

type PlanUpgradeNoticeProps = {
  title?: string
  description?: string
}

export function PlanUpgradeNotice({
  title = 'Recurso não disponível no seu plano',
  description = 'Este recurso não está disponível no seu plano atual. Faça upgrade para liberar esta funcionalidade.',
}: PlanUpgradeNoticeProps) {
  return (
    <AppPage>
      <AppPageHeader title={title} />
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button asChild>
          <Link to="/app/assinatura">Ver planos e fazer upgrade</Link>
        </Button>
      </div>
    </AppPage>
  )
}
