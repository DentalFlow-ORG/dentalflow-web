import { companyInfo } from '@/config/company'
import { onlyDigits } from '@/lib/field-formatters'
import { useCookieConsent } from '@/features/privacy/components/CookieConsentContext'

const footerLinkClass =
  'df-animated-link rounded text-blue-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent()
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={`cursor-pointer ${footerLinkClass}`}
    >
      Cookies
    </button>
  )
}

const isPlaceholderPhone = companyInfo.phone === '(00) 00000-0000'
const isPlaceholderCnpj = companyInfo.documentNumber === '00.000.000/0001-00'
const isPlaceholderAddress = companyInfo.address.includes('TODO')
const hasRealCompanyData = !isPlaceholderCnpj && !isPlaceholderAddress

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/15 bg-[#082f5f]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 text-sm text-blue-200 md:grid-cols-[1.1fr_0.9fr_0.8fr] lg:px-8">

        {/* Brand + description */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo-without-bg.png"
              alt={companyInfo.tradeName}
              className="h-12 w-12 shrink-0 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="h-10 w-px shrink-0 bg-white/15" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">{companyInfo.tradeName}</p>
              <p className="italic text-blue-300/80">{companyInfo.brandSlogan}</p>
            </div>
          </div>
          <p className="mt-6 max-w-md leading-6">
            Organize consultas, pacientes, equipe e permissões em uma plataforma simples e segura, feita para a rotina real de clínicas odontológicas.
          </p>
        </div>

        {/* Company data — only shown when real values exist */}
        <div>
          <h3 className="font-semibold text-white">Dados da empresa</h3>
          {hasRealCompanyData ? (
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                  Razão social
                </dt>
                <dd className="mt-1">{companyInfo.legalName}</dd>
              </div>
              {!isPlaceholderCnpj && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                    CNPJ
                  </dt>
                  <dd className="mt-1">{companyInfo.documentNumber}</dd>
                </div>
              )}
              {!isPlaceholderAddress && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                    Endereço
                  </dt>
                  <dd className="mt-1">{companyInfo.address}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 leading-6">
              Dados legais disponíveis nos canais oficiais da empresa.
            </p>
          )}
        </div>

        {/* Contact + legal links */}
        <div>
          <h3 className="font-semibold text-white">Contato e legal</h3>
          <div className="mt-4 space-y-3">
            {!isPlaceholderPhone && (
              <a
                href={`tel:${onlyDigits(companyInfo.phone)}`}
                className={`block ${footerLinkClass}`}
              >
                {companyInfo.phone}
              </a>
            )}
            <a
              href={`mailto:${companyInfo.supportEmail}`}
              className={`block ${footerLinkClass}`}
            >
              {companyInfo.supportEmail}
            </a>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
              <a href="/politica-de-privacidade" className={footerLinkClass}>
                Privacidade
              </a>
              <a href="/termos-de-uso" className={footerLinkClass}>
                Termos
              </a>
              <a href="/seguranca" className={footerLinkClass}>
                Segurança
              </a>
              <a href="/direitos-do-titular" className={footerLinkClass}>
                Seus dados
              </a>
              <CookiePreferencesButton />
              <a href={`mailto:${companyInfo.supportEmail}`} className={footerLinkClass}>
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs leading-5 text-blue-300 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            Copyright © {currentYear} {companyInfo.legalName}. Todos os direitos reservados.
          </p>
          <p>
            {companyInfo.tradeName} e marcas relacionadas pertencem aos seus respectivos titulares.
          </p>
        </div>
      </div>
    </footer>
  )
}
