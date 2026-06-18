import { LazyMotion, domAnimation } from 'motion/react'
import { useEffect } from 'react'

import { AnimatedImpactSection } from '../components/AnimatedImpactSection'
import { DataMigrationSection } from '../components/DataMigrationSection'
import { LandingIntegrationsSection } from '../components/LandingIntegrationsSection'
import { PricingSection } from '../components/PricingSection'
import { PublicLayout } from '../components/PublicLayout'
import { SectionDivider } from '../components/SectionDivider'
import { TrialCtaSection } from '../components/TrialCtaSection'
import { VideoSection } from '../components/VideoSection'
import { DentalArchSection } from '../components/landing/DentalArchSection'
import { LandingHero } from '../components/landing/LandingHero'
import { ModulesSection } from '../components/landing/ModulesSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { ProductShowcaseSection } from '../components/landing/ProductShowcaseSection'
import { SolutionSection } from '../components/landing/SolutionSection'
import { usePageMeta } from '../hooks/usePageMeta'

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

  // `LazyMotion` + `domAnimation` loads only the animation features the landing
  // page needs, keeping the motion runtime small. All `m.*` components on the
  // page resolve their features through this provider.
  return (
    <PublicLayout darkHero bgClassName="min-h-screen bg-white text-slate-950">
      <LazyMotion features={domAnimation} strict>
        <LandingHero />

        <SectionDivider variant="dark-to-light" />
        <ProblemSection />

        {/* Dental-identity centerpiece: interactive arch of clinic workflows */}
        <SectionDivider variant="light-to-dark" />
        <DentalArchSection />

        <SectionDivider variant="dark-to-light" />
        <ModulesSection />

        {/* Honest, code-rendered product proof */}
        <SectionDivider variant="light-to-gray" />
        <ProductShowcaseSection />

        <SectionDivider variant="gray-to-dark" />
        <LandingIntegrationsSection />

        <SectionDivider variant="dark-to-gray" />
        <AnimatedImpactSection />

        {/* "Everything connected" system overview right before the plans */}
        <SectionDivider variant="gray-to-dark" />
        <SolutionSection />

        <SectionDivider variant="dark-to-light" />
        <DataMigrationSection />

        <SectionDivider variant="light-to-dark" />
        <PricingSection />

        <SectionDivider variant="dark-to-light" />
        <VideoSection />

        <SectionDivider variant="light-to-blue" />
        <TrialCtaSection />
      </LazyMotion>
    </PublicLayout>
  )
}
