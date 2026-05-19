import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'

import { features } from '../data/landing-content'

export function FeaturesSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Recursos"
            title="Tudo que a clínica precisa em um único sistema."
            description="Funcionalidades pensadas para a rotina real de proprietários, dentistas e assistentes."
          />
          <Button variant="outline" size="lg" asChild>
            <Link to="/funcionalidades">
              Ver todas as funcionalidades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
