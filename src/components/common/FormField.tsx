import type { ComponentProps, ReactNode } from 'react'

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
    <div className={cn('block space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        {label}
        {optional && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            Opcional
          </span>
        )}
      </label>
      {children}
      {hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}
    </div>
  )
}

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-950 shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  )
}
