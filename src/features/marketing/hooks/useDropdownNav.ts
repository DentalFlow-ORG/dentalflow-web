import { useEffect, useRef, useState } from 'react'

/**
 * Owns the navigation menu UI state for PublicHeader:
 * - which desktop dropdown is open
 * - mobile menu open/closed
 * - which mobile accordion sections are expanded
 * - click-outside and Escape-key close effects
 */
export function useDropdownNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([])
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const toggleDropdown = (key: string) => setOpenDropdown((prev) => (prev === key ? null : key))

  const closeDropdown = () => setOpenDropdown(null)

  const toggleMobile = () => setIsMobileOpen((prev) => !prev)

  const closeMobile = () => setIsMobileOpen(false)

  const toggleMobileSection = (key: string) =>
    setMobileExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )

  return {
    openDropdown,
    isMobileOpen,
    mobileExpanded,
    headerRef,
    toggleDropdown,
    closeDropdown,
    toggleMobile,
    closeMobile,
    toggleMobileSection,
  }
}
