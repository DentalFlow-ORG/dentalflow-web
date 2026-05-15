import { Loader2 } from 'lucide-react'

import { PanelCard } from './PanelCard'

type LoadingCardProps = {
  message: string
}

export function LoadingCard({ message }: LoadingCardProps) {
  return (
    <PanelCard>
      <div className="flex items-center gap-3" role="status">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-muted-foreground">{message}</span>
      </div>
    </PanelCard>
  )
}
