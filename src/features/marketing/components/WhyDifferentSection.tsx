import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/ui/button'

import { whyDifferentCards } from '../data/public-content'

export function WhyDifferentSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Nosso diferencial"
            title="Por que o DentalFlow é diferente?"
            description="Uma plataforma projetada para a realidade de clínicas odontológicas — da recepção ao gestor."
          />
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/funcionalidades">
              Ver funcionalidades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyDifferentCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-800">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
