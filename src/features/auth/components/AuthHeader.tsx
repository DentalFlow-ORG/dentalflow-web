import { Link } from '@tanstack/react-router'

import { BrandLink } from '@/components/brand/BrandLink'
import { Button } from '@/components/ui/button'

export function AuthHeader() {
  return (
    <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between gap-4">
      <BrandLink compact />

      <Button variant="outline" asChild>
        <Link to="/">Voltar ao site</Link>
      </Button>
    </div>
  )
}
