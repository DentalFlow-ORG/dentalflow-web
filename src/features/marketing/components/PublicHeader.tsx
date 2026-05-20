import { Link } from '@tanstack/react-router'
import {
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PublicHeaderProps = {
  isScrolled?: boolean
  showAnnouncement?: boolean
  onDismissAnnouncement?: () => void
  announcementDismissed?: boolean
}

type DropdownItem = {
  label: string
  description: string
  href: string
  icon: typeof CalendarDays
}

type DropdownGroup = {
  key: string
  label: string
  items: DropdownItem[]
}

const produtoDropdown: DropdownItem[] = [
  {
    label: 'Para secretária / recepção',
    description: 'Agenda, pacientes, confirmações e notificações',
    href: '/para-secretarias',
    icon: UsersRound,
  },
  {
    label: 'Para dentistas',
    description: 'Minha agenda, prontuários e histórico clínico',
    href: '/para-dentistas',
    icon: Stethoscope,
  },
  {
    label: 'Para administradores / gestores',
    description: 'Financeiro, relatórios, leads e IA de gestão',
    href: '/para-gestores',
    icon: LayoutDashboard,
  },
  {
    label: 'Para clínicas em abertura',
    description: 'Comece organizado desde o primeiro atendimento',
    href: '/para-clinicas-em-abertura',
    icon: Sparkles,
  },
]

const funcionalidadesDropdown: DropdownItem[] = [
  {
    label: 'Agenda inteligente',
    description: 'Horários, status e Google Calendar',
    href: '/funcionalidades/agenda',
    icon: CalendarDays,
  },
  {
    label: 'Pacientes',
    description: 'Cadastro, histórico e contatos',
    href: '/funcionalidades/pacientes',
    icon: Users,
  },
  {
    label: 'Prontuários digitais',
    description: 'Histórico clínico por paciente',
    href: '/funcionalidades/prontuarios',
    icon: ClipboardList,
  },
  {
    label: 'Financeiro',
    description: 'Entradas, saídas e fluxo de caixa',
    href: '/funcionalidades/financeiro',
    icon: CreditCard,
  },
  {
    label: 'Estoque',
    description: 'Materiais, alertas e insumos',
    href: '/funcionalidades/estoque',
    icon: Package,
  },
  {
    label: 'Leads / CRM',
    description: 'Pipeline e relacionamento com leads',
    href: '/funcionalidades/leads',
    icon: TrendingUp,
  },
  {
    label: 'IA de gestão',
    description: 'Insights e análises baseadas nos dados',
    href: '/funcionalidades/ia',
    icon: Bot,
  },
  {
    label: 'Relatórios',
    description: 'Indicadores de agenda, financeiro e leads',
    href: '/funcionalidades/relatorios',
    icon: TrendingUp,
  },
  {
    label: 'Controle fiscal',
    description: 'Rascunhos de notas e organização fiscal',
    href: '/funcionalidades/controle-fiscal',
    icon: FileText,
  },
  {
    label: 'WhatsApp e notificações',
    description: 'Lembretes, confirmações automáticas',
    href: '/funcionalidades/whatsapp',
    icon: MessageCircle,
  },
  {
    label: 'Segurança e LGPD',
    description: 'Permissões, acesso e conformidade',
    href: '/funcionalidades',
    icon: ShieldCheck,
  },
]

const recursosDropdown: DropdownItem[] = [
  {
    label: 'Central de funcionalidades',
    description: 'Comparativo completo de recursos por plano',
    href: '/funcionalidades',
    icon: LayoutDashboard,
  },
  {
    label: 'Comparativo de planos',
    description: 'Starter, Professional e Premium',
    href: '/planos',
    icon: CreditCard,
  },
  {
    label: 'Perguntas frequentes',
    description: 'Dúvidas comuns sobre o DentalFlow',
    href: '/perguntas-frequentes',
    icon: HelpCircle,
  },
  {
    label: 'Fale com especialista',
    description: 'Entre em contato para uma demonstração',
    href: '/perguntas-frequentes#contato',
    icon: Lock,
  },
]

const DROPDOWNS: DropdownGroup[] = [
  { key: 'produto', label: 'Produto', items: produtoDropdown },
  { key: 'funcionalidades', label: 'Funcionalidades', items: funcionalidadesDropdown },
  { key: 'recursos', label: 'Recursos', items: recursosDropdown },
]

const SIMPLE_NAV = [
  { label: 'Planos', href: '/planos' },
  { label: 'Integrações', href: '/integracoes' },
  { label: 'FAQ', href: '/perguntas-frequentes' },
]

export function PublicHeader({
  isScrolled = false,
  showAnnouncement = true,
  announcementDismissed = false,
  onDismissAnnouncement,
}: PublicHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([])
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const toggleMobileSection = (key: string) => {
    setMobileExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  const showBar = showAnnouncement && !announcementDismissed

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-white/70 backdrop-blur-md',
      )}
    >
      {/* ── Announcement bar ── */}
      {showBar && (
        <div className="relative hidden bg-primary py-2 sm:block" role="banner">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 lg:px-8">
            <Zap className="h-3.5 w-3.5 shrink-0 text-yellow-300" aria-hidden="true" />
            <p className="text-center text-sm font-medium text-white">
              Oferta de lançamento — 40% off no primeiro ano. Válido por tempo limitado.{' '}
              <Link
                to="/planos"
                className="ml-1 inline-flex items-center gap-0.5 font-semibold text-yellow-300 underline-offset-2 hover:underline"
              >
                Ver planos →
              </Link>
            </p>
          </div>
          {onDismissAnnouncement && (
            <button
              type="button"
              aria-label="Fechar aviso de lançamento"
              onClick={onDismissAnnouncement}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-white/70 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Main nav ── */}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <BrandLink />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {DROPDOWNS.map((group) => (
            <div key={group.key} className="relative">
              <button
                type="button"
                aria-expanded={openDropdown === group.key}
                aria-haspopup="true"
                onClick={() =>
                  setOpenDropdown((prev) => (prev === group.key ? null : group.key))
                }
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  openDropdown === group.key
                    ? 'bg-slate-100 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary',
                )}
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    openDropdown === group.key && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === group.key && (
                <div
                  className={cn(
                    'absolute left-0 top-full z-50 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10',
                    group.key === 'funcionalidades' ? 'w-[26rem]' : 'w-72',
                  )}
                  role="menu"
                >
                  <div
                    className={cn(
                      'p-2',
                      group.key === 'funcionalidades' && 'grid grid-cols-2',
                    )}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <a
                          key={item.href + item.label}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-slate-50"
                        >
                          <Icon
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">{item.label}</p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {SIMPLE_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/acessar" search={{ mode: 'login' }}>
              Entrar
            </Link>
          </Button>
          <Button
            size="sm"
            className={cn(
              'hidden transition-all duration-300 sm:inline-flex',
              isScrolled && 'ring-2 ring-primary/25',
            )}
            asChild
          >
            <Link to="/acessar" search={{ mode: 'register' }}>
              Testar grátis
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMobileOpen && (
        <div
          className="overflow-y-auto border-t border-slate-200 bg-white px-4 pb-6 pt-3 lg:hidden"
          style={{ maxHeight: 'calc(100svh - 4rem)' }}
        >
          {showBar && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <Zap className="h-3 w-3 shrink-0" aria-hidden="true" />
              40% off no primeiro ano · Oferta de lançamento
            </div>
          )}

          <nav className="flex flex-col gap-1" aria-label="Menu mobile">
            {DROPDOWNS.map((group) => (
              <div key={group.key}>
                <button
                  type="button"
                  aria-expanded={mobileExpanded.includes(group.key)}
                  onClick={() => toggleMobileSection(group.key)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      mobileExpanded.includes(group.key) && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>

                {mobileExpanded.includes(group.key) && (
                  <div className="ml-2 mt-1 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <a
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          {item.label}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {SIMPLE_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link
                to="/acessar"
                search={{ mode: 'login' }}
                onClick={() => setIsMobileOpen(false)}
              >
                Entrar
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link
                to="/acessar"
                search={{ mode: 'register' }}
                onClick={() => setIsMobileOpen(false)}
              >
                Começar teste grátis
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
