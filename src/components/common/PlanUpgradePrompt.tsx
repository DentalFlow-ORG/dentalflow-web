import { Link } from '@tanstack/react-router'
import { Lock, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  title: string
  description: string
  buttonVariant?: 'default' | 'outline'
  buttonClassName?: string
}

export function PlanUpgradePrompt({
  title,
  description,
  buttonVariant = 'default',
  buttonClassName,
}: Props) {
  return (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Button size="sm" variant={buttonVariant} asChild className={buttonClassName}>
        <Link to="/app/assinatura">
          <Sparkles className="h-3.5 w-3.5" />
          Ver planos
        </Link>
      </Button>
    </>
  )
}
