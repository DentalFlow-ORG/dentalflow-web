import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConsentToggleProps = {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export function ConsentToggle({ checked, onChange, disabled = false, className }: ConsentToggleProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40',
        disabled && 'cursor-not-allowed opacity-60',
        checked && 'border-primary/40 bg-primary/5',
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">
          Autorizo o recebimento de lembretes e confirmações pelo WhatsApp.
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
          O paciente pode cancelar a qualquer momento respondendo PARAR.
        </p>
      </div>
    </label>
  )
}
