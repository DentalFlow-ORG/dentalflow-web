import { ContactSection } from '../components/ContactSection'
import { usePageMeta } from '../hooks/usePageMeta'
import { FeatureBlocksSection } from '../components/FeatureBlocksSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { HeroSection } from '../components/HeroSection'
import { MacbookIntroSection } from '../components/MacbookIntroSection'
import { MetricsSection } from '../components/MetricsSection'
import { PricingSection } from '../components/PricingSection'
import { ProblemSection } from '../components/ProblemSection'
import { ProcessSection } from '../components/ProcessSection'
import { ProductCarouselSection } from '../components/ProductCarouselSection'
import { PublicLayout } from '../components/PublicLayout'
import { ResultsSection } from '../components/ResultsSection'
import { SituationSection } from '../components/SituationSection'
import { SolutionsSection } from '../components/SolutionsSection'
import { TrialCtaSection } from '../components/TrialCtaSection'
import { TrustSection } from '../components/TrustSection'
import { UserProfilesSection } from '../components/UserProfilesSection'
import { VideoSection } from '../components/VideoSection'
import { WhyDifferentSection } from '../components/WhyDifferentSection'

export function LandingPage() {
  usePageMeta(
    'DentalFlow | Sistema para clínicas odontológicas',
    'Centralize agenda, pacientes, financeiro, estoque, leads e IA em uma plataforma moderna para clínicas odontológicas. 7 dias grátis.',
  )

  return (
    <PublicLayout
      darkHero
      bgClassName="min-h-screen bg-[radial-gradient(ellipse_90%_50%_at_95%_-5%,rgba(56,189,248,0.11)_0%,transparent_52%),linear-gradient(180deg,#eff6ff_0%,#ffffff_50%,#f8fafc_100%)] text-slate-950"
    >
      <MacbookIntroSection />

      {/* Gradient bridge: dark → light hero */}
      <div aria-hidden="true" className="h-16 bg-linear-to-b from-slate-950 via-[#0c2a55] to-[#eff6ff]" />

      <HeroSection />

      <ProductCarouselSection />

      {/* ── Gradient bridge: light → blue ── */}
      <div aria-hidden="true" className="h-20 bg-linear-to-b from-sky-50 via-[#1e5baa] to-[#0f3b73]" />
      <ProblemSection />
      {/* ── Gradient bridge: blue → light ── */}
      <div aria-hidden="true" className="h-20 bg-linear-to-b from-[#0f3b73] via-sky-100 to-white" />

      <SolutionsSection />
      <FeatureBlocksSection />
      <SituationSection />
      <FeaturesSection />
      <ProcessSection />
      <WhyDifferentSection />
      <UserProfilesSection />
      <MetricsSection />
      <PricingSection />
      <TrustSection />
      <VideoSection />
      <ResultsSection />
      <ContactSection />
      {/* ── Gradient bridge: light → blue ── */}
      <div aria-hidden="true" className="h-24 bg-linear-to-b from-white via-sky-100 to-[#0f3b73]" />
      <TrialCtaSection />
    </PublicLayout>
  )
}
