# Checklist de Validação Manual — Compliance DentalFlow

**Versão:** 2026-05-15
**Uso:** Execute este checklist antes de colocar em produção qualquer funcionalidade de compliance.

---

## 0. Bloqueadores de Deploy — Execute Antes de Qualquer Outra Coisa

Estes itens devem ser resolvidos **antes** de qualquer deploy em produção.
Um build com qualquer destes pendentes falhará ou publicará dados fictícios.

### 0.1 Placeholders Jurídicos (`src/config/company.ts`)

O app detecta automaticamente placeholders e lança erro no build de produção.
Verifique executando `bun run build` — se falhar com `[company.ts]`, resolva os itens abaixo.

- [ ] `documentNumber` preenchido com CNPJ real (formato `XX.XXX.XXX/XXXX-XX`)
      → Obter da Receita Federal; confirmar que corresponde à razão social cadastrada
- [ ] `address` preenchido com endereço comercial completo
      → Logradouro, número, complemento, bairro, cidade, UF, CEP
- [ ] `dpoName` preenchido com nome completo do Encarregado de Proteção de Dados
      → Obrigatório pelo LGPD Art. 41 §1; deve ser publicado e acessível aos titulares
- [ ] `phone` preenchido com número de suporte real
- [ ] `legalName` confirmado: corresponde exatamente à razão social no CNPJ

### 0.2 Migração de Banco de Dados (Backend)

- [ ] Executar no backend antes do deploy:
      ```
      bunx prisma migrate deploy
      ```
      Confirmar que a saída indica "All migrations have been applied".
      Sem isso, `register()` e `createRequest()` falham em runtime.

### 0.3 Revisão Jurídica

- [ ] Advogado especializado em LGPD revisou todas as páginas legais
- [ ] Advogado especializado em direito do consumidor (CDC) revisou Termos de Uso
- [ ] DPO foi formalmente designado e aceita o cargo
- [ ] DPO está ciente do canal de contato `privacidade@dentalflow.com.br`

### 0.4 Verificação do Build de Produção

```powershell
# No diretório dentalflow-web:
Set-Location "C:\Users\yagos\DevelopmentProjects\dentalflow-web"
bun run build
# Esperado: build concluído SEM erro "[company.ts] placeholders"
# Se falhar: preencher os campos indicados no erro e repetir
```

---

---

## 1. Banner e Preferências de Cookies

### 1.1 Primeiro Acesso
- [ ] Banner aparece na primeira visita ao site (sem consentimento prévio)
- [ ] Banner NÃO aparece se já houve consentimento registrado
- [ ] Banner é acessível (pode ser operado por teclado)
- [ ] Link "Saiba mais" no banner aponta para `/politica-de-cookies`

### 1.2 Opções do Banner
- [ ] "Aceitar todos" funciona e fecha o banner
- [ ] "Recusar não essenciais" funciona e fecha o banner
- [ ] "Personalizar" abre o modal de preferências
- [ ] Todas as 3 opções são igualmente visíveis (sem padrão escuro)
- [ ] Botão de rejeição não está escondido atrás de mais cliques

### 1.3 Modal de Preferências
- [ ] Modal abre ao clicar "Personalizar"
- [ ] "Necessários" está sempre ativo e não pode ser desativado
- [ ] "Preferências", "Analytics", "Marketing" podem ser ativados/desativados independentemente
- [ ] Switches de toggle funcionam com click e teclado
- [ ] "Salvar preferências" persiste as escolhas e fecha o modal
- [ ] "Aceitar todos" aceita tudo e fecha
- [ ] "Recusar opcionais" desativa tudo exceto necessários

### 1.4 Persistência de Consentimento
- [ ] Preferências persistem após recarregar a página
- [ ] Preferências persistem após fechar e abrir o navegador
- [ ] A chave `dentalflow_cookie_consent_v1` está no localStorage
- [ ] O JSON salvo contém: version, timestamp, source, categories

### 1.5 Reabertura de Preferências
- [ ] Botão "Cookies" no footer aparece e abre o modal de preferências
- [ ] Pode revogar/alterar preferências a qualquer momento

### 1.6 Analytics / Scripts Condicionais
- [ ] Scripts de analytics NÃO carregam sem consentimento da categoria analytics
- [ ] Scripts de marketing NÃO carregam sem consentimento da categoria marketing
- [ ] Após aceitar analytics, scripts carregam (testar quando implementado)

---

## 2. Páginas Legais

### 2.1 Carregamento
- [ ] `/politica-de-privacidade` carrega sem erro
- [ ] `/termos-de-uso` carrega sem erro
- [ ] `/politica-de-cookies` carrega sem erro
- [ ] `/tratamento-de-dados` carrega sem erro
- [ ] `/seguranca` carrega sem erro
- [ ] `/direitos-do-titular` carrega sem erro
- [ ] `/encarregado` carrega sem erro
- [ ] `/direitos-do-titular/solicitar` carrega sem erro

