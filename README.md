# 🦷 DentalFlow — Frontend

DentalFlow é uma plataforma SaaS voltada para dentistas, com foco em **aumentar receita**, **fortalecer presença digital** e **gerar mais pacientes** através de uma solução moderna, escalável e orientada a resultados.

Este repositório contém o **frontend da aplicação**, responsável pela interface do usuário, experiência e interação com o sistema.

---

# 🧠 1. Visão Geral

## 📌 Descrição

O frontend do DentalFlow é responsável por:

- Interface do usuário (UI)
- Experiência do usuário (UX)
- Comunicação com o backend (API)
- Renderização de dados
- Interações do usuário

---

## 🎯 Objetivo

Fornecer uma interface:

- moderna
- profissional
- intuitiva
- orientada à conversão
- consistente visualmente

---

## 🎯 Público-Alvo

- Dentistas autônomos
- Clínicas odontológicas
- Profissionais da saúde com foco em crescimento digital

---

## 💡 Proposta de Valor

> Uma interface que transmite profissionalismo e ajuda dentistas a crescerem no digital.

---

# 🖥️ 2. Responsabilidade do Frontend

O frontend é responsável por:

- Renderizar a interface do sistema
- Gerenciar estado da aplicação
- Consumir APIs do backend
- Garantir boa experiência do usuário
- Aplicar identidade visual e design system

❗ O frontend NÃO deve conter:
- lógica de negócio crítica
- validação de pagamento
- regras de assinatura
- lógica sensível de backend

---

# ⚙️ 3. Stack Tecnológica

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

---

# 🏗️ 4. Arquitetura Geral

Frontend (React)
   ↓
Backend (NestJS API)
   ↓
PostgreSQL (Database)
   ↓
Stripe (Billing)

---

# 📁 5. Estrutura do Projeto

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

---

# 🧩 6. Organização do Código

## components/
- UI base (shadcn)
- componentes reutilizáveis

## features/
- organização por domínio (auth, leads, etc.)

## services/
- comunicação com API
- centralização de requests

## hooks/
- hooks customizados

## lib/
- utilitários
- helpers
- funções compartilhadas

---

# 🔌 7. Integração com Backend

O frontend consome a API do backend (NestJS).

### Regras:

- Todas as chamadas devem ser feitas via services
- Nunca chamar API diretamente dentro de componentes
- Usar tipagem forte para requests/responses
- Preparado para integração com React Query

---

# 🔐 8. Segurança (Frontend)

- Nunca armazenar dados sensíveis
- Nunca confiar apenas em validação do frontend
- Toda validação crítica deve estar no backend

---

# 🎨 9. Identidade Visual

## 🎯 Conceito

- Profissional
- Moderno
- Clean
- Confiável
- Tecnológico

---

## 🎨 Paleta de cores

Primary: #1E3A8A
Primary Light: #3B82F6
Secondary: #10B981
Accent: #6366F1
Background: #F8FAFC
Text: #0F172A

---

## 🎯 Diretrizes de UI

- Hierarquia visual clara
- Espaçamento consistente
- Cards limpos
- Tipografia forte
- Evitar poluição visual
- Evitar excesso de cores

---

# 📱 10. Módulos do Frontend

## Área Pública

- Landing page
- Página de planos
- Login
- Cadastro

## Área Autenticada

### Dashboard
- métricas
- resumo de leads

### Perfil
- dados profissionais
- especialidades

### Serviços
- procedimentos

### Leads
- lista
- status
- acompanhamento

### Assinatura
- plano atual
- upgrade

---

# 🔄 11. Fluxo do Usuário

1. Usuário acessa a landing  
2. Cria conta  
3. Faz login  
4. Configura perfil  
5. Acessa dashboard  
6. Gerencia leads  
7. Acompanha resultados  

---

# 💰 12. Modelo de Negócio

- SaaS por assinatura
- planos mensais
- cobrança via Stripe (backend)

---

# 🚀 13. Roadmap

## MVP
- Autenticação
- Dashboard
- Perfil
- Leads
- Página pública

## Evolução
- Onboarding guiado
- Métricas avançadas
- Melhorias de UX

## Futuro
- Automações
- Integração com WhatsApp
- IA
- Multiusuários

---

# ⚠️ 14. Regras do Projeto

- Não alterar stack sem aprovação
- Priorizar reutilização
- Evitar duplicação
- Seguir design system
- Manter consistência visual

---

# ⚙️ 15. Como rodar o projeto

(Definido após setup inicial)

---

# 📌 16. Status

🚧 Em desenvolvimento (MVP)

---

# 🏁 17. Objetivo Final

Criar uma experiência de produto que:

- aumente a conversão
- gere valor real
- transmita autoridade
- escale como SaaS profissional

---

# Role and Scheduling Model

The role and scheduling model is documented in
[docs/roles-and-scheduling.md](docs/roles-and-scheduling.md).

Key frontend rule: the public login page must stay clean and must not expose
internal role names, role selectors, or permission hierarchy. Role-based access
is enforced by the backend after authentication.
