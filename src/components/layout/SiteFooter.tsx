import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Mail } from 'lucide-react'

import { companyInfo, socialLinks } from '@/config/company'
import { cn } from '@/lib/utils'
import { useCookieConsent } from '@/features/privacy/components/CookieConsentContext'

// ── Shared link base ──────────────────────────────────────────────────────────

const footerLinkBase =
  'group inline-flex items-center gap-1.5 rounded-sm py-1 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

function FooterChevron() {
  return (
    <ChevronRight
      className="h-3 w-3 shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-500"
      aria-hidden="true"
    />
  )
}

function FooterNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to as never} className={footerLinkBase}>
      <FooterChevron />
      {children}
    </Link>
  )
}

function FooterHrefLink({
  href,
  children,
  external,
  icon,
}: {
  href: string
  children: ReactNode
  external?: boolean
  icon?: ReactNode
}) {
  return (
    <a
      href={href}
      className={cn(footerLinkBase)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {icon ?? <FooterChevron />}
      {children}
    </a>
  )
}

function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent()
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn('cursor-pointer text-left', footerLinkBase)}
    >
      <FooterChevron />
      Política de cookies
    </button>
  )
}

// ── Social ────────────────────────────────────────────────────────────────────

function YouTubeIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// ── Nav data ──────────────────────────────────────────────────────────────────

type NavItem = { label: string; href: string }

const PRODUTO: NavItem[] = [
  { label: 'Funcionalidades', href: '/funcionalidades' },
  { label: 'Planos', href: '/planos' },
  { label: 'Para gestores', href: '/para-gestores' },
  { label: 'Para clínicas em abertura', href: '/para-clinicas-em-abertura' },
  { label: 'Para dentistas', href: '/para-dentistas' },
  { label: 'Para secretárias', href: '/para-secretarias' },
]

const RECURSOS: NavItem[] = [
  { label: 'Agenda inteligente', href: '/funcionalidades/agenda' },
  { label: 'Prontuário eletrônico', href: '/funcionalidades/prontuarios' },
  { label: 'Gestão financeira', href: '/funcionalidades/financeiro' },
  { label: 'Relatórios e indicadores', href: '/funcionalidades/relatorios' },
  { label: 'IA de gestão', href: '/funcionalidades/ia' },
  { label: 'Integrações', href: '/integracoes' },
]

const LEGAL: NavItem[] = [
  { label: 'Termos de uso', href: '/termos-de-uso' },
  { label: 'Política de privacidade', href: '/politica-de-privacidade' },
  { label: 'Segurança', href: '/seguranca' },
  { label: 'Tratamento de dados', href: '/tratamento-de-dados' },
  { label: 'Encarregado / DPO', href: '/encarregado' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{children}</h3>
  )
}

function NavColumn({ heading, items }: { heading: string; items: NavItem[] }) {
  return (
    <div>
      <ColumnHeading>{heading}</ColumnHeading>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <FooterNavLink to={item.href}>{item.label}</FooterNavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        {/* Top grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-without-bg.png"
                alt={companyInfo.tradeName}
                className="h-9 w-9 shrink-0 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-base font-semibold text-white">{companyInfo.tradeName}</span>
            </div>
            <p className="mt-5 max-w-[22rem] text-sm leading-6 text-slate-400">
              Plataforma de gestão odontológica para organizar agenda, pacientes, equipe e finanças em um só lugar.
            </p>

            {socialLinks.youtube && (
              <div className="mt-6">
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DentalFlow no YouTube"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-400 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <YouTubeIcon />
                </a>
              </div>
            )}
          </div>

          <NavColumn heading="Produto" items={PRODUTO} />
          <NavColumn heading="Recursos" items={RECURSOS} />

          {/* Suporte */}
          <div>
            <ColumnHeading>Suporte</ColumnHeading>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterNavLink to="/faq">FAQ</FooterNavLink>
              </li>
              <li>
                <FooterHrefLink
                  href={`mailto:${companyInfo.supportEmail}`}
                  icon={
                    <Mail className="h-3 w-3 shrink-0 text-slate-600 transition-colors group-hover:text-emerald-500" aria-hidden="true" />
                  }
                >
                  {companyInfo.supportEmail}
                </FooterHrefLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <ColumnHeading>Legal</ColumnHeading>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <FooterNavLink to={item.href}>{item.label}</FooterNavLink>
                </li>
              ))}
              <li>
                <CookiePreferencesButton />
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} {companyInfo.legalName}. Todos os direitos reservados.</p>
            <p>{companyInfo.tradeName} e marcas relacionadas pertencem aos seus respectivos titulares.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
