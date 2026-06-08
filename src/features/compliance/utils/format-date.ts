import { BRAZIL_TZ } from '@/lib/brazil-timezone'

/** Date + time formatted for pt-BR in Brazil timezone, minute precision (used for privacy requests). */
export function formatDatetime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Date + time formatted for pt-BR in Brazil timezone, second precision (used for audit logs). */
export function formatDatetimeWithSeconds(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso))
}
