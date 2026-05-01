import { Eye, EyeOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  icon?: LucideIcon
  variant?: 'default' | 'auth'
  wrapperClassName?: string
}

export function PasswordInput({
  icon: Icon,
  variant = 'default',
  className,
  wrapperClassName,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const buttonLabel = isVisible ? 'Ocultar senha' : 'Mostrar senha'

  return (
    <div
      className={cn(
        'relative',
        variant === 'auth' &&
          'mt-2 rounded-lg border border-slate-300 bg-white focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15',
        wrapperClassName,
      )}
    >
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={cn(
          variant === 'default'
            ? 'h-11 w-full rounded-md border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-950 shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
            : 'h-12 min-w-0 w-full border-0 bg-transparent py-0 pr-11 text-sm text-slate-950 outline-none placeholder:text-slate-400',
          variant === 'auth' && (Icon ? 'pl-10' : 'pl-4'),
          variant === 'default' && Icon && 'pl-10',
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50"
        aria-label={buttonLabel}
        title={buttonLabel}
        disabled={props.disabled}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
