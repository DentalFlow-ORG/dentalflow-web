import { cn } from '@/lib/utils'

type SectionDividerVariant =
  | 'dark-to-light'
  | 'dark-to-gray'
  | 'light-to-dark'
  | 'gray-to-dark'
  | 'light-to-blue'
  | 'gray-to-light'
  | 'light-to-gray'

type Config = {
  above: string
  below: string
  lineGradient: string
  shimmerColor: string
  nodeColor: string
  nodeGlow: string
}

const CONFIGS: Record<SectionDividerVariant, Config> = {
  'dark-to-light': {
    above: 'bg-slate-950',
    below: 'bg-white',
    lineGradient: 'transparent, rgba(34,211,238,0.55), transparent',
    shimmerColor: 'rgba(255,255,255,0.7)',
    nodeColor: 'rgba(34,211,238,0.8)',
    nodeGlow: '0 0 8px 3px rgba(34,211,238,0.4)',
  },
  'dark-to-gray': {
    above: 'bg-slate-950',
    below: 'bg-slate-50',
    lineGradient: 'transparent, rgba(34,211,238,0.50), transparent',
    shimmerColor: 'rgba(255,255,255,0.65)',
    nodeColor: 'rgba(34,211,238,0.75)',
    nodeGlow: '0 0 8px 3px rgba(34,211,238,0.38)',
  },
  'light-to-dark': {
    above: 'bg-white',
    below: 'bg-slate-950',
    lineGradient: 'transparent, rgba(148,163,184,0.55), transparent',
    shimmerColor: 'rgba(147,197,253,0.6)',
    nodeColor: 'rgba(148,163,184,0.8)',
    nodeGlow: '0 0 6px 2px rgba(148,163,184,0.35)',
  },
  'gray-to-dark': {
    above: 'bg-slate-50',
    below: 'bg-slate-950',
    lineGradient: 'transparent, rgba(148,163,184,0.55), transparent',
    shimmerColor: 'rgba(147,197,253,0.6)',
    nodeColor: 'rgba(148,163,184,0.8)',
    nodeGlow: '0 0 6px 2px rgba(148,163,184,0.35)',
  },
  'light-to-blue': {
    above: 'bg-white',
    below: 'bg-[#0f3b73]',
    lineGradient: 'transparent, rgba(96,165,250,0.55), transparent',
    shimmerColor: 'rgba(147,197,253,0.65)',
    nodeColor: 'rgba(96,165,250,0.85)',
    nodeGlow: '0 0 8px 3px rgba(96,165,250,0.4)',
  },
  'gray-to-light': {
    above: 'bg-slate-50',
    below: 'bg-white',
    lineGradient: 'transparent, rgba(148,163,184,0.35), transparent',
    shimmerColor: 'rgba(148,163,184,0.5)',
    nodeColor: 'rgba(148,163,184,0.6)',
    nodeGlow: '0 0 5px 2px rgba(148,163,184,0.25)',
  },
  'light-to-gray': {
    above: 'bg-white',
    below: 'bg-slate-50',
    lineGradient: 'transparent, rgba(148,163,184,0.35), transparent',
    shimmerColor: 'rgba(148,163,184,0.5)',
    nodeColor: 'rgba(148,163,184,0.6)',
    nodeGlow: '0 0 5px 2px rgba(148,163,184,0.25)',
  },
}

export function SectionDivider({
  variant,
  className,
}: {
  variant: SectionDividerVariant
  className?: string
}) {
  const cfg = CONFIGS[variant]

  return (
    <div aria-hidden="true" className={cn('relative', className)}>
      <div className={cn('h-6', cfg.above)} />
      <div className={cn('h-6', cfg.below)} />

      {/* Animated separator line */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-px overflow-hidden">
        {/* Static base line */}
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, ${cfg.lineGradient})` }}
        />
        {/* Scanning shimmer */}
        <div
          className="absolute inset-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${cfg.shimmerColor}, transparent)`,
            transform: 'translateX(-100%)',
            animation: 'df-line-scan 5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Center node */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: cfg.nodeColor, boxShadow: cfg.nodeGlow }}
      />
    </div>
  )
}
