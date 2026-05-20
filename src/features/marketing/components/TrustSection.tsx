import { Link } from '@tanstack/react-router'
import { CheckCircle2, Database, Lock, Shield, ShieldCheck, UserCheck, Users } from 'lucide-react'

const trustPillars = [
  {
    icon: Lock,
    title: 'LGPD nativo',
    description: 'Conformidade com a Lei Geral de Proteção de Dados estruturada desde a concepção da plataforma.',
  },
  {
    icon: Users,
    title: 'Segurança por perfis de acesso',
    description: 'Proprietários, dentistas e assistentes acessam apenas o que precisam. Permissões definidas por função.',
  },
  {
    icon: Database,
    title: 'Dados da clínica isolados',
    description: 'As informações de cada clínica são completamente separadas das demais. Nenhum dado é compartilhado entre clínicas.',
  },
  {
    icon: ShieldCheck,
    title: 'Logs e auditoria',
    description: 'Registro das ações realizadas no sistema para controle e rastreabilidade da operação.',
  },
  {
    icon: CheckCircle2,
    title: 'Integrações oficiais',
    description: 'Conexões via API com provedores reconhecidos: Google Calendar, Stripe, OpenAI e WhatsApp Cloud API.',
  },
  {
    icon: UserCheck,
    title: 'Suporte humano',
    description: 'Equipe de suporte disponível para auxiliar na configuração, dúvidas e uso diário da plataforma.',
  },
]

const badges = [
  { label: 'LGPD', sub: 'Conforme' },
  { label: 'HTTPS', sub: 'Criptografado' },
  { label: 'Suporte', sub: 'Incluído' },
]

export function TrustSection() {
  return (
    <section
      id="seguranca"
      className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: heading */}
          <div className="lg:max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">
              Confiança e transparência
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              O DentalFlow foi construído com responsabilidade sobre os dados dos pacientes e da clínica. Segurança não é um recurso extra — é parte da estrutura da plataforma.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-center"
                >
                  <p className="text-xs font-bold text-primary">{badge.label}</p>
                  <p className="text-[10px] text-slate-500">{badge.sub}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-slate-400">
              <Link to="/politica-de-privacidade" className="text-primary hover:underline">
                Política de privacidade
              </Link>
              {' · '}
              <Link to="/seguranca" className="text-primary hover:underline">
                Práticas de segurança
              </Link>
              {' · '}
              <Link to="/direitos-do-titular" className="text-primary hover:underline">
                Seus direitos (LGPD)
              </Link>
            </p>
          </div>

          {/* Right: pillars */}
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <Icon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">{pillar.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
