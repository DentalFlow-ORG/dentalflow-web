import { type HTMLMotionProps, m } from 'motion/react'
import type { ReactNode } from 'react'

import { useRevealOnScroll } from '../../hooks/useRevealOnScroll'
import { DURATION, EASE_OUT, staggerContainer, usePrefersReducedMotion } from '../../lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds to delay the entrance. */
  delay?: number
  /** Vertical travel distance in px. */
  y?: number
  /** IntersectionObserver threshold forwarded to useRevealOnScroll. */
  threshold?: number
}

/**
 * Fades + rises its children into view once, when scrolled into the viewport.
 *
 * Visibility is driven by `useRevealOnScroll` (which already resolves to
 * `true` immediately under reduced motion), keeping the trigger consistent
 * with the rest of the codebase and trivially mockable in tests.
 */
export function Reveal({ children, className, delay = 0, y = 24, threshold }: RevealProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(threshold)
  const reduced = usePrefersReducedMotion()

  return (
    <m.div
      ref={ref}
      initial={reduced ? false : 'hidden'}
      animate={isVisible || reduced ? 'show' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT, delay } },
      }}
      className={className}
    >
      {children}
    </m.div>
  )
}

type StaggerGroupProps = {
  children: ReactNode
  className?: string
  /** Seconds between each child's entrance. */
  stagger?: number
  /** Seconds before the first child animates. */
  delayChildren?: number
  threshold?: number
}

/** Wraps a set of `StaggerItem`s and cascades their entrance on scroll-in. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  threshold,
}: StaggerGroupProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(threshold)
  const reduced = usePrefersReducedMotion()

  return (
    <m.div
      ref={ref}
      initial={reduced ? false : 'hidden'}
      animate={isVisible || reduced ? 'show' : 'hidden'}
      variants={staggerContainer(stagger, delayChildren)}
      className={className}
    >
      {children}
    </m.div>
  )
}

type StaggerItemProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  y?: number
}

/** A single member of a `StaggerGroup`. Inherits the group's cascade timing. */
export function StaggerItem({ children, className, y = 20, ...props }: StaggerItemProps) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
      }}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  )
}
