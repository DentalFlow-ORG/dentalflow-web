import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  eyebrowClassName?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  eyebrowClassName,
}: SectionHeadingProps) {
  const isDark = tone === 'dark'

  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p
        className={cn(
          'text-sm font-semibold uppercase tracking-[0.18em]',
          isDark ? 'text-emerald-300' : 'text-primary',
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-4 text-4xl font-semibold leading-tight',
          isDark ? 'text-white' : 'text-slate-950',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-5 leading-7',
            isDark ? 'text-slate-300' : 'text-slate-600',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
