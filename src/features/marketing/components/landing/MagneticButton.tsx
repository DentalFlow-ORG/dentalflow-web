import { m, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { usePrefersReducedMotion } from '../../lib/motion'

type MagneticButtonProps = {
  children: ReactNode
  className?: string
  /** 0–1 multiplier for how strongly the element tracks the pointer. */
  strength?: number
}

/**
 * Wraps a CTA so it drifts toward the pointer and springs back on leave —
 * a tactile "magnetic" microinteraction. Purely pointer-driven and decorative:
 * keyboard focus, activation and the inner link/button are untouched, and the
 * effect is disabled entirely under `prefers-reduced-motion`.
 */
export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current
    if (reduced || !node) return
    const rect = node.getBoundingClientRect()
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={reduced ? undefined : { x: springX, y: springY }}
      className={cn('inline-flex', className)}
    >
      {children}
    </m.div>
  )
}
