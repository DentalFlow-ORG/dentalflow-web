import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'

import { cn } from '@/lib/utils'

type Props = {
  id: string
  title: string
  icon?: LucideIcon
  /** Shows a small content-dot in the header when the section has data. */
  hasContent?: boolean
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  /** Override card background/border — used for the amber private-notes variant. */
  className?: string
}

/**
 * Collapsible section card used by the clinical record editor.
 * Wraps Radix Collapsible for smooth height animation.
 * The header is fully keyboard-navigable (button) with aria-expanded.
 */
export function ClinicalSection({
  id,
  title,
  icon: Icon,
  hasContent,
  expanded,
  onToggle,
  children,
  className,
}: Props) {
  const triggerId = `section-trigger-${id}`
  const contentId = `section-content-${id}`

  return (
    <Collapsible.Root
      open={expanded}
      onOpenChange={onToggle}
      className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}
    >
      <Collapsible.Trigger
        id={triggerId}
        aria-controls={contentId}
        className={cn(
          'flex w-full min-h-[52px] items-center justify-between px-5 py-3.5 text-left',
          'transition-colors duration-150',
          expanded ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40',
        )}
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors duration-150',
                expanded ? 'text-primary/70' : 'text-muted-foreground',
              )}
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              'text-sm font-semibold transition-colors duration-150',
              expanded ? 'text-foreground' : 'text-foreground/80',
            )}
          >
            {title}
          </span>
          {hasContent && (
            <span
              className={cn(
                'inline-block h-2 w-2 shrink-0 rounded-full transition-colors duration-150',
                expanded ? 'bg-primary/60' : 'bg-muted-foreground/35',
              )}
              aria-hidden="true"
            />
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-[transform,color] duration-200',
            expanded ? 'rotate-180 text-primary/50' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />
      </Collapsible.Trigger>

      <Collapsible.Content
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
      >
        <div className="border-t border-border px-5 py-5">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
