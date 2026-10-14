// src/features/espace-public/components/PageHeaderPublique.tsx
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface PageHeaderPubliqueProps {
  titre: string
  description?: string
  icone?: LucideIcon
  etiquette?: string
  children?: ReactNode
}

// En-tete commun des pages de la vitrine publique : fond en degrade avec
// halos colores, titre en degrade, etiquette animee et zone d'action
// (barre de recherche par exemple) sous la description.
export function PageHeaderPublique({
  titre,
  description,
  icone: Icone,
  etiquette,
  children,
}: PageHeaderPubliqueProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/40">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 -z-10 h-72 w-72 rounded-full bg-[var(--color-brand-moment)]/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
        {etiquette && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur"
          >
            {Icone && <Icone size={14} />}
            {etiquette}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          <span className="bg-gradient-to-r from-[var(--color-brand-deep)] to-primary bg-clip-text text-transparent">
            {titre}
          </span>
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-md"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
