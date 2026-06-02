import { cn } from '@/lib/utils'

type Props = {
  label: string
  /** Optional subtitle shown below the label — provides brief guidance for the field. */
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
  className?: string
  /**
   * When true, the label and hint are rendered as `sr-only` — visually hidden
   * but still accessible to screen readers. Use this inside a ClinicalSection
   * whose header title already communicates the field's purpose, avoiding
   * on-screen repetition while preserving label semantics.
   */
  hideLabel?: boolean
}

export function ClinicalSectionField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 4,
  className,
  hideLabel = false,
}: Props) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className={cn('space-y-0.5', hideLabel && 'sr-only')}>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        {hint && (
          <p className="text-[11px] leading-tight text-muted-foreground/70">{hint}</p>
        )}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={readOnly ? undefined : placeholder}
        readOnly={readOnly}
        className={cn(
          'w-full rounded-md border border-border px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-y bg-card',
          readOnly && 'cursor-default bg-muted text-muted-foreground',
        )}
      />
    </div>
  )
}
