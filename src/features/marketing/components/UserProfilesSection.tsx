import { CheckCircle2 } from 'lucide-react'

import { SectionHeading } from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'

import { userProfiles } from '../data/landing-content'

const PROFILE_ACCENT: Record<string, string> = {
  Proprietário: 'bg-primary/10 text-primary',
  Dentista: 'bg-blue-50 text-blue-700',
  Assistente: 'bg-indigo-50 text-indigo-700',
}

const PROFILE_BADGE: Record<string, string> = {
  Proprietário: 'bg-primary/10 text-primary',
  Dentista: 'bg-blue-100 text-blue-700',
  Assistente: 'bg-indigo-100 text-indigo-700',
}

const PROFILE_TESTIMONIALS: Record<string, { quote: string; author: string }> = {
  Proprietário: {
    quote: 'Finalmente consigo ver tudo da clínica em um único lugar, sem depender de planilha.',
    author: 'Dr. Fábio M., Belo Horizonte',
  },
  Dentista: {
    quote: 'Finalmente um sistema que não precisa de treinamento. Abri e já comecei a usar.',
    author: 'Dra. Camila R., São Paulo',
  },
  Assistente: {
    quote: 'Muito mais fácil e rápido do que a planilha que a gente usava antes.',
    author: 'Letícia S., Curitiba',
  },
}

export function UserProfilesSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <SectionHeading
            eyebrow="Para cada perfil"
            title="Feito para quem usa de verdade."
            description="O DentalFlow foi pensado para que proprietários, dentistas e assistentes tenham exatamente o que precisam — sem excesso, sem falta."
            align="center"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {userProfiles.map((profile) => {
            const Icon = profile.icon
            const testimonial = PROFILE_TESTIMONIALS[profile.role]
            return (
              <article
                key={profile.role}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    PROFILE_ACCENT[profile.role],
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      PROFILE_BADGE[profile.role],
                    )}
                  >
                    {profile.role}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-semibold text-slate-900">{profile.headline}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{profile.description}</p>

                <ul className="mt-5 space-y-2" aria-label={`Recursos para ${profile.role}`}>
                  {profile.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Testimonial stub */}
                {testimonial && (
                  <blockquote className="mt-6 border-t border-slate-100 pt-5">
                    <p className="text-sm italic leading-6 text-slate-400">
                      "{testimonial.quote}"
                    </p>
                    <footer className="mt-2 text-xs font-medium text-slate-400">
                      — {testimonial.author}
                    </footer>
                  </blockquote>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
