# Revisão de RBAC (Controle de Acesso Baseado em Papel) — DentalFlow

**Versão:** 2026-05-15  
**Status:** Rascunho — Requer verificação no backend

---

## 1. Resumo dos Papéis

| Papel | Escopo | Billing | Dados Clínicos | Admin Plataforma |
|-------|--------|---------|---------------|-----------------|
| ADMIN | Sistema inteiro | Sim (admin) | Não (por princípio) | Sim |
| OWNER | Própria clínica | Sim | Sim | Não |
| DENTIST | Própria agenda/pacientes | Não | Sim (escopo próprio) | Não |
| ASSISTANT | Própria clínica | Não | Não (somente agendamentos) | Não |
| PATIENT | Próprios dados | Não | Próprios | Não |

---

## 2. Mapeamento de Rotas Frontend × Papel

### 2.1 Rotas Públicas (sem autenticação)
- `/` — Landing page
- `/acessar` — Login/Registro
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/politica-de-cookies`
- `/tratamento-de-dados`
- `/seguranca`
- `/direitos-do-titular`
- `/direitos-do-titular/solicitar`
- `/encarregado`

### 2.2 Rotas Protegidas por Papel

| Rota | Papéis Permitidos | Guard Atual |
|------|------------------|------------|
| `/app` | OWNER, ASSISTANT, ADMIN | ProtectedAppRoute |
| `/app/agendamentos` | OWNER, ASSISTANT | ProtectedAppRoute |
| `/app/agenda` | DENTIST | ProtectedAppRoute |
| `/app/equipe` | OWNER | ProtectedAppRoute |
| `/app/equipe/$profileId` | OWNER, DENTIST | ProtectedAppRoute |
| `/app/financeiro` | OWNER | ProtectedAppRoute |
| `/app/notas-fiscais` | OWNER, ASSISTANT | ProtectedAppRoute |
| `/app/pacientes` | OWNER, ASSISTANT | ProtectedAppRoute |
| `/app/assinatura` | OWNER, DENTIST, ASSISTANT | ProtectedAppRoute |
| `/app/prontuario` | OWNER, DENTIST | ProtectedAppRoute |
| `/app/prontuario/$id` | OWNER, DENTIST | ProtectedAppRoute |
| `/app/modelos-clinicos` | OWNER, DENTIST | ProtectedAppRoute |
| `/app/estoque` | OWNER, ASSISTANT | ProtectedAppRoute |
| `/app/admin/*` | ADMIN | AdminRoute |

---

## 3. Pontos de Atenção — Frontend

### 3.1 ✅ Correto
- Rotas protegidas pelo componente `ProtectedAppRoute` com `allowedRoles`
- Redirecionamento por papel em caso de acesso não autorizado
- Backend valida access token em todas as requisições autenticadas

### 3.2 ⚠️ Riscos Identificados

**Risk 1: Frontend como única barreira (design correto, execução a verificar)**
- O frontend esconde rotas por papel, mas a **segurança real está no backend**
- Verificar que todos os endpoints NestJS têm guard `@Roles()` ou similar
- Um usuário com token válido mas papel inadequado não deve obter dados via API

**Risk 2: Acesso DENTIST a dados de outro dentista**
- `/app/equipe/$profileId` permite OWNER e DENTIST
- Verificar se DENTIST pode acessar o perfil de outro dentista da mesma clínica
- Regra de negócio: DENTIST vê apenas o próprio perfil?

**Risk 3: Cross-clinic isolation**
- Verificar que todas as queries Prisma no backend filtram por `clinicId`
- Nenhum endpoint deve retornar dados de outras clínicas, mesmo com token válido

**Risk 4: ADMIN e dados clínicos**
- ADMIN tem acesso ao sistema como um todo
- Verificar se ADMIN deve ou não ter acesso a prontuários de pacientes
- Por princípio de menor privilégio, ADMIN de plataforma não deveria acessar dados clínicos
- Documentar a regra de negócio e implementar restrição se necessário

---

## 4. Checklist de Revisão — Backend (a verificar)

### 4.1 Guards e Decorators

- [ ] Todos os controllers têm `@UseGuards(JwtAuthGuard)` (ou equivalente global)
- [ ] Rotas com dados sensíveis têm `@Roles(...)` explícito
- [ ] Nenhuma rota "vazou" sem guard devido a omissão
- [ ] Guard verifica papel E clinicId quando aplicável

### 4.2 Isolamento de Dados por Clínica

- [ ] Todas as queries de pacientes: `WHERE clinicId = req.user.clinicId`
- [ ] Todas as queries de agendamentos: `WHERE clinicId = req.user.clinicId`
- [ ] Todas as queries de prontuários: `WHERE clinicId = req.user.clinicId`
- [ ] Todas as queries de equipe: `WHERE clinicId = req.user.clinicId`
- [ ] Todas as queries financeiras: `WHERE clinicId = req.user.clinicId`
- [ ] Logs de auditoria: `clinicId` registrado em ações relevantes

### 4.3 Endpoints Públicos (sem auth)

- [ ] `POST /auth/login` — rate limiting aplicado?
- [ ] `POST /auth/register` — rate limiting aplicado?
- [ ] `POST /privacy/requests` — validação anti-spam/rate limiting aplicado?
- [ ] `POST /privacy/cookie-consent` — rate limiting aplicado?
- [ ] Nenhum endpoint público expõe dados pessoais

### 4.4 Cenários de Teste Recomendados

| Cenário | Resultado Esperado |
|---------|-------------------|
| ASSISTANT tenta acessar `/billing/subscription` | 403 Forbidden |
| DENTIST tenta acessar dados de outra clínica | 403 Forbidden |
| OWNER clínica A tenta acessar pacientes da clínica B | 403 Forbidden |
| Token expirado | 401 Unauthorized |
| Token inválido/adulterado | 401 Unauthorized |
| Sem token em rota protegida | 401 Unauthorized |
| ADMIN acessa `/app/admin/users` | 200 OK |
| OWNER acessa `/app/admin/users` | 403 Forbidden |
| PATIENT acessa qualquer rota `/app/*` | Redirect para login ou 403 |

---

## 5. Princípio do Menor Privilégio — Recomendações

### 5.1 ASSISTANT
- ✅ Agendamentos, pacientes, estoque, notas fiscais
- ❌ Prontuários completos (apenas agenda de consultas)
- ❌ Financeiro completo
- ❌ Configurações da clínica
- ❌ Google Calendar OAuth

### 5.2 DENTIST
- ✅ Própria agenda e agendamentos atribuídos
- ✅ Prontuários de pacientes que já atendeu ou que estão na sua agenda
- ❌ Prontuários de pacientes de outros dentistas (verificar regra de negócio)
- ❌ Financeiro
- ❌ Google Calendar OAuth (somente OWNER)

### 5.3 OWNER
- ✅ Tudo da própria clínica
- ❌ Dados de outras clínicas
- ❌ Painel de admin da plataforma

### 5.4 ADMIN
- ✅ Painel administrativo da plataforma
- ✅ Usuários, clínicas, financeiro da plataforma
- ⚠️ Acesso a dados clínicos deve ser definido explicitamente como permitido ou negado

---

## 6. TODOs

- [ ] Auditoria manual de todos os endpoints NestJS (verificar guards)
- [ ] Testes automatizados de autorização (pelo menos casos críticos)
- [ ] Definir e documentar se ADMIN acessa dados clínicos
- [ ] Verificar isolamento de clinicId em todas as queries
- [ ] Adicionar rate limiting em endpoints de autenticação e privacidade
- [ ] Implementar logging de tentativas de acesso não autorizado

---

*Documento gerado em: 2026-05-15*
