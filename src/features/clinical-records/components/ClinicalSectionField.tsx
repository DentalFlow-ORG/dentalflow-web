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
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={readOnly ? undefined : placeholder}
        readOnly={readOnly}
        className={cn(
          'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-y',
          readOnly && 'cursor-default bg-slate-50 text-slate-600',
        )}
      />
    </div>
  )
}
