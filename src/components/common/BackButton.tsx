import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BackButtonProps = {
  to?: string
  label?: string
  /** Destino quando `to` não é informado. Default: "/app". */
  fallbackTo?: string
  variant?: 'outline' | 'ghost'
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Botão de retorno padronizado.
 * Usa `to` quando fornecido; caso contrário usa `fallbackTo`.
 * Sempre renderiza um <Link> semântico com ícone ArrowLeft.
 */
export function BackButton({
  to,
  label = 'Voltar',
  fallbackTo = '/app',
  variant = 'outline',
  size = 'sm',
  className,
}: BackButtonProps) {
  const dest = to ?? fallbackTo

  return (
    <Button variant={variant} size={size} asChild className={cn(className)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={dest as any}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  )
}
