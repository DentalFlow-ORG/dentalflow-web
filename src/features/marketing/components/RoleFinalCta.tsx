import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { RoleFinalCta as RoleFinalCtaType } from '../data/public-content'

type RoleFinalCtaProps = {
  finalCta: RoleFinalCtaType
}

export function RoleFinalCta({ finalCta }: RoleFinalCtaProps) {
  return (
    <section className="bg-primary py-14">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <h2 className="text-2xl font-semibold text-white">{finalCta.headline}</h2>
        <p className="mt-3 text-blue-200">{finalCta.subtext}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/acessar" search={{ mode: 'register' }}>
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            asChild
          >
            {finalCta.secondaryCtaTo === '/funcionalidades' ? (
              <Link to="/funcionalidades">{finalCta.secondaryCtaLabel}</Link>
            ) : (
              <Link to="/planos">{finalCta.secondaryCtaLabel}</Link>
            )}
          </Button>
        </div>
        <p className="mt-4 text-xs text-blue-300">
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}
