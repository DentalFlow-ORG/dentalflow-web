# Relatório de Hardening de Segurança — DentalFlow

**Versão:** 2026-05-15  
**Status:** Verificação inicial — itens do backend requerem confirmação

---

## 1. Backend — NestJS

### 1.1 Headers de Segurança (Helmet)

| Item | Status | Ação |
|------|--------|------|
| Helmet habilitado globalmente | 🟡 Verificar | `app.use(helmet())` em main.ts |
| Content-Security-Policy configurado | 🟡 Verificar | Configurar para assets DentalFlow |
| X-Frame-Options: DENY | 🟡 Verificar | Via Helmet |
| X-Content-Type-Options: nosniff | 🟡 Verificar | Via Helmet |
| Referrer-Policy configurado | 🟡 Verificar | |
| HSTS habilitado em produção | 🟡 Verificar | Via Helmet + reverse proxy |

**Implementação recomendada:**
```typescript
// main.ts
import helmet from 'helmet'
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // tailwind requer
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
}))
```

### 1.2 CORS

| Item | Status | Ação |
|------|--------|------|
| CORS configurado com origin explícita | 🟡 Verificar | Usar FRONTEND_URL env var |
| Sem wildcard (`*`) com credentials | 🟡 Verificar | Crítico |
| credentials: true configurado | 🟡 Verificar | Para cookies/tokens |
| Methods restritos | 🟡 Verificar | GET, POST, PATCH, DELETE, OPTIONS |

**Implementação recomendada:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### 1.3 Rate Limiting

| Endpoint | Status | Recomendação |
|----------|--------|-------------|
| `POST /auth/login` | 🔴 Verificar | 5 tentativas/minuto por IP |
| `POST /auth/register` | 🔴 Verificar | 10 tentativas/hora por IP |
| `POST /auth/refresh` | 🔴 Verificar | 60/minuto por usuário |
| `POST /privacy/requests` | 🔴 Verificar | 3 solicitações/hora por IP |
| `POST /privacy/cookie-consent` | 🔴 Verificar | 30/minuto por IP |

**Pacote recomendado:** `@nestjs/throttler`

### 1.4 Validação de Input

| Item | Status | Ação |
|------|--------|------|
| ValidationPipe global habilitado | 🟡 Verificar | |
| `whitelist: true` | 🟡 Verificar | Remove propriedades não declaradas no DTO |
| `forbidNonWhitelisted: true` | 🟡 Verificar | Rejeita request com propriedades extras |
| `transform: true` | 🟡 Verificar | Transforma tipos automaticamente |

**Implementação recomendada:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
```

### 1.5 Tratamento de Erros

| Item | Status | Ação |
|------|--------|------|
| Exception filter global | 🟡 Verificar | Evitar vazamento de stack traces em produção |
| Erros Prisma não expostos ao cliente | 🟡 Verificar | Mapear para mensagens genéricas |
| Mensagens de erro em português | 🟡 Verificar | |

**Erros a sanitizar:**
- Stack traces de erros internos
- Mensagens de erro do Prisma (P2002, P2025, etc.)
- Detalhes de conexão com banco de dados
- Tokens ou credenciais em mensagens de erro

### 1.6 Senhas e Hashing

| Item | Status | Recomendação |
|------|--------|-------------|
| bcrypt com salt rounds >= 12 | 🟡 Verificar | Salt rounds = 12 em produção |
| Argon2 como alternativa | 🟡 Opcional | Mais seguro que bcrypt |
| Senhas nunca logadas | 🟡 Verificar | Crítico |
| Política de senha mínima | 🟡 Verificar | Min 8 chars, frontend valida |

### 1.7 JWT e Tokens

| Item | Status | Observação |
|------|--------|-----------|
| Access token com validade curta (15-60min) | 🟡 Verificar | |
| Refresh token com rotação | 🟢 Implementado (frontend) | Verificar backend |
| Tokens nunca em logs | 🟡 Verificar | Crítico |
| JWK_SECRET em variável de ambiente | 🟡 Verificar | Não hardcoded |
| Refresh tokens invalidados no logout | 🟡 Verificar | |
| Blacklist de refresh tokens revogados | 🟡 Verificar | Via banco de dados |

### 1.8 Variáveis de Ambiente

| Item | Status | Ação |
|------|--------|------|
| Nenhum secret hardcoded | 🟡 Verificar | |
| .env nunca comittado | 🟡 Verificar | Verificar .gitignore |
| Secrets rotacionados periodicamente | 🔴 Processo a definir | |
| Validação de env vars na inicialização | 🟡 Verificar | Usar `@nestjs/config` com Joi |

**Variáveis sensíveis a verificar:**
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `DATABASE_URL` (com senha)
- `STRIPE_SECRET_KEY`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_TOKEN_ENCRYPTION_KEY`
- Chaves de serviços de e-mail

