import { PanelCard } from './PanelCard'

type LoadingCardProps = {
  message: string
}

export function LoadingCard({ message }: LoadingCardProps) {
  return (
    <PanelCard>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </PanelCard>
  )
}
