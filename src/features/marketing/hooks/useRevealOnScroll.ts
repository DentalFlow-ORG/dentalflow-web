import { useEffect, useRef, useState } from 'react'

export function useRevealOnScroll<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || isVisible) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible, threshold])

  return { ref, isVisible }
}
