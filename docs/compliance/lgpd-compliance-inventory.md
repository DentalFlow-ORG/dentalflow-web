# LGPD Compliance Inventory — DentalFlow

> **Aviso legal:** Este documento é um inventário técnico informativo elaborado internamente.
> Não constitui parecer jurídico. **Deve ser revisado por advogado especializado em LGPD,
> direito digital, direito do consumidor e regulação de saúde/odontologia antes do uso em produção.**

**Versão:** 2026-05-15  
**Responsável:** Equipe DentalFlow  
**Status:** Rascunho — Requer validação jurídica

---

## 1. Categorias de Dados Pessoais Tratados

### 1.1 Dados de Conta (Usuários da Plataforma)

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Nome completo | Identificação, exibição no sistema | Execução de contrato | Requer validação jurídica |
| E-mail | Autenticação, comunicação | Execução de contrato | Requer validação jurídica |
| Telefone | Comunicação, recuperação de conta | Execução de contrato | Requer validação jurídica |
| Hash de senha | Autenticação segura | Execução de contrato | Nunca armazenada em texto claro |
| Papel/Role | Controle de acesso | Execução de contrato | Não exposto publicamente |
| Relação com clínica (clinicId) | Isolamento de dados por tenant | Execução de contrato | Multi-tenancy |
| Foto/avatar | Exibição de perfil | Consentimento (quando aplicável) | Se implementado |

### 1.2 Dados da Clínica

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Nome da clínica | Identificação, faturamento | Execução de contrato | |
| CNPJ / CPF | Faturamento, obrigação fiscal | Obrigação legal | Requer validação |
| Endereço | Documentos, faturamento | Execução de contrato | |
| Dados de cobrança | Processamento de pagamento | Execução de contrato | Via Stripe |

### 1.3 Dados de Pacientes (Tratados pela Clínica)

> ⚠️ **DentalFlow atua como operador/processador** para dados de pacientes cujo controlador é a clínica.

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Nome do paciente | Identificação, agendamento | Execução de contrato (clínica/paciente) | Requer validação |
| Contato (tel/email) | Comunicação, lembretes | Execução de contrato | |
| Data de nascimento | Histórico clínico, anamnese | Proteção à saúde / contrato | Dado sensível indireto |
| Histórico de agendamentos | Gestão de consultas | Execução de contrato | |

### 1.4 Dados de Saúde / Dados Sensíveis (Prontuário Odontológico)

> ⚠️ **ATENÇÃO:** Dados de saúde são dados sensíveis nos termos do Art. 11 da LGPD.
> O tratamento requer base legal específica e cuidados adicionais de segurança.

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Notas clínicas / prontuário | Atendimento odontológico | Tutela da saúde (Art. 11, II, f LGPD) | Requer validação jurídica |
| Histórico de tratamentos | Continuidade do atendimento | Tutela da saúde | Requer validação |
| Diagnósticos | Documentação clínica | Tutela da saúde | Requer validação |
| Anamnese | Avaliação de saúde geral | Tutela da saúde | Requer validação |
| Prescrições | Documentação clínica | Tutela da saúde | Requer validação |
| Imagens/radiografias (anexos) | Diagnóstico e tratamento | Tutela da saúde | Requer validação |
| Modelos clínicos preenchidos | Documentação clínica | Tutela da saúde | Requer validação |

**Referências:** CFO Resolução 198/2019 (prontuário odontológico eletrônico), Art. 11 LGPD.

### 1.5 Dados Financeiros

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Stripe Customer ID | Gerenciamento de assinatura | Execução de contrato | Não exposto no frontend |
| Stripe Subscription ID | Controle de acesso à plataforma | Execução de contrato | |
| Histórico de pagamentos | Comprovante fiscal, suporte | Obrigação legal / contrato | Requer validação |
| Dados de notas fiscais | Emissão fiscal | Obrigação legal | |
| Dados de receitas/despesas | Gestão financeira da clínica | Execução de contrato | |

### 1.6 Dados Técnicos e de Log

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Endereço IP | Segurança, prevenção de fraude | Legítimo interesse / segurança | Hash preferível a IP bruto |
| User Agent | Diagnóstico técnico | Legítimo interesse | |
| Logs de acesso | Auditoria de segurança | Legítimo interesse / obrigação | |
| Logs de auditoria | Rastreabilidade de ações | Legítimo interesse / obrigação | |
| Tokens de sessão (access/refresh) | Autenticação | Execução de contrato | Nunca registrados em logs |
| Metadados de sessão | Controle de acesso | Execução de contrato | |

