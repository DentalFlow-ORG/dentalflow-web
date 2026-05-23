# Guia de Privacidade — Integração com Google Calendar

> **Aviso:** Requer validação jurídica antes do uso em produção.

**Versão:** 2026-05-15

---

## 1. Visão Geral

A integração com o Google Calendar permite que clínicas sincronizem agendamentos com
suas contas do Google. Essa funcionalidade apresenta considerações específicas de
privacidade que devem ser tratadas com cuidado.

---

## 2. Fluxo de Dados

```
Usuário (OWNER) → Autorização OAuth → Backend DentalFlow
                                          ↓
                                   Google Calendar API
                                          ↓
                                   Evento criado/atualizado
```

**Regras de fluxo:**
- O token OAuth do Google nunca deve ser enviado ao frontend
- Apenas o backend acessa a Google Calendar API
- O frontend recebe apenas: status de conexão, data do último sync, resultado do sync

---

## 3. Controles de Acesso

| Operação | Papel Necessário | Implementado? |
|----------|-----------------|--------------|
| Conectar conta Google | OWNER | 🟡 Verificar backend |
| Desconectar conta Google | OWNER | 🟡 Verificar backend |
| Iniciar sincronização | OWNER | 🟡 Verificar backend |
| Ver status de conexão | OWNER | 🟡 Verificar backend |

**Regra crítica:** Nenhum usuário com papel DENTIST, ASSISTANT ou ADMIN deve ter acesso
às operações de OAuth do Google Calendar da clínica.

---

## 4. Modos de Privacidade de Eventos

Para proteger a privacidade dos pacientes, eventos criados no Google Calendar devem
usar o menor nível de informação necessário.

### 4.1 Modo Mínimo (Padrão recomendado)
```
Título: "Consulta DentalFlow"
Descrição: (vazia)
```

### 4.2 Modo Básico
```
Título: "[Primeiro nome do paciente] — [Tipo de consulta]"
Descrição: (vazia)
```

### 4.3 Modo Detalhado (Risco elevado — só se explicitamente ativado pela clínica)
```
Título: "[Nome completo] — [Especialidade] — [Status]"
Descrição: Observações da consulta
```

**Padrão atual:** Implementar Modo Mínimo como padrão.  
**TODO:** Adicionar configuração de modo de privacidade por clínica no backend.

---

## 5. Aviso Obrigatório na UI

A seguinte mensagem deve ser exibida sempre que a integração estiver conectada:

```
⚠️ Eventos sincronizados com o Google Calendar ficam sujeitos às configurações e 
compartilhamentos da conta Google conectada. Evite incluir dados sensíveis de 
pacientes nos títulos ou descrições dos eventos.
```

**Status:** 🔴 Pendente — a implementar na UI de configuração do Google Calendar.

---

## 6. Armazenamento de Tokens

### Requisitos
- Tokens OAuth do Google devem ser armazenados **criptografados em repouso** no banco de dados
- Usar variável de ambiente `GOOGLE_TOKEN_ENCRYPTION_KEY` para a chave de encriptação
- Nunca registrar tokens em logs
- Nunca incluir tokens em respostas de API

### Modelo Prisma Sugerido
```prisma
model GoogleCalendarIntegration {
  id               String   @id @default(cuid())
  clinicId         String   @unique
  encryptedTokens  Bytes    // criptografado com AES-256-GCM
  tokenIv          Bytes    // IV para AES-GCM
  connectedAt      DateTime @default(now())
  lastSyncAt       DateTime?
  syncStatus       String?
  
  clinic           Clinic   @relation(fields: [clinicId], references: [id])
}
```

**Status:** 🔴 Verificar implementação atual no backend

---

## 7. Logs de Auditoria Requeridos

| Evento | Dados a Registrar |
|--------|------------------|
| Conexão Google Calendar | userId, clinicId, timestamp, IP hash |
| Desconexão Google Calendar | userId, clinicId, timestamp, motivo |
| Sincronização iniciada | userId, clinicId, timestamp |
| Sincronização concluída | clinicId, timestamp, eventos_criados, eventos_atualizados |
| Falha de sincronização | clinicId, timestamp, código_de_erro (sem dados de token) |

---

## 8. LGPD e Transferência Internacional

O Google LLC está localizado nos EUA. O uso da Google Calendar API pode configurar
transferência internacional de dados pessoais (nome do paciente, horário, etc.).

**Requer análise jurídica sobre:**
- Mecanismos de adequação aplicáveis (Art. 33 LGPD)
- Cláusulas contratuais padrão
- Necessidade de informar pacientes sobre a transferência

---

## 9. TODOs

- [ ] Verificar se tokens OAuth estão criptografados no backend
- [ ] Implementar modo de privacidade mínimo como padrão
- [ ] Adicionar configuração de modo de privacidade na UI da clínica
- [ ] Exibir aviso de privacidade na UI de configuração do Google Calendar
- [ ] Implementar logs de auditoria para eventos de sync
- [ ] Revisar com advogado o fluxo de transferência internacional
- [ ] Garantir que OWNER é o único papel que pode conectar/desconectar

---

*Documento gerado em: 2026-05-15*
