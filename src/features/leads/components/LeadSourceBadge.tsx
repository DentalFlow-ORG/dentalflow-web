import type { LeadSource } from '../types/leads.types'

const SOURCE_LABELS: Record<LeadSource, string> = {
  PROFILE_PAGE: 'Perfil',
  MANUAL: 'Manual',
  IMPORT: 'Importação',
  REFERRAL: 'Indicação',
  WEBSITE: 'Site',
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  GOOGLE: 'Google',
  OTHER: 'Outro',
}

interface LeadSourceBadgeProps {
  source: LeadSource
}

export function LeadSourceBadge({ source }: LeadSourceBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-normal text-muted-foreground">
      {SOURCE_LABELS[source] ?? source}
    </span>
  )
}

export { SOURCE_LABELS }
