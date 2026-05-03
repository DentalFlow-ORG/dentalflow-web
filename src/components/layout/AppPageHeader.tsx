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
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}
