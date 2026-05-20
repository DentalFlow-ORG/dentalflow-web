import { PlayCircle } from 'lucide-react'

// Set VITE_DEMO_VIDEO_URL in your .env file to embed a real YouTube video.
const VIDEO_URL = import.meta.env.VITE_DEMO_VIDEO_URL as string | undefined

export function VideoSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Conheça a plataforma
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Veja o DentalFlow em ação
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
          Em poucos minutos, veja como a plataforma organiza a rotina de uma clínica — da agenda ao financeiro.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
          {VIDEO_URL ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={VIDEO_URL}
                title="Demonstração DentalFlow"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <div
              className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-primary/90"
              aria-label="Espaço para vídeo institucional"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <PlayCircle className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  Vídeo institucional em preparação
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Em breve, veja como o DentalFlow organiza a rotina da clínica
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Prefere uma demonstração ao vivo?{' '}
          <a href="/perguntas-frequentes#contato" className="font-medium text-primary hover:underline">
            Fale com nosso time.
          </a>
        </p>
      </div>
    </section>
  )
}
