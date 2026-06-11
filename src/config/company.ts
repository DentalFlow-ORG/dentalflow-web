// ─────────────────────────────────────────────────────────────────────────────
// ATENÇÃO: Este arquivo é 100% público (bundle do browser).
// Não coloque senhas, API keys, tokens ou qualquer segredo aqui.
//
// Valores marcados com TODO devem ser preenchidos antes de ir para produção.
// Referencie este arquivo em TODAS as páginas legais e componentes que
// exibem dados da empresa. Nunca duplique esses valores em string literal.
// ─────────────────────────────────────────────────────────────────────────────

// ── Identidade legal ─────────────────────────────────────────────────────────

export const companyInfo = {
  /** Razão social registrada. TODO: confirmar antes da produção. */
  legalName: 'DentalFlow Tecnologia LTDA',

  /** Nome fantasia exibido na interface. */
  tradeName: 'DentalFlow',

  /** Slogan oficial da marca. */
  brandSlogan: 'Sua clínica no flow, seu crescimento é show!',

  /**
   * CNPJ formatado.
   * TODO (pré-lançamento → operação comercial): preencher com CNPJ real registrado na
   * Receita Federal e definir companyStatus.hasRealDocumentNumber = true.
   */
  documentNumber: 'Em processo de formalização',

  /**
   * Endereço completo para fins legais.
   * TODO (pré-lançamento → operação comercial): preencher com endereço comercial completo
   * (logradouro, número, cidade, UF, CEP) e definir companyStatus.hasRealAddress = true.
   */
  address: 'Em processo de formalização',

  /**
   * Telefone de suporte.
   * TODO (pré-lançamento → operação comercial): preencher com número oficial
   * e definir companyStatus.hasRealPhone = true.
   */
  phone: 'Em processo de definição',

  // ── Contatos ──────────────────────────────────────────────────────────────

  /**
   * E-mail geral de contato / suporte.
   * TODO: substituir pelo e-mail real antes de divulgar para clientes.
   */
  supportEmail: 'contato@dentalflow.com.br',

  /**
   * E-mail para exercício de direitos LGPD e contato com o DPO.
   * TODO: substituir pelo e-mail real antes de divulgar para clientes.
   */
  privacyEmail: 'privacidade@dentalflow.com.br',

  /** E-mail para reporte de vulnerabilidades e incidentes de segurança. */
  securityEmail: 'seguranca@dentalflow.com.br',

  // ── DPO ───────────────────────────────────────────────────────────────────

  /**
   * Responsável pelo canal de privacidade / DPO.
   * Usando canal de privacidade genérico enquanto o DPO formal não é nomeado.
   * TODO (pré-lançamento → operação comercial): preencher com nome completo do
   * Encarregado nomeado (LGPD Art. 41) e definir companyStatus.hasNamedDpo = true.
   */
  dpoName: 'Canal de Privacidade DentalFlow',

  /** E-mail oficial do DPO — mesmo valor que privacyEmail enquanto não houver DPO dedicado. */
  dpoEmail: 'privacidade@dentalflow.com.br',

  // ── Versões de documentos ─────────────────────────────────────────────────
  // IMPORTANTE: ao atualizar qualquer versão, atualize também as constantes
  // correspondentes no backend (src/modules/auth/auth.service.ts):
  //   PRIVACY_POLICY_VERSION e TERMS_VERSION.
  // As versões do frontend e backend devem estar SINCRONIZADAS para que o
  // TermsAcceptance registre a versão correta no banco.

  /** Versão da Política de Privacidade. Formato: AAAA-MM-DD. */
  privacyPolicyVersion: '2026-05-15',

  /** Versão dos Termos de Uso. Formato: AAAA-MM-DD. */
  termsVersion: '2026-05-15',

  /** Versão da Política de Cookies. Usado no banner e no CookieConsentLog. */
  cookiePolicyVersion: '1.0',

  /** Versão do Acordo de Processamento de Dados (DPA). */
  dataProcessingVersion: '2026-05-15',

  /** Versão da Página de Segurança. */
  securityPolicyVersion: '2026-05-15',

  /** Data de última atualização dos documentos legais (formato legível). */
  legalLastUpdatedDate: '15 de maio de 2026',
} as const

