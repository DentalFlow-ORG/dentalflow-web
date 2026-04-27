import { companyInfo } from '@/config/company'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 text-sm text-slate-500 md:grid-cols-[1.1fr_0.9fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo-without-bg.png"
              alt={companyInfo.tradeName}
              className="h-12 w-12 shrink-0 object-contain"
            />
            <span className="h-10 w-px shrink-0 bg-slate-200" aria-hidden="true" />
            <div>
              <p className="font-semibold text-slate-900">
                {companyInfo.tradeName}
              </p>
              <p>Plataforma de crescimento para clínicas odontológicas.</p>
            </div>
          </div>

          <p className="mt-6 max-w-md leading-6">
            Estrutura digital para fortalecer posicionamento, aquisição de
            pacientes, rotina comercial e indicadores de crescimento.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">Dados da empresa</h3>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Razão social
              </dt>
              <dd className="mt-1 text-slate-600">{companyInfo.legalName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                CNPJ
              </dt>
              <dd className="mt-1 text-slate-600">{companyInfo.cnpj}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Endereço
              </dt>
              <dd className="mt-1 text-slate-600">{companyInfo.address}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">Contato e legal</h3>
          <div className="mt-4 space-y-3">
            <a
              href={`tel:${companyInfo.phone.replace(/\D/g, '')}`}
              className="block transition-colors hover:text-primary"
            >
              {companyInfo.phone}
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="block transition-colors hover:text-primary"
            >
              {companyInfo.email}
            </a>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
              <a href="/" className="transition-colors hover:text-primary">
                Privacidade
              </a>
              <a href="/" className="transition-colors hover:text-primary">
                Termos
              </a>
              <a href="/" className="transition-colors hover:text-primary">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs leading-5 text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            Copyright © {currentYear} {companyInfo.legalName}. Todos os direitos
            reservados.
          </p>
          <p>
            {companyInfo.tradeName} e marcas relacionadas pertencem aos seus
            respectivos titulares.
          </p>
        </div>
      </div>
    </footer>
  )
}