### 1.7 Dados de Integração

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Google Calendar Event IDs | Sincronização de agenda | Consentimento / contrato | |
| Status de sincronização | Exibição de estado | Execução de contrato | |
| Metadados de conexão OAuth | Gestão da integração | Consentimento | |
| Tokens OAuth Google | Autenticação com Google | Consentimento | **Nunca expostos ao frontend** |

### 1.8 Dados de Consentimento de Cookies

| Dado | Finalidade | Base Legal (preliminar) | Observação |
|------|-----------|------------------------|------------|
| Categorias aceitas | Registro de consentimento | Obrigação (LGPD Art. 8) | |
| Timestamp do consentimento | Auditabilidade | Obrigação | |
| Versão da política | Rastreamento de mudanças | Obrigação | |
| ID anônimo (se não logado) | Correlação de sessão | Legítimo interesse / consentimento | Não associar a PII sem necessidade |
| Hash de IP | Registro de origem | Legítimo interesse / segurança | Hash, não IP bruto |

---

## 2. Mapeamento de Bases Legais

> ⚠️ Este mapeamento é preliminar e **requer validação jurídica especializada**.

### 2.1 Atividades de Tratamento Principais

| Atividade de Tratamento | Base Legal LGPD | Artigo | Status |
|------------------------|-----------------|--------|--------|
| Criação e gestão de conta | Execução de contrato (Art. 7, V) | Art. 7, V | Requer validação |
| Autenticação e controle de acesso | Execução de contrato (Art. 7, V) | Art. 7, V | Requer validação |
| Gerenciamento de assinatura e pagamento | Execução de contrato (Art. 7, V) | Art. 7, V | Requer validação |
| Tratamento de prontuário e dados clínicos | Tutela da saúde (Art. 11, II, f) | Art. 11, II, f | **Requer validação jurídica urgente** |
| Registro de agendamentos | Execução de contrato (Art. 7, V) | Art. 7, V | Requer validação |
| Logs de auditoria e segurança | Legítimo interesse (Art. 7, IX) / Obrigação legal | Art. 7, II e IX | Requer validação |
| Comunicações transacionais | Execução de contrato (Art. 7, V) | Art. 7, V | Requer validação |
| Cookies necessários | Execução de contrato / Legítimo interesse | Art. 7, V e IX | Requer validação |
| Cookies de preferência | Consentimento (Art. 7, I) | Art. 7, I | Requer validação |
| Cookies de analytics | Consentimento (Art. 7, I) ou Legítimo interesse | Art. 7, I e IX | **Requer validação jurídica** |
| Integração Google Calendar | Consentimento (Art. 7, I) | Art. 7, I | Requer validação |
| Prevenção de fraude e segurança | Legítimo interesse (Art. 7, IX) | Art. 7, IX | Requer validação |
| Resposta a solicitações de titulares | Obrigação legal (Art. 7, II) | Art. 7, II | Requer validação |

---

## 3. Análise Controlador / Operador

### 3.1 DentalFlow como Controlador

DentalFlow atua como **controlador** (Art. 5, VI da LGPD) nas seguintes situações:

- Dados de conta de usuários da plataforma (gestores, dentistas, assistentes)
- Dados de faturamento e assinatura
- Dados de segurança e logs de acesso à plataforma
- Dados de analytics e métricas de uso da própria plataforma
- Dados de comunicação comercial e suporte

### 3.2 DentalFlow como Operador (Processador)

DentalFlow atua como **operador** (Art. 5, VII da LGPD) nas seguintes situações:

- Dados de pacientes inseridos pelas clínicas (controladores)
- Prontuários e registros clínicos
- Histórico de agendamentos de pacientes
- Documentos e arquivos de pacientes

> **Implicação:** A clínica (OWNER) é o controlador para dados de seus pacientes.
> A responsabilidade primária pela base legal de tratamento desses dados é da clínica.
> DentalFlow deve garantir segurança e seguir instruções do controlador.
> Um Acordo de Processamento de Dados (DPA/Contrato de Operação) deve ser firmado.

### 3.3 Suboperadores / Subprocessadores

| Subprocessador | Dados Compartilhados | Finalidade | Localização | Garantias |
|---------------|---------------------|-----------|-------------|-----------|
| Stripe | Dados de pagamento | Processamento de assinatura | EUA | PCI DSS, SCCs |
| Supabase/PostgreSQL | Todos os dados | Armazenamento de dados | Verificar região | Requer documentação |
| Google (Calendar API) | Eventos de calendário | Integração de agenda | EUA | SCCs, termos do Google |
| Provedor de e-mail | Nome, e-mail | Comunicações transacionais | A definir | Requer documentação |

> ⚠️ **Transferência Internacional:** O uso de provedores nos EUA pode configurar transferência
> internacional de dados. Requer análise jurídica sobre mecanismos de adequação (Art. 33 LGPD).

