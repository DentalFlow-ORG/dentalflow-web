import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
  className?: string
}

export function ClinicalSectionField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 4,
  className,
}: Props) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={readOnly ? undefined : placeholder}
        readOnly={readOnly}
        className={cn(
          'w-full rounded-md border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-y bg-card',
          readOnly && 'cursor-default bg-muted text-muted-foreground',
        )}
      />
    </div>
  )
}
