import { useEffect } from 'react'

import { AnimatedImpactSection } from '../components/AnimatedImpactSection'
import { usePageMeta } from '../hooks/usePageMeta'
import { HeroSection } from '../components/HeroSection'
import { LandingIntegrationsSection } from '../components/LandingIntegrationsSection'
import { MacbookIntroSection } from '../components/MacbookIntroSection'
import { PricingSection } from '../components/PricingSection'
import { ProductCarouselSection } from '../components/ProductCarouselSection'
import { PublicLayout } from '../components/PublicLayout'
import { SectionDivider } from '../components/SectionDivider'
import { TrialCtaSection } from '../components/TrialCtaSection'
import { VideoSection } from '../components/VideoSection'

export function LandingPage() {
  usePageMeta(
    'DentalFlow | Sistema para clínicas odontológicas',
    'Centralize agenda, pacientes, financeiro, estoque, leads e IA em uma plataforma moderna para clínicas odontológicas. 7 dias grátis.',
  )

  useEffect(() => {
    if (!window.location.hash) return

    const timeout = window.setTimeout(() => {
      const target = document.getElementById(window.location.hash.slice(1))
      target?.scrollIntoView({ block: 'start' })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <PublicLayout darkHero bgClassName="min-h-screen bg-white text-slate-950">
      <MacbookIntroSection />

      <SectionDivider variant="dark-to-light" />

      <HeroSection />

      <ProductCarouselSection />
      <SectionDivider variant="light-to-dark" />
      <LandingIntegrationsSection />
      <SectionDivider variant="dark-to-gray" />
      <AnimatedImpactSection />

      <SectionDivider variant="gray-to-dark" />
      <VideoSection />

      <SectionDivider variant="dark-to-light" />
      <PricingSection />

      <SectionDivider variant="light-to-blue" />
      <TrialCtaSection />
    </PublicLayout>
  )
}
