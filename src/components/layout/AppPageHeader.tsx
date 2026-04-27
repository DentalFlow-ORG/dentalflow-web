import type { ReactNode } from 'react'

type AppPageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  action,
}: AppPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
