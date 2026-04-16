import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Headset,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const navigationItems = [
  'Solucoes',
  'Resultados',
  'Especialidades',
  'Contato',
]

const quickActions = [
  {
    icon: LayoutDashboard,
    title: 'Gestao centralizada',
    description: 'Organize processos, campanhas e indicadores em um unico lugar.',
  },
  {
    icon: BarChart3,
    title: 'Crescimento mensuravel',
    description: 'Acompanhe a evolucao da sua presenca digital com clareza.',
  },
  {
    icon: ShieldCheck,
    title: 'Posicionamento premium',
    description: 'Transmita mais autoridade com uma experiencia confiavel e moderna.',
  },
]

const workflowHighlights = [
  {
    icon: Sparkles,
    title: 'Marketing com estrategia',
    description: 'Campanhas planejadas para atrair pacientes mais qualificados.',
  },
  {
    icon: CalendarDays,
    title: 'Rotina mais eficiente',
    description: 'Visualize prioridades e alinhe a operacao da clinica com previsibilidade.',
  },
  {
    icon: Headset,
    title: 'Acompanhamento consultivo',
    description: 'Suporte proximo para manter consistencia e acelerar decisoes.',
  },
]

function App() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_38%),linear-gradient(180deg,_#F8FAFC_0%,_#FFFFFF_45%,_#F1F5F9_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(90deg,rgba(30,58,138,0.12),rgba(16,185,129,0.08),rgba(99,102,241,0.12))] blur-3xl" />

      <header
        className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-white/70 bg-[rgba(248,250,252,0.82)] backdrop-blur-xl shadow-[0_14px_40px_rgba(15,23,42,0.06)]'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
          <div
            className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-300 ${
              isScrolled
                ? 'bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.5),transparent)] opacity-100'
                : 'opacity-0'
            }`}
          />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-white shadow-[0_12px_30px_rgba(30,58,138,0.08)]">
                <img
                  src="/logo-without-bg.png"
                  alt="DentalFlow"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="text-left">
                <span className="block text-lg font-semibold tracking-[-0.02em] text-slate-950">
                  DentalFlow
                </span>
                <span className="block text-sm text-slate-500">
                  Growth platform for clinics
                </span>
              </div>
            </a>

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
              {navigationItems.map((item) => (
                <a
                  key={item}
                  href="/"
                  className="transition-colors hover:text-[#1E3A8A]"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="hidden text-slate-600 hover:bg-white/70 hover:text-[#1E3A8A] md:inline-flex"
              >
                Falar com vendas
              </Button>
              <Button
                variant="outline"
                className="hidden border-[#CBD5E1] bg-white/80 text-slate-700 hover:border-[#93C5FD] hover:bg-[#F8FAFC] md:inline-flex"
              >
                Ver demonstracao
              </Button>
              <Button className="h-10 rounded-xl bg-[#1E3A8A] px-5 text-white shadow-[0_12px_28px_rgba(30,58,138,0.22)] hover:bg-[#1E2A5A]">
                Acessar a plataforma
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 lg:px-8">
        <main className="flex-1 pt-24">
          <section className="grid gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/90 px-4 py-2 text-sm font-medium text-[#1E3A8A] shadow-sm">
                <Stethoscope className="h-4 w-4" />
                Plataforma premium para crescimento de clinicas odontologicas
              </div>

              <h1 className="mt-8 max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
                Sua operacao digital mais forte, organizada e pronta para escalar.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                O DentalFlow reune estrategia, autoridade e acompanhamento em uma
                experiencia moderna para clinicas que querem crescer com
                consistencia.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button className="h-12 rounded-xl bg-[#1E3A8A] px-6 text-base text-white hover:bg-[#1E2A5A]">
                  Solicitar apresentacao
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-[#CBD5E1] bg-white text-base text-slate-700 hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
                >
                  Conhecer a estrutura
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    360
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    visao integrada sobre presenca, relacionamento e conversao
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Premium
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    posicionamento mais profissional em todos os pontos de contato
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Escalavel
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    base pronta para crescer com a evolucao da operacao
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(59,130,246,0.16),rgba(16,185,129,0.08))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#3B82F6]">
                      Visao executiva
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Um painel inicial elegante para sustentar o restante da plataforma.
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-[#EFF6FF] p-3 text-[#1E3A8A]">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {quickActions.map(({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E3A8A] shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-[#0F172A] p-5 text-white">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                    Estrutura pensada para conversao, autoridade e previsibilidade
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Essa primeira tela funciona como a base visual para o restante do
                    produto, mantendo consistencia com uma proposta SaaS premium.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-20">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#10B981]">
                  Conteudo base
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                  Uma secao inicial para explicar valor, metodo e proximos passos.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Aqui deixamos uma composicao padrao de landing page para ser
                  refinada nas proximas etapas com textos comerciais, provas
                  sociais, blocos institucionais e direcionamentos de conversao.
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {workflowHighlights.map(({ icon: Icon, title, description }) => (
                  <article
                    key={title}
                    className="rounded-3xl border border-slate-200/70 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1E3A8A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200/80 py-8">
          <div className="flex flex-col gap-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo-without-bg.png"
                alt="DentalFlow"
                className="h-9 w-9 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
              />
              <div>
                <p className="font-semibold text-slate-900">DentalFlow</p>
                <p>Base de landing page para a plataforma.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <a href="/" className="transition-colors hover:text-[#1E3A8A]">
                Politica de privacidade
              </a>
              <a href="/" className="transition-colors hover:text-[#1E3A8A]">
                Termos de uso
              </a>
              <a href="/" className="transition-colors hover:text-[#1E3A8A]">
                Suporte
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
