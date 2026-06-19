import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  ClinicalTemplate,
  CreateClinicalTemplateDto,
  UpdateClinicalTemplateDto,
} from '../types/clinical-record.types'

const BASE = '/clinical-records/templates'

export function listClinicalTemplates() {
  return apiRequest<ClinicalTemplate[]>('/clinical-records/templates/list', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createClinicalTemplate(dto: CreateClinicalTemplateDto) {
  return apiRequest<ClinicalTemplate>(BASE, {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function updateClinicalTemplate(id: string, dto: UpdateClinicalTemplateDto) {
  return apiRequest<ClinicalTemplate>(`${BASE}/${id}`, {
    method: 'PATCH',
    accessToken: getAccessToken(),
    body: JSON.stringify(dto),
  })
}

export function deactivateClinicalTemplate(id: string) {
  return apiRequest<ClinicalTemplate>(`${BASE}/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  })
}
