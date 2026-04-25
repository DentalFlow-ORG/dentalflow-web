import { Star } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

import { results, testimonials } from '../data/landing-content'

export function ResultsSection() {
  return (
    <section id="resultados" className="border-y border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="Resultados"
            title="Uma experiência digital que combina imagem, processo e dados."
            description="O objetivo não é apenas ter mais telas bonitas. É transformar o digital em uma estrutura comercial mais confiável para a clínica."
            eyebrowClassName="text-secondary"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {results.map((item) => (
              <div
                key={item.value}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
              >
                <p className="text-2xl font-semibold text-primary">
                  {item.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {testimonials.map((item) => (
            <article
              key={item.author}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-1 text-[#6366f1]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                "{item.quote}"
              </p>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="font-semibold text-slate-950">{item.author}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
