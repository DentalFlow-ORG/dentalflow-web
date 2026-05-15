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

  /** CNPJ formatado. TODO: preencher com CNPJ real antes da produção. */
  documentNumber: '00.000.000/0001-00',

  /** Endereço completo para fins legais. TODO: preencher antes da produção. */
  address: 'TODO: Endereço comercial completo',

  /** Telefone de suporte. TODO: preencher antes da produção. */
  phone: '(00) 00000-0000',

  // ── Contatos ──────────────────────────────────────────────────────────────

  /** E-mail geral de contato / suporte. */
  supportEmail: 'contato@dentalflow.com.br',

  /** E-mail para exercício de direitos LGPD e contato com o DPO. */
  privacyEmail: 'privacidade@dentalflow.com.br',

  /** E-mail para reporte de vulnerabilidades e incidentes de segurança. */
  securityEmail: 'seguranca@dentalflow.com.br',

  // ── DPO ───────────────────────────────────────────────────────────────────

  /** Nome do Encarregado de Proteção de Dados (DPO). TODO: preencher antes da produção. */
  dpoName: 'TODO: Nome do DPO',

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

// ── Guarda de placeholders para produção ─────────────────────────────────────
// Chame validateCompanyConfig() em main.tsx antes de createRoot().
//
// Em builds de produção (import.meta.env.PROD), qualquer placeholder não
// resolvido lança um Error que interrompe o app antes de montar — impedindo um
// deploy ao vivo com dados jurídicos falsos.
//
// Em desenvolvimento, emite console.warn para cada placeholder encontrado.

type PlaceholderCheck = {
  field: keyof typeof companyInfo
  isPlaceholder: (value: string) => boolean
  hint: string
}

const PLACEHOLDER_CHECKS: PlaceholderCheck[] = [
  {
    field: 'documentNumber',
    isPlaceholder: (v) => v === '00.000.000/0001-00',
    hint: 'Preencha com o CNPJ real registrado na Receita Federal.',
  },
  {
    field: 'address',
    isPlaceholder: (v) => v.includes('TODO'),
    hint: 'Preencha com o endereço comercial completo (logradouro, número, cidade, UF, CEP).',
  },
  {
    field: 'dpoName',
    isPlaceholder: (v) => v.includes('TODO'),
    hint: 'Preencha com o nome completo do Encarregado (DPO) — obrigatório pelo LGPD Art. 41.',
  },
  {
    field: 'phone',
    isPlaceholder: (v) => v === '(00) 00000-0000',
    hint: 'Preencha com o número de suporte real.',
  },
]

export function validateCompanyConfig(): void {
  const failures = PLACEHOLDER_CHECKS.filter(({ field, isPlaceholder }) =>
    isPlaceholder(companyInfo[field] as string),
  )

  if (failures.length === 0) return

  const lines = failures.map(({ field, hint }) => `  • ${field}: ${hint}`)
  const message =
    `[company.ts] ${failures.length} placeholder(s) de produção detectado(s):\n` +
    lines.join('\n')

  if (import.meta.env.PROD) {
    throw new Error(message)
  } else {
    console.warn(message)
  }
}
