import { ArrowRight } from 'lucide-react'

import { IconCard } from '@/components/common/IconCard'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'

import { features } from '../data/landing-content'

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Recursos"
            title="Elementos para deixar a operação comercial mais clara."
            eyebrowClassName="text-accent-foreground"
          />
          <Button variant="outline" size="lg">
            Ver recursos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <IconCard
              key={feature.title}
              {...feature}
              iconClassName="h-11 w-11 bg-indigo-50 text-[#6366f1]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
