import { useEffect, useState } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { LeadChatWidget } from './LeadChatWidget'
import { PublicHeader } from './PublicHeader'

type PublicLayoutProps = {
  children: React.ReactNode
  showAnnouncement?: boolean
  bgClassName?: string
  /** Controlled mode: pass these to coordinate with HeroSection padding */
  announcementDismissed?: boolean
  onDismissAnnouncement?: () => void
}

export function PublicLayout({
  children,
  showAnnouncement = true,
  bgClassName,
  announcementDismissed: externalDismissed,
  onDismissAnnouncement: externalOnDismiss,
}: PublicLayoutProps) {
  useForceLightTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [internalDismissed, setInternalDismissed] = useState(false)

  const isControlled = externalDismissed !== undefined
  const announcementDismissed = isControlled ? externalDismissed : internalDismissed
  const handleDismiss = isControlled
    ? externalOnDismiss
    : () => setInternalDismissed(true)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={bgClassName ?? 'min-h-screen bg-white text-slate-950'}>
      <PublicHeader
        isScrolled={isScrolled}
        showAnnouncement={showAnnouncement}
        announcementDismissed={announcementDismissed}
        onDismissAnnouncement={handleDismiss}
      />
      <main>{children}</main>
      <SiteFooter />
      <LeadChatWidget />
    </div>
  )
}