### 1.9 Upload de Arquivos

| Item | Status | Ação |
|------|--------|------|
| Validação de tipo MIME | 🟡 Verificar | Whitelist: jpg, png, pdf, etc. |
| Limite de tamanho | 🟡 Verificar | Ex: 10MB por arquivo |
| Arquivos em bucket privado | 🟡 Verificar | Não em pasta pública |
| URLs assinadas com expiração | 🟡 Verificar | Para acesso temporário |
| Scan de malware | 🔴 Pendente | TODO futuro |
| Nome de arquivo sanitizado | 🟡 Verificar | Evitar path traversal |

### 1.10 Banco de Dados

| Item | Status | Ação |
|------|--------|------|
| Queries filtradas por clinicId | 🟡 Verificar | Multi-tenancy isolation |
| Índices em tabelas de auditoria (createdAt, clinicId) | 🔴 Verificar schema | |
| Índice em email (users) | 🟡 Verificar | Para queries de auth |
| Connection pooling configurado | 🟡 Verificar | Prisma default |
| Backup automático configurado | 🔴 Verificar infra | |

---

## 2. Frontend — React/Vite

| Item | Status | Observação |
|------|--------|-----------|
| Nenhum token logado no console | 🟡 Verificar | Grep por `console.log` em auth files |
| Erros internos não exibidos ao usuário | 🟢 GlobalAlerts mostra mensagens amigáveis | |
| Mensagens de segurança em português | 🟢 Padrão do projeto | |
| Expiração de sessão tratada graciosamente | 🟢 Implementado (AuthProvider) | |
| Permissões não confiadas apenas no frontend | 🟢 Backend é autoritativo | |
| Formulários com validação de input | 🟡 Verificar formulários críticos | |
| Links legais no footer | 🟢 Implementado | |
| Cookie preferences acessível após escolha | 🟢 Implementado | |
| XSS — sem innerHTML com dados de usuário | 🟡 Verificar componentes | |
| CSRF — tokens ou cookies SameSite | 🟡 Verificar backend | |

---

## 3. Infraestrutura

| Item | Status | Ação |
|------|--------|------|
| HTTPS obrigatório em produção | 🟡 Verificar hosting | |
| Certificado TLS válido e renovado automaticamente | 🟡 Verificar | Let's Encrypt ou hosting |
| Headers de segurança via reverse proxy | 🟡 Verificar | Nginx/Caddy + Helmet |
| Backups automáticos com criptografia | 🔴 Verificar | |
| Monitoramento de disponibilidade | 🔴 A configurar | |
| Alertas de tentativas de brute force | 🔴 A configurar | |
| Segregação de ambientes (dev/staging/prod) | 🟡 Verificar | |

---

## 4. Itens Críticos Pendentes

1. 🔴 **Verificar rate limiting em endpoints de auth e privacidade**
2. 🔴 **Verificar criptografia de tokens Google OAuth em repouso**
3. 🔴 **Verificar exception filter global para não vazar erros internos**
4. 🔴 **Verificar CORS sem wildcard em produção**
5. 🔴 **Configurar backups automáticos e criptografados**
6. 🔴 **Verificar indexes no banco para tabelas de auditoria**
7. 🔴 **Garantir que tokens não aparecem em logs**

---

## 5. Auditoria full-stack — 2026-06-12 (verificada no código)

Auditoria completa de frontend (`dentalflow-web`) e backend (`dentalflow-api`)
lendo o código diretamente. Os itens 🟡/🔴 das seções 1–3 foram confirmados.
**Nenhuma falha Crítica ou Alta encontrada.** Resumo do que foi verificado e
do que foi alterado nesta passagem.

### 5.1 Controles verificados como corretos (backend)

