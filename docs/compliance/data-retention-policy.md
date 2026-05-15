# Política de Retenção de Dados — DentalFlow

> **Aviso legal:** Este documento é um modelo informativo. Os prazos de retenção listados
> são preliminares e **devem ser revisados por advogado especializado** em LGPD, direito
> tributário, regulação de saúde e odontologia antes do uso em produção.

**Versão:** 2026-05-15  
**Status:** Rascunho — Requer validação jurídica e odontológica

---

## 1. Princípios

- **Minimização:** Reter dados apenas pelo tempo necessário para a finalidade.
- **Limitação de armazenamento:** Excluir ou anonimizar após o prazo de retenção.
- **Segurança durante a retenção:** Dados retidos devem manter o mesmo nível de proteção.
- **Exceções legais:** Obrigações legais ou regulatórias podem exigir retenção além da necessidade operacional.

---

## 2. Matriz de Retenção

| Categoria de Dados | Período de Retenção | Base Legal/Justificativa | Observação |
|-------------------|--------------------|--------------------------|-|
| **Dados de conta (usuários ativos)** | Enquanto ativo + 2 anos | Execução de contrato | Requer validação |
| **Dados de conta (usuários inativos/cancelados)** | 2 anos após cancelamento | Defesa legal / obrigação | Requer validação |
| **Dados da clínica** | Enquanto ativo + 5 anos | Obrigação fiscal/legal | Requer validação |
| **Dados de pacientes — identificação** | 10 anos após último atendimento | CFO Res. 198/2019 | **Requer validação odontológica e jurídica** |
| **Prontuários odontológicos** | Mínimo 10 anos após último atendimento | CFO Res. 198/2019 | **Crítico — requer validação** |
| **Histórico de agendamentos** | 5 anos | Possível obrigação legal | Requer validação |
| **Dados financeiros / faturamento** | 5 anos | CTN Art. 173 / legislação tributária | Requer validação |
| **Notas fiscais** | 5-10 anos | Legislação tributária variável | Requer validação por contador |
| **Logs de auditoria** | 2 anos | Segurança / defesa legal | Requer validação |
| **Logs de acesso/segurança** | 1 ano | Marco Civil da Internet | Art. 15 MCI — requer validação |
| **Consentimentos de cookies** | 2 anos | Comprovação de conformidade LGPD | Requer validação |
| **Solicitações de titulares (privacy requests)** | 5 anos | Defesa legal / auditabilidade | Requer validação |
| **Backups** | 30-90 dias (backups operacionais) | Continuidade de negócio | Definir política específica |
| **Tokens de sessão (refresh tokens)** | Até revogação ou expiração | Segurança | Técnico |
| **Tokens OAuth Google** | Até desconexão | Consentimento / contrato | Técnico |
| **Dados de integração** | Enquanto integração ativa + 30 dias | Execução de contrato | |

---

## 3. Exceções ao Direito de Exclusão

As seguintes situações podem impedir ou limitar a exclusão imediata de dados:

### 3.1 Prontuários Odontológicos
O CFO (Conselho Federal de Odontologia) orienta que prontuários odontológicos devem
ser mantidos por no mínimo 10 (dez) anos após o último atendimento do paciente.
Mesmo com solicitação de exclusão, a DentalFlow e a clínica devem observar essa
obrigação regulatória.

### 3.2 Obrigações Fiscais
Dados fiscais, notas fiscais e registros de pagamento devem ser mantidos conforme
exigências da Receita Federal e legislação tributária estadual/municipal aplicável
(tipicamente 5 anos, podendo ser maior em alguns casos).

### 3.3 Processos Judiciais ou Administrativos
Dados relevantes para defesa em processos em andamento podem ser retidos além do
prazo padrão até o trânsito em julgado ou encerramento do processo.

### 3.4 Marco Civil da Internet
Registros de conexão e acesso a aplicações de Internet podem ser exigidos por até
6 meses (Art. 15, Lei 12.965/2014), podendo ser estendido por ordem judicial.

---

## 4. Implementação Técnica

### 4.1 Soft Delete
Dados sujeitos a retenção com exclusão posterior devem usar soft delete:

```prisma
model Patient {
  // ...
  deletedAt     DateTime?
  deletedBy     String?
  deletionReason String?
}
```

### 4.2 Anonimização
Para dados que podem ser anonimizados (identificadores substituídos por valores
neutros que não permitem identificação):

```typescript
// Exemplo de função de anonimização (pseudocódigo)
async function anonymizePatient(patientId: string, reason: string) {
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: '[ANONIMIZADO]',
      email: null,
      phone: null,
      deletedAt: new Date(),
      deletionReason: reason,
      // Manter: appointmentIds (para estatísticas), clinicId, createdAt
    },
  })
}
```

### 4.3 Exportação de Dados
Antes de excluir dados, oferecer exportação ao titular/clínica:
- Formatos: JSON, CSV
- Endpoint: `POST /privacy/export` (a implementar)
- Autorização: OWNER para dados da clínica; ADMIN para dados sistêmicos

---

## 5. TODOs Técnicos

- [ ] Adicionar `deletedAt`, `deletedBy`, `deletionReason` nos modelos Prisma relevantes
- [ ] Implementar serviço de anonimização para Patient e User
- [ ] Implementar exportação de dados (ZIP com CSV/JSON)
- [ ] Configurar job periódico de limpeza de dados expirados
- [ ] Documentar política de retenção de backups com provedor de infraestrutura
- [ ] Revisar retenção com advogado e contador especializados

---

*Documento gerado em: 2026-05-15*  
*⚠️ Requer revisão jurídica, odontológica e contábil antes do uso em produção*
