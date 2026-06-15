import { cn } from '@/lib/utils'

type AuroraBackdropProps = {
  className?: string
  /** Render a faint engineering grid behind the glow. */
  withGrid?: boolean
}

// Calm, premium atmosphere: two soft, low-opacity glows (cyan + blue only — no
// loud green) and a barely-there masked grid. Each glow animates `transform`
// only (cheap) and the drift is gated behind `prefers-reduced-motion` in CSS.
export function AuroraBackdrop({ className, withGrid = true }: AuroraBackdropProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {withGrid && (
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 30%, #000 30%, transparent 100%)',
          }}
        />
      )}
      {/* Soft cyan glow, upper area */}
      <div
        className="df-aurora-drift absolute left-[16%] top-[-22%] h-[55%] w-[68%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />
      {/* Soft blue glow, lower area */}
      <div
        className="df-aurora-drift absolute left-[12%] bottom-[-26%] h-[58%] w-[76%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.10), transparent 72%)',
          animationDelay: '-9s',
        }}
      />
    </div>
  )
}
