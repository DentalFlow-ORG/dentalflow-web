import { cn } from '@/lib/utils'

type Props<T extends string = string> = {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
}

export function FilterChipGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
