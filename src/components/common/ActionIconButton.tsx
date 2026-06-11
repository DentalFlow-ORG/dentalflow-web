import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'default' | 'danger' | 'success' | 'warning'

type ActionIconButtonProps = ComponentProps<'button'> & {
  tone?: Tone
}

const TONE_CLASSES: Record<Tone, string> = {
  default: 'text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-primary/15',
  danger:
    'text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300 focus:ring-red-500/15',
  success:
    'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 focus:ring-emerald-500/15',
  warning:
    'text-muted-foreground hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/40 dark:hover:text-amber-300 focus:ring-amber-500/15',
}

export function ActionIconButton({
  tone = 'default',
  className,
  type = 'button',
  ...props
}: ActionIconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-30',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  )
}
