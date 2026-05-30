import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'
import type {
  CreateLeadPayload,
  Lead,
  LeadActivity,
  LeadListResponse,
  LeadSource,
  LeadStatus,
  LeadSummary,
  UpdateLeadPayload,
} from '../types/leads.types'

interface ListLeadsParams {
  search?: string
  status?: LeadStatus | ''
  source?: LeadSource | ''
  assignedToUserId?: string
  hasFollowUp?: boolean
  page?: number
  limit?: number
}

function buildQuery(params: ListLeadsParams): string {
  const parts: string[] = []
  if (params.search?.trim()) parts.push(`search=${encodeURIComponent(params.search.trim())}`)
  if (params.status) parts.push(`status=${params.status}`)
  if (params.source) parts.push(`source=${params.source}`)
  if (params.assignedToUserId) parts.push(`assignedToUserId=${params.assignedToUserId}`)
  if (params.hasFollowUp === true) parts.push(`hasFollowUp=true`)
  if (params.page) parts.push(`page=${params.page}`)
  if (params.limit) parts.push(`limit=${params.limit}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

function token() {
  return getAccessToken()
}

export function listLeads(params: ListLeadsParams = {}) {
  return apiRequest<LeadListResponse>(`/leads${buildQuery(params)}`, {
    method: 'GET',
    accessToken: token(),
  })
}

export function getLeadSummary() {
  return apiRequest<LeadSummary>('/leads/summary', {
    method: 'GET',
    accessToken: token(),
  })
}

export function getLead(id: string) {
  return apiRequest<Lead>(`/leads/${id}`, {
    method: 'GET',
    accessToken: token(),
  })
}

export function createLead(payload: CreateLeadPayload) {
  return apiRequest<Lead>('/leads', {
    method: 'POST',
    accessToken: token(),
    body: JSON.stringify(payload),
  })
}

export function updateLead(id: string, payload: UpdateLeadPayload) {
  return apiRequest<Lead>(`/leads/${id}`, {
    method: 'PATCH',
    accessToken: token(),
    body: JSON.stringify(payload),
  })
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  return apiRequest<Lead>(`/leads/${id}/status`, {
    method: 'PATCH',
    accessToken: token(),
    body: JSON.stringify({ status }),
  })
}

export function addLeadActivity(
  id: string,
  payload: { action: 'NOTE_ADDED' | 'CONTACTED'; note?: string },
) {
  return apiRequest<LeadActivity>(`/leads/${id}/activities`, {
    method: 'POST',
    accessToken: token(),
    body: JSON.stringify(payload),
  })
}

export function listLeadActivities(id: string) {
  return apiRequest<LeadActivity[]>(`/leads/${id}/activities`, {
    method: 'GET',
    accessToken: token(),
  })
}

export function convertLead(id: string) {
  return apiRequest<Lead>(`/leads/${id}/convert`, {
    method: 'POST',
    accessToken: token(),
  })
}

export function archiveLead(id: string) {
  return apiRequest<Lead>(`/leads/${id}`, {
    method: 'DELETE',
    accessToken: token(),
  })
}
