import type { ComponentProps, ReactNode } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'

import { cn } from '@/lib/utils'

type FormFieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  hint,
  optional = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-x-2 text-sm font-semibold text-foreground"
      >
        <span className="min-w-0 truncate">{label}</span>
        {optional && (
          <span className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Opcional
          </span>
        )}
      </label>
      {children}
      {hint && <span className="block text-xs leading-5 text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function DateInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <TextInput
        type="date"
        className={cn('pl-9 [color-scheme:light] dark:[color-scheme:dark]', className)}
        {...props}
      />
    </div>
  )
}

export function TimeInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <div className="relative">
      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <TextInput
        type="time"
        className={cn('pl-9 [color-scheme:light] dark:[color-scheme:dark]', className)}
        {...props}
      />
    </div>
  )
}

export function TextArea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
