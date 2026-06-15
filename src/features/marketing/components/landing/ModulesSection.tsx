import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CalendarDays,
  ClipboardList,
  CreditCard,
  type LucideIcon,
  MessageCircle,
  Receipt,
  Users,
} from 'lucide-react'

import { Reveal, StaggerGroup, StaggerItem } from './Reveal'

type Module = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

// The nine integrated modules — each links to its dedicated feature page.
const MODULES: Module[] = [
  {
    title: 'Agenda inteligente',
    description: 'Consultas, encaixes e status de cada atendimento em uma visão única da semana.',
    href: '/funcionalidades/agenda',
    icon: CalendarDays,
  },
  {
    title: 'Pacientes',
    description: 'Cadastro completo, histórico de relacionamento e contato centralizado.',
    href: '/funcionalidades/pacientes',
    icon: Users,
  },
  {
    title: 'Prontuário eletrônico',
    description: 'Evoluções clínicas, modelos reutilizáveis e histórico sempre à mão.',
    href: '/funcionalidades/prontuarios',
    icon: ClipboardList,
  },
  {
    title: 'Gestão financeira',
    description: 'Receitas, despesas, categorias e fluxo de caixa em tempo real.',
    href: '/funcionalidades/financeiro',
    icon: CreditCard,
  },
  {
    title: 'Controle de estoque',
    description: 'Produtos, movimentações e reposição sem depender da memória.',
    href: '/funcionalidades/estoque',
    icon: Boxes,
  },
  {
    title: 'Relatórios e indicadores',
    description: 'Leituras claras da operação para decidir com dados, não com achismo.',
    href: '/funcionalidades/relatorios',
    icon: BarChart3,
  },
  {
    title: 'IA de gestão',
    description: 'Apoio para analisar dados de financeiro e estoque registrados no sistema.',
    href: '/funcionalidades/ia',
    icon: Bot,
  },
  {
    title: 'WhatsApp e notificações',
    description: 'Lembretes, confirmações e avisos operacionais enviados aos pacientes.',
    href: '/funcionalidades/whatsapp',
    icon: MessageCircle,
  },
  {
    title: 'Controle fiscal',
    description: 'Organização de dados fiscais, rascunhos e acompanhamento interno de notas.',
    href: '/funcionalidades/controle-fiscal',
    icon: Receipt,
  },
]

export function ModulesSection() {
  return (
    <section
      id="modulos"
      className="relative overflow-hidden bg-white py-20 lg:py-28"
      aria-labelledby="modules-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Tudo em um só lugar
          </p>
          <h2
            id="modules-heading"
            className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
          >
            Nove módulos integrados, um único centro de comando
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Cada módulo resolve uma parte da rotina e conversa com os demais — você opera a clínica
            inteira sem trocar de sistema.
          </p>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {MODULES.map((module) => {
            const Icon = module.icon
            return (
              <StaggerItem key={module.title}>
                <Link
                  to={module.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{module.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <span className="df-animated-link">Saber mais</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGroup>

        <Reveal className="mt-12 text-center" delay={0.1}>
          <Link
            to="/funcionalidades"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
          >
            Ver todas as funcionalidades
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
