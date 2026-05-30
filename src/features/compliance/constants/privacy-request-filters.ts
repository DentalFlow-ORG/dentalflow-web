import type { PrivacyRequestFilters } from '../types/compliance.types'

export const INITIAL_FILTERS: PrivacyRequestFilters = {
  status: '',
  requestType: '',
  requesterType: '',
  search: '',
  page: 1,
  limit: 20,
}
