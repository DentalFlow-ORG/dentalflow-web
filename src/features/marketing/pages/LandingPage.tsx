import { useEffect, useState } from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { useForceLightTheme } from '@/features/theme/useForceLightTheme'

import { ContactSection } from '../components/ContactSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { HeroSection } from '../components/HeroSection'
import { LandingHeader } from '../components/LandingHeader'
import { ProblemSection } from '../components/ProblemSection'
import { ProcessSection } from '../components/ProcessSection'
import { ResultsSection } from '../components/ResultsSection'
import { SolutionsSection } from '../components/SolutionsSection'
import { TrialCtaSection } from '../components/TrialCtaSection'

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_34%,#f1f5f9_100%)] text-slate-950">
      <LandingHeader isScrolled={isScrolled} />

      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionsSection />
        <TrialCtaSection />
        <ProcessSection />
        <FeaturesSection />
        <ResultsSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  )
}
