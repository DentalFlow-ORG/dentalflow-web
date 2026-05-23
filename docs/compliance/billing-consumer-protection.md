# Proteção ao Consumidor e Transparência de Faturamento — DentalFlow

> **Aviso:** Requer validação jurídica. Aplicam-se o CDC (Lei 8.078/1990),
> a LGPD e regulamentações setoriais.

**Versão:** 2026-05-15

---

## 1. Princípios do CDC Aplicáveis

1. **Transparência (Art. 6, III):** O consumidor tem direito à informação adequada e clara sobre produtos e serviços.
2. **Proibição de práticas abusivas (Art. 39):** Não enviar produtos/serviços sem solicitação prévia; não exigir pagamento por serviços não contratados.
3. **Direito de arrependimento (Art. 49):** Para contratos eletrônicos, pode haver direito de arrependimento em 7 dias.
4. **Vedação de cláusulas abusivas (Art. 51):** Cláusulas que limitem direitos do consumidor podem ser nulas.
5. **Cobrança indevida (Art. 42):** Vedada a cobrança de dívidas de forma constrangedora; valores cobrados indevidamente devem ser devolvidos em dobro.

---

## 2. Checklist de Transparência de Preços

### 2.1 Página de Planos / Pricing

| Item | Status | Observação |
|------|--------|-----------|
| Preço atual claramente visível | 🟡 Verificar | Verificar componentes de pricing |
| Período de faturamento (mensal/anual) | 🟡 Verificar | Deve ser inequívoco |
| O que está incluído em cada plano | 🟡 Verificar | |
| Duração exata do trial | 🟡 Verificar | Ex: "14 dias grátis" |
| Quando a cobrança inicia | 🟡 Verificar | Após trial, deve ser claro |
| Renovação automática informada | 🟡 Verificar | **Obrigatório** |
| Cancelamento disponível antes da cobrança | 🟡 Verificar | |

### 2.2 Preços Promocionais

| Item | Status | Observação |
|------|--------|-----------|
| Preço original visível ao lado do promocional | 🟡 Verificar | Não criar "desconto falso" |
| Condições da promoção claras | 🟡 Verificar | Ex: "válido até 30/06/2026" |
| Promoção baseada em preço real (não inflado) | 🟡 Verificar | Prática de preço inflado pode ser ilegal |

**Regra:** Se exibir preço "de" riscado, o preço original deve ter sido o preço praticado
antes da promoção por período razoável.

---

## 3. Fluxo de Compra — Requisitos

### 3.1 Antes da Confirmação do Pagamento
- [ ] Exibir resumo do plano selecionado
- [ ] Confirmar preço exato e periodicidade
- [ ] Informar data da primeira cobrança
- [ ] Informar sobre renovação automática
- [ ] Botão de confirmação explícito (não vago como "Continuar")

### 3.2 E-mails Transacionais
- [ ] E-mail de confirmação de assinatura com valor e data de cobrança
- [ ] E-mail de lembrete antes da renovação (recomendado, 3-7 dias antes)
- [ ] E-mail de confirmação de cancelamento

---

## 4. Cancelamento — Requisitos

O cancelamento deve ser **tão fácil quanto a contratação** (prática de interface escura
de cancelamento difícil pode ser considerada abusiva sob o CDC).

- [ ] Link "Gerenciar assinatura" visível no painel (via Stripe Portal)
- [ ] Link "Cancelar assinatura" presente na página de assinatura
- [ ] Processo de cancelamento em no máximo 2-3 cliques
- [ ] Confirmação de cancelamento enviada por e-mail
- [ ] Acesso mantido até fim do período pago
- [ ] Sem taxa de cancelamento não prevista nos termos

---

## 5. Trial Gratuito — Requisitos

- [ ] Duração exata claramente informada no cadastro
- [ ] Sem solicitação de cartão no início do trial (se for "cartão não requerido")
- [ ] Se cartão for requerido no trial: aviso destacado de quando a cobrança começa
- [ ] E-mail de lembrete antes do fim do trial
- [ ] Sem cobrança automática ao fim do trial sem confirmação do usuário
  - **Exceção:** Se o modelo for "cartão requerido + trial", a cobrança automática
    deve ser claramente informada e consentida no momento do cadastro

---

## 6. Reembolsos e Política de Estornos

**Posição atual dos Termos de Uso:**
- Sem reembolso proporcional por período não utilizado

**Análise CDC:**
- O CDC pode garantir direito de arrependimento de 7 dias para contratações eletrônicas
- Recomenda-se consulta jurídica para definir política de reembolso compatível com o CDC

**TODOs:**
- [ ] Validar política de reembolso com advogado especializado em CDC
- [ ] Documentar casos de reembolso obrigatório por lei
- [ ] Implementar processo de solicitação de reembolso

---

## 7. Dados de Pagamento — LGPD e PCI DSS

- Dados de cartão processados exclusivamente via Stripe (PCI DSS Nível 1)
- DentalFlow não armazena dados de cartão
- Stripe Customer ID e Subscription ID são dados pessoais (vinculados à pessoa física/jurídica)
- Retenção de dados de pagamento conforme legislação tributária (mínimo 5 anos)

---

## 8. TODOs

- [ ] Revisar página de pricing com checklist de transparência
- [ ] Adicionar passo de confirmação antes da assinatura paga
- [ ] Garantir que cancelamento está a ≤ 2 cliques de distância
- [ ] Revisar política de reembolso com advogado (CDC Art. 49)
- [ ] Configurar e-mails de lembrete de renovação (via Stripe ou serviço de e-mail)
- [ ] Documentar regra de negócio para preços promocionais
- [ ] Validar toda a experiência de checkout com advogado CDC

---

*Documento gerado em: 2026-05-15*  
*⚠️ Requer revisão jurídica especializada em CDC, LGPD e direito digital*
