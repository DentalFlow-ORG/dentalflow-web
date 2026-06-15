import { Play, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

const VIDEO_ID = 'D7vvikAJGyc'
const THUMBNAIL_URL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`
const VIDEO_EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`

export function VideoSection() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>(0.22)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-white py-18 lg:py-22"
      aria-labelledby="landing-video-title"
    >
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
        <div
          className={cn(
            'transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
          )}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Visão geral da plataforma
          </p>
          <h2
            id="landing-video-title"
            className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
          >
            Conheça o DentalFlow em poucos minutos
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Veja como o DentalFlow conecta gestão, automação e clareza operacional para clínicas que
            querem crescer com mais controle e menos retrabalho.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-600">
            {(
              [
                ['Plataforma SaaS para a rotina odontológica', Sparkles],
                ['Controle da clínica sem promessa exagerada', ShieldCheck],
                ['Agenda, pacientes, financeiro e relatórios em um fluxo', PlayCircle],
              ] as const
            ).map(([label, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-950/[0.03]"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/12 transition-all duration-700 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
          )}
          style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-950/5">
            {isPlaying ? (
              <iframe
                src={VIDEO_EMBED_URL}
                title="Conheça o DentalFlow em poucos minutos"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group absolute inset-0 w-full cursor-pointer"
                aria-label="Assistir vídeo do DentalFlow"
              >
                <img
                  src={THUMBNAIL_URL}
                  alt="Miniatura do vídeo DentalFlow"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {/* Dimming overlay */}
                <div className="absolute inset-0 bg-slate-950/35 transition-colors duration-300 group-hover:bg-slate-950/45" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl shadow-black/40 ring-4 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-2xl sm:h-20 sm:w-20">
                    <Play
                      className="ml-1 h-6 w-6 text-slate-900 sm:h-8 sm:w-8"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                {/* Bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/30 to-transparent" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
