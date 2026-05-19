import { useEffect, useState } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { ContactSection } from '../components/ContactSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { HeroSection } from '../components/HeroSection'
import { LandingHeader } from '../components/LandingHeader'
import { PricingSection } from '../components/PricingSection'
import { ProblemSection } from '../components/ProblemSection'
import { ProcessSection } from '../components/ProcessSection'
import { ResultsSection } from '../components/ResultsSection'
import { SolutionsSection } from '../components/SolutionsSection'
import { TrialCtaSection } from '../components/TrialCtaSection'
import { UserProfilesSection } from '../components/UserProfilesSection'

export function LandingPage() {
  useForceLightTheme()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_90%_50%_at_95%_-5%,rgba(56,189,248,0.11)_0%,transparent_52%),linear-gradient(180deg,#eff6ff_0%,#ffffff_50%,#f8fafc_100%)] text-slate-950">
      <LandingHeader isScrolled={isScrolled} />

      <main>
        <HeroSection />

        {/* ── Gradient bridge: light → blue ── */}
        <div aria-hidden="true" className="h-20 bg-gradient-to-b from-sky-50 via-[#1e5baa] to-[#0f3b73]" />
        <ProblemSection />
        {/* ── Gradient bridge: blue → light ── */}
        <div aria-hidden="true" className="h-20 bg-gradient-to-b from-[#0f3b73] via-sky-100 to-white" />

        <SolutionsSection />
        <FeaturesSection />
        <ProcessSection />
        <UserProfilesSection />
        <PricingSection />
        <ResultsSection />
        <ContactSection />
        {/* ── Gradient bridge: light → blue ── */}
        <div aria-hidden="true" className="h-24 bg-gradient-to-b from-white via-sky-100 to-[#0f3b73]" />
        <TrialCtaSection />
      </main>

      <SiteFooter />
    </div>
  )
}
