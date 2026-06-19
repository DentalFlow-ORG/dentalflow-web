# Relatório Final — Camada de Compliance DentalFlow

**Data:** 2026-05-15
**Autor:** Equipe DentalFlow (assistida por Claude Code)
**Status:** Implementação da camada técnica concluída — Requer revisão jurídica antes da produção

---

## ⚠️ Aviso Legal Importante

Esta implementação melhora significativamente a postura de privacidade e segurança da
plataforma DentalFlow, mas **não substitui a revisão formal por:**

- Advogado especializado em LGPD e direito digital
- Advogado especializado em direito do consumidor (CDC)
- Profissional especializado em regulação de saúde e odontologia
- Especialista em segurança da informação para revisão técnica do backend

Todos os documentos legais gerados são **modelos informativos** e devem ser revisados
e adaptados à realidade específica da empresa antes do uso em produção.

---

## 1. Sumário Executivo

Implementada uma camada de compliance completa cobrindo:

- 7 páginas legais públicas com conteúdo LGPD-alinhado
- Sistema de consentimento de cookies granular com ANPD guidance
- Formulário de solicitação de direitos do titular (LGPD Art. 18)
- Dashboard de compliance para ADMIN (solicitações, auditoria, consentimentos)
- Auditoria de eventos do sistema (14 ações registradas, sem dados sensíveis)
- Guarda de placeholders que impede build/deploy em produção com dados fictícios
- Fluxo de cadastro com aceite de Termos e Política de Privacidade (TermsAcceptance)

---

## 2. Arquivos Principais

### 2.1 Configuração Central

| Arquivo | Função |
|---------|--------|
| `src/config/company.ts` | Fonte única de dados da empresa e versões de documentos; exporta `validateCompanyConfig()` |
| `src/main.tsx` | Chama `validateCompanyConfig()` antes de montar o app |

### 2.2 Rotas e Páginas

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/politica-de-privacidade` | PrivacyPolicyPage | Público |
| `/termos-de-uso` | TermsOfUsePage | Público |
| `/politica-de-cookies` | CookiePolicyPage | Público |
| `/tratamento-de-dados` | DataProcessingPage | Público |
| `/seguranca` | SecurityPage | Público |
| `/direitos-do-titular` | DataRightsPage | Público |
| `/direitos-do-titular/solicitar` | PrivacyRequestFormPage | Público |
| `/encarregado` | DpoContactPage | Público |
| `/app/compliance` | CompliancePage | ADMIN only |

### 2.3 Backend — Endpoints Implementados

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/privacy/requests` | Público (rate-limited 5/h) | Criar solicitação de direitos |
| GET | `/privacy/requests` | **ADMIN only** | Listar solicitações |
| GET | `/privacy/requests/:id` | **ADMIN only** | Ver solicitação |
| PATCH | `/privacy/requests/:id/status` | **ADMIN only** | Atualizar status |
| POST | `/privacy/requests/:id/response` | **ADMIN only** | Responder solicitação |
| POST | `/privacy/cookie-consent` | Público (rate-limited) | Registrar consentimento anônimo |
| POST | `/privacy/cookie-consent/authenticated` | Autenticado | Registrar consentimento com userId |
| GET | `/privacy/cookie-consents` | **ADMIN only** | Listar logs de consentimento |
| GET | `/audit-logs` | **ADMIN only** | Listar eventos de auditoria |

> **Nota de segurança:** OWNER não tem acesso a `/privacy/requests` nem a `/privacy/requests/:id`.
> O acesso OWNER foi deliberadamente removido: o escopo por clínica requer uma FK `clinicId`
> confiável em `PrivacyRequest` (não implementada). Reativar apenas quando o portal do paciente
> vincular solicitações a clínicas via ID — nunca via `clinicName` (campo livre do solicitante).

---

## 3. Guarda de Placeholders de Produção

### Como funciona

`validateCompanyConfig()` em `src/config/company.ts` é chamada sincronamente em `src/main.tsx`
antes de `createRoot()`. Ela verifica os seguintes campos em `companyInfo`:

| Campo | Placeholder proibido |
|-------|---------------------|
| `documentNumber` | `'00.000.000/0001-00'` |
| `address` | Qualquer valor contendo `'TODO'` |
| `dpoName` | Qualquer valor contendo `'TODO'` |
| `phone` | `'(00) 00000-0000'` |

**Em `import.meta.env.PROD === true`:** lança `Error` antes de montar o app, abortando o deploy.

**Em desenvolvimento:** emite `console.warn` listando cada placeholder pendente.

### Como preencher antes de produção

1. Abra `src/config/company.ts`
2. Substitua cada campo placeholder pelo valor real:
   - `documentNumber`: CNPJ no formato `XX.XXX.XXX/XXXX-XX` (obter da Receita Federal)
   - `address`: endereço completo (logradouro, número, complemento, bairro, cidade, UF, CEP)
   - `dpoName`: nome completo do Encarregado de Proteção de Dados
   - `phone`: número real de suporte ao cliente
   - `legalName`: confirmar que corresponde exatamente à razão social no CNPJ
3. Execute `bun run build` — se não lançar erro, os dados estão preenchidos

---

## 4. Auditoria de Eventos

Todos os eventos abaixo são registrados em `AuditLog` sem dados sensíveis:

