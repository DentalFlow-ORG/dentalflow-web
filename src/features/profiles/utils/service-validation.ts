import { parseOptionalNumber } from '@/lib/number-formatters'

import type { ProfileService } from '../types'

export function hasDuplicateDisplayOrder(
  services: ProfileService[],
  displayOrderValue: string,
  ignoredServiceId?: string,
) {
  const displayOrder = parseOptionalNumber(displayOrderValue)

  if (displayOrder === undefined) {
    return false
  }

  return services.some(
    (service) =>
      service.id !== ignoredServiceId && service.displayOrder === displayOrder,
  )
}
