import { cn } from '@/lib/utils'

type AuroraBackdropProps = {
  className?: string
  /** Render the subtle square grid texture. */
  withGrid?: boolean
}

// Unified dark-section backdrop: a subtle square/grid texture for premium depth
// plus a single, soft, evenly-spread cyan glow. No drifting blobs and no corner
// color bands — the same calm, continuous rhythm is shared across every dark
// section so transitions feel smooth and cohesive rather than "pasted on".
export function AuroraBackdrop({ className, withGrid = true }: AuroraBackdropProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {withGrid && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 95% 85% at 50% 28%, #000 55%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 95% 85% at 50% 28%, #000 55%, transparent 100%)',
          }}
        />
      )}
      {/* Single soft cyan glow — calm and even, no drift, no harsh band */}
      <div
        className="absolute left-1/2 top-[-10%] h-[75%] w-[120%] -translate-x-1/2 rounded-[100%] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.07), transparent 70%)',
        }}
      />
    </div>
  )
}
