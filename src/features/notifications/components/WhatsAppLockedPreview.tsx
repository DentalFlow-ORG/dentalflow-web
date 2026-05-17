import { Lock } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

type WhatsAppLockedPreviewProps = {
  reason?: 'starter_plan' | 'quota_exceeded' | 'no_consent'
}

const MESSAGES: Record<NonNullable<WhatsAppLockedPreviewProps['reason']>, { title: string; body: string }> = {
  starter_plan: {
    title: 'Recurso não disponível no plano atual',
    body: 'O envio de mensagens WhatsApp está disponível nos planos Professional e Premium.',
  },
  quota_exceeded: {
    title: 'Limite mensal atingido',
    body: 'Você utilizou todas as mensagens disponíveis neste mês. Faça upgrade para aumentar seu limite.',
  },
  no_consent: {
    title: 'Consentimento não registrado',
    body: 'Registre o consentimento do paciente antes de enviar mensagens.',
  },
}

export function WhatsAppLockedPreview({ reason = 'starter_plan' }: WhatsAppLockedPreviewProps) {
  const { title, body } = MESSAGES[reason]
  const showUpgrade = reason === 'starter_plan' || reason === 'quota_exceeded'

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-5 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      </div>
      {showUpgrade && (
        <Button asChild size="sm" variant="outline">
          <Link to="/app/assinatura">Ver planos</Link>
        </Button>
      )}
    </div>
  )
}
