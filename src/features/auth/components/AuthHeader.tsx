import { BrandLink } from '@/components/brand/BrandLink'
import { BackButton } from '@/components/common/BackButton'

export function AuthHeader() {
  return (
    <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between gap-3">
      <BrandLink compact />
      <BackButton to="/" label="Voltar ao site" size="default" />
    </div>
  )
}