---

## 4. Direitos dos Titulares

DentalFlow deve suportar os seguintes direitos (Art. 18 da LGPD):

| Direito | Art. 18 | Status de Implementação | Canal |
|---------|---------|------------------------|-------|
| Confirmação do tratamento | I | 🔴 Pendente | Formulário de solicitação |
| Acesso aos dados | II | 🔴 Pendente | Formulário de solicitação |
| Correção de dados | III | 🟡 Parcial (via perfil) | Formulário + perfil |
| Anonimização, bloqueio ou eliminação | IV | 🔴 Pendente | Formulário de solicitação |
| Portabilidade | V | 🔴 Pendente | Formulário de solicitação |
| Eliminação quando há consentimento | VI | 🔴 Pendente | Formulário de solicitação |
| Informação sobre compartilhamento | VII | 🔴 Pendente | Política de privacidade |
| Informação sobre possibilidade de negar consentimento | VIII | 🔴 Pendente | Política + banner |
| Revogação de consentimento | IX | 🟡 Parcial (cookies) | Central de preferências |
| Petição à ANPD | X | N/A (direito externo) | Informativo na política |

**Prazo de resposta:** A LGPD não especifica prazo fixo, mas a ANPD orienta que seja razoável.
Recomenda-se resposta em até 15 dias úteis com possibilidade de extensão justificada.

**Exceções ao direito de exclusão:**
- Prontuários odontológicos: CFO orienta retenção mínima de 10 anos após último atendimento
- Dados fiscais: obrigação de retenção por 5 anos (Lei 5.172/1966 - CTN)
- Dados de auditoria: pode haver necessidade de retenção para defesa em processo

---

## 5. Mapa de Riscos

### 5.1 Riscos de Alta Prioridade

| Risco | Área | Impacto | Probabilidade | Mitigação |
|-------|------|---------|--------------|-----------|
| Acesso não autorizado a prontuários | Dados de saúde | Muito Alto | Média | RBAC rigoroso, logs de auditoria |
| Exposição de dados de saúde via sync Google Calendar | Integração | Alto | Média | Modo privacidade de calendário |
| Vazamento de tokens OAuth do Google | Integração | Alto | Baixa | Tokens somente no backend, encriptados |
| Cross-clinic data access (violação de tenant) | Multi-tenancy | Muito Alto | Baixa | clinicId em todas as queries |
| Logs contendo dados sensíveis | Logs | Alto | Média | Sanitização de logs |
| Exposição de dados em erros HTTP | API | Alto | Média | Exception filter global |
| Backup contendo dados de saúde não encriptados | Infraestrutura | Alto | Média | Encriptação de backup |
| Falta de DPA com subprocessadores | Legal | Alto | Alta | Documentação e contratos |
| Retenção indefinida de dados | Lifecycle | Médio | Alta | Política de retenção + soft delete |
| Upload de arquivos sem validação | Anexos | Alto | Baixa | Validação de tipo/tamanho |

### 5.2 Riscos de Média Prioridade

| Risco | Área | Impacto | Observação |
|-------|------|---------|------------|
| Cookies sem consentimento granular | Analytics | Médio | Cookie banner implementado (Block 3) |
| Ausência de registro de aceitação de termos | Legal | Médio | TermsAcceptance a implementar |
| Sem encarregado (DPO) designado | Organizacional | Médio | Requer decisão da empresa |
| Portal do paciente com acesso a dados próprios | Planejado | Médio | Quando implementado |
| Comunicação de marketing sem consentimento | Marketing | Médio | Requer análise antes de implementar |

---

## 6. Checklist Técnico-Jurídico de Conformidade

### 6.1 Documentação Legal

| Item | Status | Prioridade |
|------|--------|-----------|
| Política de Privacidade publicada | 🟡 Template implementado | Alta |
| Termos de Uso publicados | 🟡 Template implementado | Alta |
| Política de Cookies publicada | 🟡 Template implementado | Alta |
| Página de Tratamento de Dados (DPA) | 🟡 Template implementado | Alta |
| Página de Segurança | 🟡 Template implementado | Média |
| Página de Direitos do Titular | 🟡 Template implementado | Alta |
| Contato do Encarregado (DPO) | 🟡 Template implementado | Alta |
| Revisão jurídica de todos os documentos | 🔴 Pendente | **Crítico** |
| Designação formal do Encarregado (DPO) | 🔴 Pendente | Alta |
| DPA/Contrato de Operação com clínicas | 🔴 Pendente | Alta |
| Contratos com subprocessadores | 🔴 Pendente | Alta |

### 6.2 Consentimento e Cookies

