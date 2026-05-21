import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

const SLIDES = [
  {
    src: '/carousel.png',
    alt: 'DentalFlow — agenda da semana com status de cada consulta',
    caption: 'Agenda visual e inteligente',
    description:
      'Visualize toda a semana de consultas, confirme agendamentos e controle o status de cada atendimento em tempo real.',
    // 1254×1254 (1:1) — container 4:3 corta 25% da altura; top center preserva header e appointments principais
    objectPosition: 'center 28%',
  },
  {
    src: '/carousel1.png',
    alt: 'DentalFlow — painel financeiro com entradas e saídas da clínica',
    caption: 'Controle financeiro completo',
    description:
      'Fluxo de caixa, lançamentos de entradas e saídas, e relatórios consolidados por período — tudo em um só painel.',
    // 1448×1086 (≈4:3) — proporção nativa, preenche o container sem crop
    objectPosition: 'center center',
  },
  {
    src: '/carousel2.png',
    alt: 'DentalFlow — módulo de leads e captação de novos pacientes',
    caption: 'Captação e gestão de leads',
    description:
      'Pipeline de novos contatos, origem dos pacientes e acompanhamento de cada lead até a primeira consulta.',
    // 1448×1086 (≈4:3) — proporção nativa, preenche o container sem crop
    objectPosition: 'center center',
  },
] satisfies {
  src: string
  alt: string
  caption: string
  description: string
  objectPosition: string
}[]

export function ProductCarouselSection() {
  const [current, setCurrent] = useState(0)

  const go = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length)
  const next = () => go((current + 1) % SLIDES.length)

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Na prática
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Como o DentalFlow funciona no dia a dia
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Veja como a plataforma organiza agenda, financeiro e captação de pacientes em clínicas como a sua.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mt-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
              aria-live="polite"
              aria-atomic="true"
            >
              {SLIDES.map((slide, i) => (
                <div
                  key={slide.src}
                  className="aspect-4/3 w-full shrink-0 overflow-hidden"
                  aria-hidden={i !== current}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: slide.objectPosition }}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prev button */}
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={prev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 max-sm:left-2"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>

          {/* Next button */}
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={next}
            className="absolute -right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 max-sm:right-2"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        {/* Caption */}
        <div className="mt-6 min-h-14 text-center">
          <p className="text-base font-semibold text-slate-800">{SLIDES[current].caption}</p>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
            {SLIDES[current].description}
          </p>
        </div>

        {/* Dots */}
        <div
          className="mt-5 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Navegação do carrossel"
        >
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir para slide ${i + 1}: ${slide.caption}`}
              onClick={() => go(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                i === current ? 'w-6 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
