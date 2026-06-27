import { Loader2 } from 'lucide-react'

type FullPageSpinnerProps = {
  message: string
}

export function FullPageSpinner({ message }: FullPageSpinnerProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background"
      role="status"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium text-muted-foreground">{message}</span>
    </div>
  )
}