| Área | Resultado | Referência |
|------|-----------|-----------|
| Helmet (CSP `default-src 'none'`, frameguard deny, noSniff, HSTS em prod, hidePoweredBy) | ✅ | `src/main.ts` |
| CORS allowlist explícita, sem `*`, `credentials: true` | ✅ | `src/main.ts`, `src/config/validate-env.ts` |
| Rate limiting global (`@nestjs/throttler` 120/60s) + por rota (login 10/min, register 5/min, forgot-password 3/min) + limiter por identidade | ✅ | `src/app.module.ts`, `auth.controller.ts`, `auth/login-identity-rate-limiter.service.ts` |
| ValidationPipe global (`whitelist`, `forbidNonWhitelisted`, `transform`) | ✅ | `src/main.ts` |
| Exception filter sanitiza erros/stack/Prisma e redige Bearer/refresh/senha/api-key | ✅ | `src/common/filters/global-exception.filter.ts` |
| bcrypt rounds = 12; senha min 8 / max 72 + complexidade; nunca retornada | ✅ | `auth.service.ts`, `common/validators/password-policy.ts` |
| JWT access 15m; refresh 7d hasheado (SHA-256); rotação com detecção de reuso → revoga sessões; `tokenVersion` no JWT | ✅ | `auth.service.ts`, `auth/jwt.strategy.ts` |
| `JWT_SECRET` obrigatório (lança se ausente); env validado com fail-fast; nenhum secret commitado | ✅ | `config/auth.config.ts`, `config/validate-env.ts` |
| Tokens Google OAuth criptografados em repouso (AES-256-GCM, IV+tag) | ✅ | `calendar-integrations/calendar-integrations.service.ts` |
| Isolamento multi-tenant: queries escopadas por `clinicId` via helpers `assert*`; lock advisory contra double-booking; paginação com teto 100 | ✅ | `appointments`, `fiscal`, `profiles`, `clinical-records` services |
| Stripe webhook: verificação de assinatura (raw body), idempotência (`StripeEvent` PK), `clinicId` vindo do metadata | ✅ | `billing/webhook.service.ts`, `billing/webhook.controller.ts` |
| Audit log: IP hasheado, sem tokens/senhas; rotas de leitura ADMIN-only | ✅ | `audit-log/audit-log.service.ts`, `audit-log.controller.ts` |
| Índices de auditoria/agendamento e FK Google Calendar | ✅ | `prisma/schema.prisma` |

### 5.2 Controles verificados como corretos (frontend)

- Access token apenas em memória; `localStorage` guarda só a flag `activeSession` (não sensível); refresh token nunca acessível ao JS. `src/features/auth/utils/session-storage.ts`
- Refresh single-flight; logout chama o backend e limpa sessão + cache de billing + estado. `src/services/http.ts`, `src/features/auth/providers/AuthProvider.tsx`
- Route guards são apenas UX (backend é autoritativo); billing falha-aberto no cliente e é reforçado por request. `src/features/auth/components/ProtectedAppRoute.tsx`
- Sem `dangerouslySetInnerHTML`/`innerHTML`/markdown-HTML; única escrita de HTML (`print-invoice.ts`) escapa todos os dados; saídas de IA renderizadas como texto.
- Todos os `target="_blank"` usam `rel="noopener noreferrer"`. Apenas 2 `console` (avisos de config, sem dados). Apenas `VITE_API_URL`/`VITE_BILLING_PROMOTION_ENDS_AT` expostos (públicos).

### 5.3 Correções aplicadas nesta passagem

1. **Cabeçalhos de segurança no frontend (Vercel)** — `vercel.json` passou a enviar
   CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
   `Permissions-Policy` e HSTS em todas as rotas. Antes só havia o rewrite de SPA.
   - **CSP — dependência importante:** `connect-src` inclui o origin da API
     (`https://dentalflow-api.onrender.com`). **Se o domínio da API mudar
     (`VITE_API_URL`), atualize `connect-src` em `vercel.json`** ou as chamadas
     serão bloqueadas. `microphone=(self)` é mantido para o ditado clínico.
   - Teste de regressão: `src/tests/security/security-headers.test.ts`.

2. **Cookie de refresh cross-site + CSRF (backend)** — o SPA (Vercel) e a API
   (Render) ficam em domínios registráveis distintos (cross-site). O cookie de
   refresh passou a usar **`SameSite=None; Secure` em produção** (Lax em dev
   localhost) para ser enviado em fetches cross-site; como `None` remove a
   proteção CSRF do SameSite, `/auth/refresh` e `/auth/logout` agora validam o
   header **`Origin`** contra a allowlist. **Não troque para `SameSite=Strict`** —
   quebraria o refresh silencioso nessa topologia. `auth.controller.ts`,
   `common/utils/origin-allowlist.ts`.

3. **Linkagem de paciente em nota fiscal (backend)** — `assertLinksBelongToClinic`
   passou a validar que `patientId` referencia um usuário `role: PATIENT` ativo
   (espelhando `AppointmentsService.assertPatientUser`), impedindo vincular um
   usuário arbitrário (owner de outra clínica, admin) à nota. `fiscal.service.ts`.

### 5.4 Itens reportados e aceitos (sem alteração)

- **Quota de IA (TOCTOU):** verificação count-then-allow pode estourar a quota
  marginalmente sob concorrência; impacto/custo baixo. Aceito.
- **`StripeEvent.rawPayload`:** payload Stripe completo é persistido (tabela
  ADMIN-only, útil para replay/auditoria). Aceito.
- **Callback OAuth reflete mensagem em query param:** apenas strings internas
  fixas, URL-encoded, renderizadas como texto pelo frontend — sem XSS. Aceito.

---

*Documento gerado em: 2026-05-15 · Atualizado em: 2026-06-12*
