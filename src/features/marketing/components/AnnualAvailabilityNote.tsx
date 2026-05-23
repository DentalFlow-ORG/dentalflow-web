import { cn } from '@/lib/utils'

type Props = {
  visible: boolean
  variant?: 'light' | 'dark'
}

export function AnnualAvailabilityNote({ visible, variant = 'light' }: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        visible ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <p className={cn('text-center text-xs', variant === 'dark' ? 'text-slate-600' : 'text-slate-400')}>
        Plano anual sujeito à disponibilidade no momento da contratação.
      </p>
    </div>
  )
}
