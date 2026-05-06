import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'

import { BrandLink } from '@/components/brand/BrandLink'
import { LoadingCard } from '@/components/common/LoadingCard'
import { PanelCard } from '@/components/common/PanelCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { onlyDigits } from '@/lib/field-formatters'
import { formatCurrencyBR } from '@/lib/number-formatters'

import { usePublicProfilePage } from '../hooks/usePublicProfilePage'

export function PublicProfilePageContainer() {
  const { profile, isLoading, error, isAuthenticated, returnTo } =
    usePublicProfilePage()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <BrandLink to={returnTo} />
          <Button variant="outline" size="sm" asChild>
            <Link to={returnTo}>
              <ArrowLeft className="h-4 w-4" />
              {isAuthenticated ? 'Voltar para perfis' : 'DentalFlow'}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {isLoading ? (
          <LoadingCard message="Carregando perfil..." />
        ) : error || !profile ? (
          <PanelCard>
            <div className="max-w-xl">
              <StatusBadge tone="warning">Indisponível</StatusBadge>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">
                Perfil não encontrado
              </h1>
              <p className="mt-3 leading-7 text-slate-600">
                {error ?? 'Esta página não está publicada ou não existe.'}
              </p>
            </div>
          </PanelCard>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <PanelCard className="lg:sticky lg:top-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950">
                {profile.displayName}
              </h1>
              {(profile.crmNumber || profile.crmState) && (
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  CRO {profile.crmNumber}
                  {profile.crmState ? `/${profile.crmState}` : ''}
                </p>
              )}
              {profile.bio && (
                <p className="mt-5 leading-7 text-slate-600">{profile.bio}</p>
              )}

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                {profile.addressLine1 && (
                  <ContactLine icon={MapPin}>{profile.addressLine1}</ContactLine>
                )}
                {(profile.city || profile.state) && (
                  <ContactLine icon={MapPin}>
                    {[profile.city, profile.state].filter(Boolean).join(' - ')}
                  </ContactLine>
                )}
                {profile.phone && (
                  <ContactLine icon={Phone}>{profile.phone}</ContactLine>
                )}
                {profile.whatsappNumber && (
                  <ContactLine icon={MessageCircle}>
                    {profile.whatsappNumber}
                  </ContactLine>
                )}
                {profile.publicEmail && (
                  <ContactLine icon={Mail}>{profile.publicEmail}</ContactLine>
                )}
                {profile.websiteUrl && (
                  <ContactLine icon={Globe2}>{profile.websiteUrl}</ContactLine>
                )}
              </div>

              {profile.whatsappNumber && (
                <Button className="mt-7 w-full" asChild>
                  <a href={`https://wa.me/${onlyDigits(profile.whatsappNumber)}`}>
                    <MessageCircle className="h-4 w-4" />
                    Chamar no WhatsApp
                  </a>
                </Button>
              )}
            </PanelCard>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Serviços
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Tratamentos e procedimentos
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Principais opções de atendimento deste profissional, com tempo
                  estimado e referência de investimento.
                </p>
                {isAuthenticated && (
                  <p className="mt-2 text-sm font-semibold text-primary">
                    Você está vendo serviços ativos e inativos. Clique em um
                    serviço para editar.
                  </p>
                )}
              </div>

              {profile.services.length === 0 ? (
                <PanelCard>
                  <p className="text-sm leading-6 text-slate-500">
                    Este profissional ainda não publicou serviços.
                  </p>
                </PanelCard>
              ) : (
                profile.services.map((service) => {
                  const priceFrom = service.isPriceDisplayed
                    ? formatCurrencyBR(service.priceFrom)
                    : null
                  const priceTo = service.isPriceDisplayed
                    ? formatCurrencyBR(service.priceTo)
                    : null

                  const serviceContent = (
                    <PanelCard
                      key={service.id}
                      className={`relative overflow-hidden border-l-4 transition ${
                        service.isActive
                          ? 'border-l-primary'
                          : 'border-l-slate-300 bg-slate-50'
                      } ${
                        isAuthenticated
                          ? 'hover:border-primary/50 hover:shadow-md'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <StatusBadge tone={service.isActive ? 'success' : 'muted'}>
                            {service.isActive
                              ? 'Tratamento disponível'
                              : 'Serviço inativo'}
                          </StatusBadge>
                          <h3 className="mt-4 text-xl font-semibold text-slate-950">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="mt-3 leading-7 text-slate-600">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {service.durationMinutes && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                              <Clock3 className="h-3.5 w-3.5" />
                              {service.durationMinutes} min
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                              service.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {service.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        <Banknote className="h-4 w-4 text-emerald-700" />
                        {[priceFrom, priceTo].filter(Boolean).join(' até ') ||
                          'Valores sob consulta'}
                      </div>
                    </PanelCard>
                  )

                  if (!isAuthenticated) {
                    return serviceContent
                  }

                  return (
                    <Link
                      key={service.id}
                      to="/app/perfis/$profileId/servicos/$serviceId"
                      params={{ profileId: profile.id, serviceId: service.id }}
                      className="block"
                    >
                      {serviceContent}
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

type ContactLineProps = {
  icon: LucideIcon
  children: string
}

function ContactLine({ icon: Icon, children }: ContactLineProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-primary" />
      <span>{children}</span>
    </div>
  )
}
