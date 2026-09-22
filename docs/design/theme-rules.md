# Regras de Tema — DentalFlow

## Regra central

| Área | Tema |
|------|------|
| Qualquer rota que **não** começa com `/app` | **Sempre claro** (forçado) |
| Rotas operacionais `/app` e `/app/*` | Respeita a preferência salva do usuário (claro ou escuro) |
| `/app/assinatura` e subrotas sem acesso de billing confirmado | Claro; com acesso confirmado, permite preferência salva |

## Como funciona tecnicamente

A regra é aplicada centralmente em `src/features/theme/ThemeProvider.tsx`.

O `ThemeProvider` usa `useRouterState` do TanStack Router para observar o `pathname` atual. A cada navegação:

- Se `pathname.startsWith('/app')` e `shouldForceLightTheme(pathname)` é false → aplica a preferência do usuário (`dark` ou `light`)
- Caso contrário → remove a classe `dark` do `document.documentElement`

`force-light-routes.ts` e `billing-theme-override.ts` definem a exceção de
onboarding/billing. A preferência continua preservada. Revisão de código: 2026-09-20.

A remoção é feita via `queueMicrotask`, garantindo que rode **depois** de todos os `useLayoutEffect` de componentes filhos — incluindo o `useForceLightTheme` já existente em algumas páginas públicas.

A preferência do usuário (`localStorage['dentalflow.theme']`) **nunca é apagada**.
Ela não é aplicada nas rotas forçadas para claro, incluindo a exceção de billing acima.

## ThemeToggle

O botão de alternar tema existe **somente** dentro do `AppShell` (área autenticada). Não deve aparecer em nenhuma página pública.

## Páginas públicas existentes (todas garantidas claro)

- `/` — Landing page
- `/acessar` — Login / cadastro
- `/funcionalidades` — Comparativo de funcionalidades
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/politica-de-cookies`
- `/tratamento-de-dados`
- `/seguranca`
- `/direitos-do-titular`
- `/direitos-do-titular/solicitar`
- `/encarregado`

## Adicionando novas páginas públicas

Novas rotas públicas (fora de `/app`) são automaticamente protegidas pela regra central no `ThemeProvider`. Não é necessário adicionar `useForceLightTheme` ou qualquer outra chamada manual.

**Checklist para nova página pública:**

- [ ] Rota registrada fora de `/app` no `router.tsx`
- [ ] Não inclui `ThemeToggle`
- [ ] Não usa classes `dark:` do Tailwind (não é necessário — a página nunca será dark)
- [ ] Usa cores semânticas (`bg-background`, `text-foreground`, etc.) para consistência visual

## Adicionando novas páginas autenticadas

Rotas dentro de `/app` herdam automaticamente a preferência do usuário.

**Checklist para nova página autenticada:**

- [ ] Rota registrada dentro de `/app/*` no `router.tsx`
- [ ] Protegida por `ProtectedAppRoute` ou `AdminRoute`
- [ ] Pode usar `dark:` utilities do Tailwind normalmente
- [ ] ThemeToggle disponível via `AppShell` (header)

## Fluxos validados

| Fluxo | Resultado esperado |
|-------|--------------------|
| Usuário com tema dark abre `/` diretamente | Página clara |
| Usuário com tema dark abre `/funcionalidades` diretamente | Página clara |
| Usuário com tema dark abre qualquer página legal diretamente | Página clara |
| Usuário em `/app` com tema dark faz logout → vai para `/` | Página clara |
| Usuário em `/app` com tema dark navega para `/funcionalidades` | Página clara |
| Usuário volta para `/app` após navegar em páginas públicas | Tema dark restaurado |
| Usuário alterna claro/escuro dentro de `/app` | Funciona normalmente |

## Arquivos chave

| Arquivo | Papel |
|---------|-------|
| `src/features/theme/ThemeProvider.tsx` | Regra central — route-aware, aplica ou remove classe `dark` |
| `src/features/theme/useForceLightTheme.ts` | Hook legado — ainda usado em algumas páginas como camada extra |
| `src/components/layout/AppShell.tsx` | Único lugar com ThemeToggle |
| `src/app/router.tsx` | Define quais rotas são públicas vs. autenticadas |