| Item | Status | Prioridade |
|------|--------|-----------|
| Banner de cookies com opções granulares | 🟢 Implementado | Alta |
| Rejeição fácil de cookies opcionais | 🟢 Implementado | Alta |
| Central de preferências de cookies | 🟢 Implementado | Alta |
| Consentimento versionado com timestamp | 🟢 Implementado | Alta |
| Link "Preferências de cookies" no footer | 🟢 Implementado | Média |
| Não pré-seleção de categorias opcionais | 🟢 Implementado | Alta |
| Scripts de analytics sem consentimento bloqueados | 🟢 Arquitetura implementada | Alta |
| Registro de consentimento no backend | 🔴 Pendente (endpoint planejado) | Média |

### 6.3 Segurança Técnica

| Item | Status | Prioridade |
|------|--------|-----------|
| Hash de senhas (bcrypt) | 🟢 Backend (presumido) | Crítico |
| JWT + rotação de refresh token | 🟢 Implementado | Alta |
| HTTPS em produção | 🟢 Esperado (Supabase/hosting) | Crítico |
| Helmet (headers de segurança) | 🟡 Verificar backend | Alta |
| CORS configurado explicitamente | 🟡 Verificar backend | Alta |
| Rate limiting em endpoints públicos | 🟡 Verificar backend | Alta |
| ValidationPipe com whitelist | 🟡 Verificar backend | Alta |
| Exception filter global (sem vazamento de erros internos) | 🟡 Verificar backend | Alta |
| Tokens OAuth Google encriptados em repouso | 🔴 Verificar backend | Alta |
| Logs sem dados sensíveis | 🟡 Verificar backend | Alta |
| Índices em tabelas de auditoria | 🔴 Verificar backend | Média |

### 6.4 Direitos dos Titulares

| Item | Status | Prioridade |
|------|--------|-----------|
| Formulário de solicitação de direitos | 🟢 Implementado (frontend) | Alta |
| Endpoint backend para solicitações | 🔴 Pendente | Alta |
| Workflow de gestão de solicitações | 🔴 Pendente | Alta |
| Painel admin para gestão de solicitações | 🔴 Pendente | Média |
| Registro de aceitação de termos no cadastro | 🔴 Pendente | Alta |
| Exportação de dados do titular | 🔴 Pendente | Média |
| Anonimização de dados | 🔴 Pendente | Média |
| Resposta dentro do prazo definido | 🔴 Processo a definir | Alta |

### 6.5 Auditoria e Retenção

| Item | Status | Prioridade |
|------|--------|-----------|
| Logs de auditoria de ações sensíveis | 🔴 Verificar backend | Alta |
| Política de retenção documentada | 🟢 Documentada | Média |
| Soft delete com deletedAt | 🔴 Verificar backend | Média |
| Exclusão automática após período de retenção | 🔴 Pendente | Baixa |
| Backup encriptado | 🔴 Verificar infraestrutura | Alta |

### 6.6 Integração Google Calendar

| Item | Status | Prioridade |
|------|--------|-----------|
| Tokens OAuth somente no backend | 🟡 Verificar | Alta |
| Modo privacidade de eventos | 🔴 Pendente | Alta |
| Aviso de privacidade na UI | 🔴 Pendente | Alta |
| Logs de auditoria de sincronização | 🔴 Pendente | Média |
| Documentação de privacidade do Google Calendar | 🟢 Documentada | Baixa |

### 6.7 Faturamento e Proteção ao Consumidor

| Item | Status | Prioridade |
|------|--------|-----------|
| Preço claro com condições de trial | 🟡 Verificar | Alta |
| Passo de confirmação antes de cobrança | 🟡 Verificar | Alta |
| Caminho claro de cancelamento | 🟡 Verificar (via Stripe Portal) | Alta |
| Renovação automática informada | 🟡 Verificar | Alta |
| Termos cobrem trial, cancelamento, reembolso | 🟡 Template | Alta |
| Promoções com condições transparentes | 🟡 Verificar implementação | Média |

---

## 7. Encarregado de Dados (DPO)

Conforme Art. 41 da LGPD, o controlador e o operador devem indicar um encarregado.

- **Status atual:** A designar
- **Canal de contato sugerido:** privacidade@dentalflow.com.br
- **Publicação:** Deve ser publicada na política de privacidade e em página dedicada

---

## 8. Registro de Operações de Tratamento (ROPA)

A ANPD pode exigir o ROPA (Registro das Operações de Tratamento).
Recomenda-se manter este documento atualizado e utilizá-lo como base para o ROPA formal.

---

*Documento gerado em: 2026-05-15*  
*Próxima revisão recomendada: 2026-08-15 ou após mudanças significativas no produto*  
*⚠️ Requer revisão jurídica especializada antes do uso em produção*
