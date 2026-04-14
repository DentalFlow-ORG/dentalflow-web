# 🦷 DentalFlow

DentalFlow é uma plataforma SaaS voltada para dentistas, com foco em **aumentar receita**, **fortalecer presença digital** e **gerar mais pacientes** através de uma solução moderna, escalável e orientada a resultados.

---

# 🧠 1. Visão Geral

## 📌 Descrição

O DentalFlow é um sistema que centraliza ferramentas de:

- presença digital
- captação de pacientes
- organização de leads
- análise de desempenho

Tudo em uma única plataforma, com foco em crescimento e previsibilidade de receita.

---

## 🎯 Objetivo

Permitir que dentistas:

- Atraiam mais pacientes
- Convertam mais contatos
- Acompanhem resultados
- Profissionalizem sua operação digital

---

## 🎯 Público-Alvo

- Dentistas autônomos
- Clínicas odontológicas
- Profissionais da saúde com foco em crescimento digital

---

## 💡 Proposta de Valor

> Uma plataforma completa para dentistas crescerem no digital com mais previsibilidade e profissionalismo.

---

# ⚙️ 2. Stack Tecnológica

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Backend
- Node.js
- NestJS
- TypeScript

## Banco de Dados
- PostgreSQL
- Prisma ORM

## Pagamentos
- Stripe

---

# 🏗️ 3. Arquitetura

```
Frontend (React)
   ↓
Backend (NestJS API)
   ↓
PostgreSQL (Database)
   ↓
Stripe (Billing)
```

---

# 📁 4. Estrutura do Projeto

## Frontend

```
src/
  app/
  components/
    ui/
    shared/
  features/
    auth/
    dashboard/
    profile/
    leads/
    billing/
  services/
  hooks/
  lib/
  styles/
```

## Backend (previsto)

```
src/
  modules/
    auth/
    users/
    profile/
    leads/
    billing/
    subscriptions/
    metrics/
```

---

# 📱 5. Módulos do Sistema

## Área Pública
- Landing page
- Página de planos
- Cadastro
- Login

## Área Autenticada

### Dashboard
- métricas de desempenho
- resumo de leads

### Perfil Profissional
- dados do dentista
- especialidades
- contatos

### Serviços
- cadastro de procedimentos

### Página Pública
- perfil profissional online
- captação de leads

### Leads
- gestão de contatos
- status de conversão

### Assinatura
- plano atual
- upgrade/downgrade

---

# ✅ 6. Requisitos Funcionais (RF)

- RF01 — Cadastro de usuário
- RF02 — Autenticação
- RF03 — Gestão de perfil
- RF04 — Cadastro de serviços
- RF05 — Página pública
- RF06 — Captura de leads
- RF07 — Gestão de leads
- RF08 — Dashboard
- RF09 — Assinatura
- RF10 — Controle por plano
- RF11 — Webhooks Stripe

---

# ⚠️ 7. Requisitos Não Funcionais (RNF)

- RNF01 — Performance
- RNF02 — Escalabilidade
- RNF03 — Segurança
- RNF04 — Usabilidade
- RNF05 — Responsividade
- RNF06 — Manutenibilidade
- RNF07 — Disponibilidade
- RNF08 — Integração

---

# 🎨 8. Identidade Visual

Primary: #1E3A8A  
Secondary: #10B981  
Accent: #6366F1  
Background: #F8FAFC  
Text: #0F172A  

---

# 🔄 9. Fluxo do Usuário

1. Acessa a plataforma  
2. Cria conta  
3. Configura perfil  
4. Cria página profissional  
5. Recebe leads  
6. Acompanha métricas  
7. Assina plano  

---

# 💰 10. Modelo de Negócio

- SaaS por assinatura mensal
- Planos escaláveis
- Cobrança via Stripe

---

# 🚀 11. Roadmap

## MVP
- Autenticação
- Perfil profissional
- Página pública
- Leads
- Dashboard
- Stripe

## Médio Prazo
- Automação de marketing
- Notificações
- Relatórios avançados

## Longo Prazo
- CRM completo
- IA de crescimento
- Multiusuários
- Integração com anúncios
- Expansão para outros nichos

---

# 📌 Status

🚧 Em desenvolvimento (MVP)