import { ShieldCheck } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'

import { trustPoints } from '../data/landing-content'

export function ContactSection() {
  return (
    <section id="seguranca" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Confiança e privacidade"
            title="Construído com segurança e boas práticas."
            description="O DentalFlow foi desenvolvido com controle de acesso por função, autenticação segura e organização responsável de dados — sem promessas jurídicas, mas com cuidado real."
            align="center"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon
            return (
              <article
                key={point.title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{point.description}</p>
              </article>
            )
          })}
        </div>

        <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-900">Sem certificações exageradas.</span>{' '}
              O DentalFlow aplica boas práticas de segurança e controle de acesso por função. Não fazemos promessas de conformidade jurídica sem base técnica ou legal comprovada.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
