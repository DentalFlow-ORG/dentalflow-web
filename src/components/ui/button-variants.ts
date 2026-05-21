import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 dark:hover:shadow-lg dark:hover:shadow-primary/35",
        dangerGhost:
          "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300",
        outline:
          "border-border bg-background text-foreground shadow-sm hover:border-primary/35 hover:bg-primary/10 hover:text-primary aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-primary/15 dark:hover:border-primary/60 dark:hover:text-primary",
        secondary:
          "bg-[#10b981] text-white shadow-sm shadow-emerald-600/20 hover:bg-[#0f9f72] hover:shadow-md hover:shadow-emerald-600/20 aria-expanded:bg-[#10b981] aria-expanded:text-white",
        accent:
          "bg-[#6366f1] text-white shadow-sm shadow-indigo-600/20 hover:bg-[#4f46e5] hover:shadow-md hover:shadow-indigo-600/20",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-primary aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted dark:hover:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/40 dark:focus-visible:ring-destructive/40",
        link: "h-auto rounded-none border-0 px-0 py-0 text-primary underline-offset-4 hover:underline",
        inverse:
          "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 rounded-lg px-6 text-base",
        xl: "h-14 gap-2.5 rounded-lg px-7 text-base",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
