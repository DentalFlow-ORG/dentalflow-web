import { impactMetrics } from '../data/public-content'

export function MetricsSection() {
  return (
    <section className="bg-primary py-14 lg:py-16" aria-label="Potencial de impacto operacional">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
          Potencial de impacto operacional · exemplo ilustrativo
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm"
            >
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              <p className="mt-2 text-sm font-medium text-blue-200">{metric.label}</p>
              {metric.note && (
                <p className="mt-1.5 text-xs leading-5 text-blue-300/80">{metric.note}</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-blue-300/70">
          Valores de referência baseados na estrutura da plataforma. Resultados reais variam conforme o uso e a operação de cada clínica.
        </p>
      </div>
    </section>
  )
}
