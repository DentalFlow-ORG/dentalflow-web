import type { Variants } from 'motion/react'
import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared motion language for the marketing landing page.
//
// One source of truth for easings, durations and reveal variants so every
// section animates with the same rhythm. Reveal triggering is delegated to the
// existing `useRevealOnScroll` hook (IntersectionObserver) — these helpers only
// describe *how* an element animates once it is asked to appear.
// ─────────────────────────────────────────────────────────────────────────────

/** Expressive ease-out used for entrances (overshoot-free, decelerates softly). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.9,
} as const

/** Container variants that cascade their children's `show` state. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

/**
 * Reactive `prefers-reduced-motion` flag.
 *
 * Guards `matchMedia` so it is safe under jsdom / SSR (where it may be
 * undefined). Components use it to skip transforms, parallax and looping
 * animation, falling back to a static layout.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
