import { IconCard } from '@/components/common/IconCard'
import { SectionHeading } from '@/components/common/SectionHeading'

import { solutions } from '../data/landing-content'

export function SolutionsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Solucao"
          title="Uma base premium para atrair, converter e medir crescimento."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution) => (
            <IconCard key={solution.title} {...solution} />
          ))}
        </div>
      </div>
    </section>
  )
}
