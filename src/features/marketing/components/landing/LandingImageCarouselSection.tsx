import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

import { Reveal } from './Reveal'

const SLIDES = [
  {
    src: '/carousel.png',
    // Actual product screen; labeled generically so the caption stays honest
    // even if the UI evolves.
    alt: 'Prévia visual da experiência DentalFlow — gestão da clínica',
    caption: 'Gestão da clínica',
    description: 'Agenda, consultas e operação da clínica organizados em uma visão única.',
    // Image is 1254 × 1254 (1:1). The 4:3 container crops ~25 % of height;
    // top-center preserves the header and main content area.
    objectPosition: 'center 28%',
    width: 1254,
    height: 1254,
  },
  {
    src: '/carousel1.png',
    alt: 'Prévia visual da experiência DentalFlow — rotina de atendimento',
    caption: 'Rotina de atendimento',
    description:
      'Controle financeiro, lançamentos e relatórios para a gestão do dia a dia da clínica.',
    objectPosition: 'center center',
    width: 1448,
    height: 1086,
  },
  {
    src: '/carousel2.png',
    alt: 'Prévia visual da experiência DentalFlow — operação conectada',
    caption: 'Operação conectada',
    description: 'Captação de novos pacientes e acompanhamento do pipeline da clínica.',
    objectPosition: 'center center',
    width: 1448,
    height: 1086,
  },
] satisfies {
  src: string
  alt: string
  caption: string
  description: string
  objectPosition: string
  width: number
  height: number
}[]

export function LandingImageCarouselSection() {
  const [current, setCurrent] = useState(0)

  const go = useCallback((index: number) => setCurrent(index), [])
  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length)
  const next = () => go((current + 1) % SLIDES.length)

  return (
    <section aria-labelledby="img-carousel-heading" className="bg-slate-950 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Visual da plataforma
          </p>
          <h2
            id="img-carousel-heading"
            className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            Veja o DentalFlow em ação
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Uma visão da experiência criada para organizar agenda, pacientes, financeiro e operação
            da clínica em um só lugar.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          {/* Carousel track */}
          <div className="relative mt-10">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
              <div
                className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${current * 100}%)` }}
                aria-live="polite"
                aria-atomic="true"
              >
                {SLIDES.map((slide, i) => (
                  <div
                    key={slide.src}
                    className="aspect-4/3 w-full shrink-0 overflow-hidden bg-slate-900"
                    aria-hidden={i !== current}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      width={slide.width}
                      height={slide.height}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: slide.objectPosition }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Prev */}
            <button
              type="button"
              aria-label="Slide anterior"
              onClick={prev}
              className="absolute -left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800 shadow-md transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 max-sm:left-2"
            >
              <ChevronLeft className="h-5 w-5 text-slate-200" aria-hidden="true" />
            </button>

            {/* Next */}
            <button
              type="button"
              aria-label="Próximo slide"
              onClick={next}
              className="absolute -right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800 shadow-md transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 max-sm:right-2"
            >
              <ChevronRight className="h-5 w-5 text-slate-200" aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        {/* Caption */}
        <div className="mt-6 min-h-18 text-center">
          <p className="text-base font-semibold text-slate-100">{SLIDES[current].caption}</p>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-slate-400">
            {SLIDES[current].description}
          </p>
        </div>

        {/* Dot navigation */}
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
                'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50',
                i === current ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-500',
              )}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Imagens ilustrativas da experiência DentalFlow.
        </p>
      </div>
    </section>
  )
}