// ── Aliases de conveniência para versões (importação direta) ─────────────────
// Use estas constantes quando precisar apenas da versão, sem importar o objeto completo.

export const PRIVACY_POLICY_VERSION = companyInfo.privacyPolicyVersion
export const TERMS_VERSION = companyInfo.termsVersion
export const COOKIE_POLICY_VERSION = companyInfo.cookiePolicyVersion

// ── Status de pré-lançamento ──────────────────────────────────────────────────
// Flags que indicam se cada dado legal já foi formalizado.
// Mantenha false até ter o valor real — as páginas legais consultam esses flags
// para omitir campos não oficializados (CNPJ, endereço etc.).
//
// Ao formalizar um dado:
//   1. Atualize o valor em companyInfo acima.
//   2. Mude o flag correspondente para true aqui.
//   As páginas legais exibirão o dado automaticamente sem outra alteração.

export const companyStatus = {
  /** CNPJ registrado na Receita Federal. */
  hasRealDocumentNumber: false,
  /** Endereço comercial formalizado. */
  hasRealAddress: false,
  /** DPO nomeado formalmente (LGPD Art. 41). */
  hasNamedDpo: false,
  /** Telefone de suporte oficial definido. */
  hasRealPhone: false,
}

// ── Guarda de placeholders para produção ─────────────────────────────────────
// Chame validateCompanyConfig() em main.tsx antes de createRoot().
//
// PLACEHOLDER_CHECKS detecta formatos de placeholder acidentais (strings "TODO:"
// ou padrões numéricos zerados).
//
// Os quatro campos de pré-lançamento (documentNumber, address, dpoName, phone)
// usam intencionalmente textos honestos ("Em processo de formalização" etc.) e
// são controlados pelos flags em companyStatus — não pertencem a este array.
// Adicione aqui apenas campos que não devem chegar à produção com valores de
// desenvolvimento acidentais (e.g., API keys esquecidas no formato de test).

type PlaceholderCheck = {
  field: keyof typeof companyInfo
  isPlaceholder: (value: string) => boolean
  hint: string
}

const PLACEHOLDER_CHECKS: PlaceholderCheck[] = []

// ── Redes sociais ─────────────────────────────────────────────────────────────
// Use `null` para redes não configuradas — o componente SiteFooter omite links nulos.
// TODO: preencher com URLs reais antes de ir para produção.

export const socialLinks = {
  /** Canal oficial no YouTube. */
  youtube: 'https://www.youtube.com/@DentalFlowCorp' as string | null,

  /** Perfil oficial no Instagram. TODO: preencher. */
  instagram: null as string | null,

  /** Página oficial no LinkedIn. TODO: preencher. */
  linkedin: null as string | null,

  /** Link de contato via WhatsApp Business. TODO: preencher. */
  whatsapp: null as string | null,
} as const

export function validateCompanyConfig(): void {
  const failures = PLACEHOLDER_CHECKS.filter(({ field, isPlaceholder }) =>
    isPlaceholder(companyInfo[field] as string),
  )

  if (failures.length > 0) {
    const lines = failures.map(({ field, hint }) => `  • ${field}: ${hint}`)
    const message = `[company.ts] ${failures.length} placeholder(s) de produção detectado(s):\n${lines.join('\n')}`

    if (import.meta.env.PROD) {
      throw new Error(message)
    }
    console.warn(message)
  }

  // Aviso de pré-lançamento: informa campos pendentes de formalização.
  // Não bloqueia o app — apenas registra no console para lembrar o dev.
  // Atualize companyStatus quando cada dado for oficializado.
  const pending = Object.entries(companyStatus)
    .filter(([, ready]) => !ready)
    .map(([key]) => key)

  if (pending.length > 0) {
    console.info(
      `[company.ts] PRÉ-LANÇAMENTO: ${pending.length} campo(s) pendente(s) de formalização antes da operação comercial com clientes: ${pending.join(', ')}\n  Consulte os TODOs em src/config/company.ts para instruções.`,
    )
  }
}