| Ação | Disparado em | Dados no metadata |
|------|-------------|-------------------|
| `USER_CREATED` | Cadastro bem-sucedido | `clinicId` |
| `TERMS_ACCEPTED` | Cadastro bem-sucedido | `privacyPolicyVersion`, `termsVersion` |
| `USER_LOGIN_SUCCESS` | Login bem-sucedido | — |
| `USER_LOGIN_FAILURE` | Senha errada / usuário inativo | `emailHash` (SHA-256 truncado), `reason` |
| `USER_LOGOUT` | Logout explícito | — |
| `USER_REFRESH_TOKEN` | Refresh bem-sucedido | `reason: TOKEN_ROTATED` |
| `USER_REFRESH_TOKEN_FAILED` | 4 cenários de falha de refresh | `reason` (genérico) |
| `PRIVACY_REQUEST_CREATED` | Formulário de direitos submetido | `requestCode`, `requestType`, `requesterType` |
| `PRIVACY_REQUEST_STATUS_CHANGED` | Admin altera status | `previousStatus`, `newStatus`, `requestCode` |
| `PRIVACY_REQUEST_RESPONDED` | Admin envia resposta | `requestCode` |
| `COOKIE_CONSENT_RECORDED` | Banner ou modal de cookies | `policyVersion`, `source`, `categories` |

**Dados nunca registrados:** senha, token JWT, refresh token, Authorization header, dados clínicos brutos.

---

## 5. Sistema de Cookie Consent

**Arquitetura:**
- `CookieConsentProvider` envolve toda a aplicação no `RootRoute`
- Banner aparece automaticamente na primeira visita (sem consentimento prévio)
- Consentimento salvo em `localStorage` com chave `dentalflow_cookie_consent_v{version}`
- Versão verificada no carregamento: consent com `version !== COOKIE_POLICY_VERSION` é descartado
- Backend logado via `POST /privacy/cookie-consent` de forma não-bloqueante (best-effort)

**Categorias:** `necessary` (sempre ativo), `preferences`, `analytics`, `marketing`

**ANPD Compliance:** sem pré-seleção de opcionais; rejeição em 1 clique; revogação a qualquer momento.

---

## 6. Fluxo de Direitos do Titular

1. Usuário acessa `/direitos-do-titular`
2. Clica "Fazer uma solicitação" → `/direitos-do-titular/solicitar`
3. Preenche: nome, e-mail, tipo de solicitante, tipo de direito, descrição
4. Aceita checkbox `identityConfirmationAccepted` (obrigatório)
5. Formulário enviado para `POST /privacy/requests` (público, rate-limited)
6. Resposta: `{ requestCode, message }` — confirmação com código único exibida
7. Admin gerencia via `/app/compliance` → aba "Solicitações LGPD"

---

## 7. Aceite de Termos no Cadastro

- Checkbox obrigatório com links para `/termos-de-uso` e `/politica-de-privacidade`
- Backend valida `acceptedTerms: true` via `@IsBoolean() @Equals(true)` em `register.dto.ts`
- `TermsAcceptance` criado atomicamente dentro da `$transaction` de registro
- Campos armazenados: `userId`, `privacyPolicyVersion`, `termsVersion`, `ipHash` (SHA-256 truncado), `userAgent` (truncado a 512 chars)

---

## 8. Pendências Técnicas Remanescentes

| Prioridade | Item |
|-----------|------|
| **Bloqueador** | Preencher `documentNumber`, `address`, `dpoName`, `phone` em `company.ts` |
| **Bloqueador** | Aplicar migração Prisma: `bunx prisma migrate deploy` no backend antes do deploy |
| **Bloqueador** | Revisão jurídica de todas as páginas legais |
| Alto | Adicionar `"strict": true` ao `tsconfig.app.json` (tratado em bloco técnico separado) |
| Alto | Adicionar `"noImplicitAny": true` ao `tsconfig.json` do backend |
| Médio | AdminRoute: exibir mensagem de acesso negado antes de redirecionar |
| Médio | Job de retenção/exclusão para `audit_logs` e `cookie_consent_logs` |
| Baixo | Implementar exportação de dados do titular (ZIP CSV/JSON) |
| Baixo | Implementar anonimização de entidades |

---

## 9. Itens Pendentes — Revisão Legal

- [ ] **Crítico:** Revisão jurídica de todas as páginas legais por advogado LGPD
- [ ] **Crítico:** Designação formal do Encarregado (DPO) com publicação
- [ ] **Crítico:** Validação de bases legais para tratamento de dados de saúde
- [ ] **Alta:** DPA/contrato de operação com clínicas
- [ ] **Alta:** Contratos formais com subprocessadores (Stripe, Google, Supabase)
- [ ] **Alta:** Análise de transferência internacional de dados
- [ ] **Alta:** Validação da política de reembolso com CDC
- [ ] **Alta:** Revisão de prazos de retenção com contador/advogado especializado
- [ ] **Alta:** Análise de obrigações do CFO para prontuários eletrônicos
- [ ] **Média:** ROPA (Registro de Operações de Tratamento) formal para ANPD

---

## 10. Passos Exatos Antes de Produção

1. **Preencher `src/config/company.ts`** com CNPJ, endereço, telefone e nome do DPO reais
2. **Executar `bun run build`** — build falhará se qualquer placeholder permanecer
3. **No backend:** executar `bunx prisma migrate deploy` contra o banco de produção
4. **Contratar advogado** especializado em LGPD para revisar os textos legais
5. **Designar o DPO** e configurar o e-mail `privacidade@dentalflow.com.br`
6. **Executar o checklist de validação manual** em staging (`docs/compliance/manual-validation-checklist.md`)
7. **Revisar política de cookies** após definir quais scripts de analytics serão usados
8. **Firmar DPAs** com Stripe, Google e demais subprocessadores
9. **`strict mode` do TypeScript** — tratado em bloco técnico separado; não bloqueia compliance

---

*Relatório atualizado em: 2026-05-15*
*⚠️ Esta implementação melhora a postura de compliance mas não substitui assessoria jurídica especializada*
