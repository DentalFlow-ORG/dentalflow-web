import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'

import { navigationItems } from '../data/landing-content'

type LandingHeaderProps = {
  isScrolled: boolean
}

export function LandingHeader({ isScrolled }: LandingHeaderProps) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        <BrandLink />

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden md:inline-flex">
            Falar com vendas
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex">
            Ver demonstracao
          </Button>
          <Button asChild>
            <Link to="/acessar" search={{ mode: 'register' }}>
              Testar gratis
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
