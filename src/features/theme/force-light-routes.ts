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
  '/app/assinatura',
] as const

export function shouldForceLightTheme(pathname: string): boolean {
  return FORCE_LIGHT_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/'
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