### 2.2 Layout e Responsividade
- [ ] Todas as páginas têm header com link "Voltar ao início"
- [ ] Todas as páginas têm footer com links legais
- [ ] Layout responsivo no mobile (375px)
- [ ] Layout responsivo no desktop (1440px)
- [ ] Texto legível (tamanho e contraste adequados)

### 2.3 Conteúdo
- [ ] Todas as páginas têm "Última atualização: ..." visível
- [ ] Todas as páginas têm aviso de revisão jurídica necessária
- [ ] Texto em português
- [ ] Links internos entre páginas legais funcionam
- [ ] Link para ANPD abre em nova aba
- [ ] E-mail `privacidade@dentalflow.com.br` clicável em todas as páginas relevantes

### 2.4 Links no Footer
- [ ] "Privacidade" aponta para `/politica-de-privacidade`
- [ ] "Termos" aponta para `/termos-de-uso`
- [ ] "Segurança" aponta para `/seguranca`
- [ ] "Seus dados" aponta para `/direitos-do-titular`
- [ ] "Cookies" abre o modal de preferências
- [ ] Todos os links funcionam no footer do landing page E do app

---

## 3. Formulário de Solicitação de Direitos

### 3.1 Submissão Válida
- [ ] Formulário valida campos obrigatórios (nome, e-mail, tipo, solicitação, descrição)
- [ ] Checkbox de verificação de identidade é obrigatório
- [ ] Sem checkbox marcado → erro exibido, sem envio
- [ ] Com todos os campos preenchidos e checkbox marcado → formulário é enviado
- [ ] Após envio bem-sucedido: tela de confirmação com código exibida
- [ ] Código de solicitação exibido é alfanumérico/único

### 3.2 Segurança
- [ ] Sem checkbox de identidade → mensagem de erro clara
- [ ] Campos vazios → validação HTML5 (required) previne envio
- [ ] E-mail inválido → validação impede envio

### 3.3 UX de Erro
- [ ] Se backend retorna erro → mensagem amigável em português
- [ ] Botão de envio fica desabilitado durante o envio (isSubmitting)
- [ ] Formulário não revela se um e-mail existe ou não no sistema

---

## 4. Logs de Auditoria (verificar com acesso ao backend)

- [ ] Login bem-sucedido gera log de auditoria
- [ ] Falha de login gera log de auditoria (sem senha registrada)
- [ ] Logout gera log de auditoria
- [ ] Criação de agendamento gera log
- [ ] Acesso a prontuário gera log
- [ ] Alteração de papel de usuário gera log
- [ ] Mudança de status de subscription gera log
- [ ] Status de privacy request alterado gera log
- [ ] Logs NÃO contêm: senhas, tokens, dados clínicos completos, números de cartão

---

## 5. Controle de Acesso

### 5.1 Acesso Cross-Clinic
- [ ] Token de usuário da clínica A não retorna dados da clínica B
- [ ] Tentar acessar paciente de outra clínica retorna 403

### 5.2 Restrições por Papel
- [ ] ASSISTANT não acessa `/app/financeiro`
- [ ] ASSISTANT não acessa `/app/prontuario`
- [ ] DENTIST não acessa `/app/financeiro`
- [ ] OWNER não acessa `/app/admin/*`
- [ ] Usuário sem token → redirecionado para login

### 5.3 Expiração de Sessão
- [ ] Token expirado → tentativa de refresh automático
- [ ] Refresh falha → redirecionamento para login
- [ ] Mensagem amigável de sessão expirada

---

## 6. Cadastro e Termos

- [ ] Página de cadastro exibe links para Termos de Uso e Política de Privacidade
- [ ] Links abrem em nova aba e apontam para `/termos-de-uso` e `/politica-de-privacidade`
- [ ] Checkbox de aceite dos termos está presente e é obrigatório
- [ ] Sem marcar o checkbox → botão "Criar conta" permanece desabilitado ou exibe erro
- [ ] Cadastro com `acceptedTerms: false` → backend retorna 400
- [ ] Cadastro bem-sucedido → `TermsAcceptance` criado no banco com `privacyPolicyVersion` e `termsVersion`
- [ ] AuditLog registra `USER_CREATED` e `TERMS_ACCEPTED` após cadastro

---

## 7. Segurança Geral

- [ ] Abrir console do navegador: nenhum token JWT impresso
- [ ] Abrir console: nenhum dado sensível de paciente impresso
- [ ] Requisição com token inválido retorna 401 (testar via DevTools)
- [ ] Erros 500 retornam mensagem genérica, não stack trace (testar em modo produção)

---

## 8. Modo Escuro

- [ ] Banner de cookies legível no modo escuro
- [ ] Modal de preferências legível no modo escuro
- [ ] Páginas legais legíveis no modo escuro (se acessadas no modo escuro)

---

*Checklist gerado em: 2026-05-15*  
*Execute novamente após mudanças significativas na plataforma*
