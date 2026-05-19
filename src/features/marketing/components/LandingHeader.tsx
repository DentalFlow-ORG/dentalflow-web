import { Link } from '@tanstack/react-router'
import { ChevronRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { navigationItems } from '../data/landing-content'

type LandingHeaderProps = {
  isScrolled: boolean
}

function isRouterLink(href: string): href is '/funcionalidades' {
  return href === '/funcionalidades'
}

export function LandingHeader({ isScrolled }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-all duration-300',
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-white/60 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <BrandLink />

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {navigationItems.map((item) => (
            isRouterLink(item.href) ? (
              <Link
                key={item.label}
                to={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:inline-flex" asChild>
            <Link to="/acessar" search={{ mode: 'login' }}>
              Entrar
            </Link>
          </Button>
          <Button asChild>
            <Link to="/acessar" search={{ mode: 'register' }}>
              Iniciar teste grátis
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 pb-5 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              isRouterLink(item.href) ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link
                to="/acessar"
                search={{ mode: 'login' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link
                to="/acessar"
                search={{ mode: 'register' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar teste grátis
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
