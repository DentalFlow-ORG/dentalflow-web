# Button & Card Theme Guidelines

## Princípios

- **Nunca usar cores hardcoded** (`bg-white`, `text-slate-900`, `#172f73`) em componentes autenticados. Sempre usar tokens do design system (`bg-card`, `text-foreground`, `bg-primary`).
- **Separar classes base de classes dark:**: `hover:bg-red-50 dark:hover:bg-red-900/40` — não usar `hover:bg-red-900/40` sem `dark:`.
- **Opacidade para dark mode**: use `900/40` (não `950/30`). `red-950` a 30% é quase invisível em fundo escuro.
- **Textos coloridos no dark**: prefira `*-300` (ex: `dark:text-red-300`), não `*-400`.
- **Bordas coloridas no dark**: prefira `*-700/60` (ex: `dark:border-red-700/60`), não `*-800/60`.

---

## Variantes globais do Button (`button-variants.ts`)

| Variant | Uso | Hover light | Hover dark |
|---------|-----|------------|-----------|
| `default` | CTA primário, formulários | Slate escuro, borda e sombra | Slate claro, texto escuro e sombra |
| `outline` | Ações secundárias, cards | `hover:border-primary/35 hover:bg-primary/10 hover:text-primary` | `dark:hover:bg-primary/15 dark:hover:border-primary/60` |
| `ghost` | Ações inline, ícones neutros | `hover:bg-muted hover:text-primary` | `dark:hover:bg-muted dark:hover:text-foreground` |
| `dangerGhost` | Ícones de deletar/remover inline | `hover:bg-red-50 hover:text-red-700` | `dark:hover:bg-red-900/40 dark:hover:text-red-300` |
| `destructive` | Ações destrutivas explícitas | `hover:bg-destructive/25` | `dark:hover:bg-destructive/45` |
| `secondary` | Ação verde (confirmar, salvar) | `hover:bg-[#0f9f72]` | (sem override, funciona nos dois modos) |
| `accent` | Destaque índigo | `hover:bg-[#4f46e5]` | Conforme variante compartilhada |
| `link` | Ação textual | Sublinhado | Conforme tokens |
| `inverse` | Ação sobre fundo escuro | Branco translúcido | Conforme variante compartilhada |

Reconciliado em 2026-09-20. A fonte exata é `src/components/ui/button-variants.ts`;
não copie classes desta tabela para componentes. A proibição de cores avulsas
não elimina as escolhas centralizadas já existentes nas variantes.

---

## ActionIconButton (`src/components/common/ActionIconButton.tsx`)

Componente para botões de ícone brutos em tabelas e listas, sem o overhead do Button shadcn.

```tsx
<ActionIconButton tone="danger" onClick={...} aria-label="Excluir">
  <Trash2 className="h-4 w-4" />
</ActionIconButton>
```

| Tone | Uso | Hover light | Hover dark |
|------|-----|------------|-----------|
| `default` | Editar, visualizar | `hover:bg-muted hover:text-foreground` | (token-aware) |
| `danger` | Excluir, cancelar, desativar | `hover:bg-red-50 hover:text-red-600` | `dark:hover:bg-red-900/40 dark:hover:text-red-300` |
| `success` | Reativar, aprovar | `hover:bg-emerald-50 hover:text-emerald-700` | `dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300` |
| `warning` | Pausar, alertar | `hover:bg-amber-50 hover:text-amber-700` | `dark:hover:bg-amber-900/40 dark:hover:text-amber-300` |

---

## Cards e InfoBox

### PanelCard
Sempre usa `bg-card` + `border-border`. Não personalizar fundo diretamente — use `className` apenas para espaçamento.

### InfoBox (alertas contextuais dentro de cards)
Padrão light/dark por cor:

| Tone | Light | Dark |
|------|-------|------|
| amber | `border-amber-200 bg-amber-50 text-amber-800` | `dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300` |
| blue | `border-blue-200 bg-blue-50 text-blue-800` | `dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-300` |
| red | `border-red-200 bg-red-50 text-red-700` | `dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300` |
| green | `border-emerald-200 bg-emerald-50 text-emerald-800` | `dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300` |

> InfoBox usa `950/30` (mais sutil) porque é um bloco de fundo, não um botão interativo. O contraste vem do texto e da borda.

### Countdown / banner contextual escuro
Quando um container com cor de fundo (ex: laranja) tem elementos internos com `bg-card`, use `dark:bg-muted/40 dark:border-border` no container para evitar clash entre o fundo colorido e as caixas `bg-card` aninhadas.

---

## Regras de migração

1. **Novo botão de ícone em tabela/lista** → use `ActionIconButton` com o `tone` correto.
2. **Novo botão de deletar/remover via Button** → use `variant="dangerGhost"`.
3. **Nunca adicionar** `hover:bg-red-50` sem `dark:hover:bg-red-900/40`.
4. **Nunca adicionar** `hover:shadow-lg` sem `dark:` prefix se a sombra for colorida.
5. **Validar sempre os dois temas** antes de commitar alterações visuais.
