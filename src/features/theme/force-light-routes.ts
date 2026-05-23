import { getBillingAccess } from './billing-theme-override'

// Routes that are always forced to light theme regardless of the user's saved preference.
const FORCE_LIGHT_PATH_PREFIXES = [
  '/',
  '/acessar',
  '/planos',
  '/funcionalidades',
  '/integracoes',
  '/perguntas-frequentes',
  '/para-secretarias',
  '/para-dentistas',
  '/para-gestores',
  '/para-clinicas-em-abertura',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/politica-de-cookies',
  '/tratamento-de-dados',
  '/seguranca',
  '/direitos-do-titular',
  '/encarregado',
] as const

// Billing routes that are forced light ONLY when the user does not have confirmed
// billing access. Once access is confirmed (active/trialing), dark mode is allowed.
const BILLING_ROUTE_PREFIXES = ['/app/assinatura'] as const

export function shouldForceLightTheme(pathname: string): boolean {
  // Billing routes: forced light unless billing access is explicitly confirmed.
  // null (loading) or false (no access) both result in forced light.
  if (BILLING_ROUTE_PREFIXES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return getBillingAccess() !== true
  }

  return FORCE_LIGHT_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/'
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
