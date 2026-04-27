import type { ProfileService } from '../types'

export function hasDuplicateDisplayOrder(
  services: ProfileService[],
  displayOrderValue: string,
  ignoredServiceId?: string,
) {
  const displayOrder = Number(displayOrderValue)

  if (Number.isNaN(displayOrder)) {
    return false
  }

  return services.some(
    (service) =>
      service.id !== ignoredServiceId && service.displayOrder === displayOrder,
  )
}
