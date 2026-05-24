import { useEffect, useState } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { LeadChatWidget } from './LeadChatWidget'
import { PublicHeader } from './PublicHeader'

type PublicLayoutProps = {
  children: React.ReactNode
  bgClassName?: string
  /** Pass true when the first visible section has a dark background (e.g. landing page) */
  darkHero?: boolean
}

export function PublicLayout({ children, bgClassName, darkHero = false }: PublicLayoutProps) {
  useForceLightTheme()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isScrolled = scrollY > 16
  // Stay in "dark hero" mode until the user scrolls past ~70px, then hand off
  // to the standard light header so the transition feels intentional and smooth.
  const isDarkHero = darkHero && scrollY < 70

  return (
    <div className={bgClassName ? `${bgClassName} overflow-x-hidden` : 'min-h-screen overflow-x-hidden bg-white text-slate-950'}>
      <PublicHeader isScrolled={isScrolled} isDarkHero={isDarkHero} />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <LeadChatWidget />
    </div>
  )
}
