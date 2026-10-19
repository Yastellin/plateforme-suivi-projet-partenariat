// src/features/espace-public/components/EnTeteSection.tsx
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/features/espace-public/components/Reveal"

interface EnTeteSectionProps {
  etiquette: string
  titre: string
  description?: string
  lien?: { to: string; libelle: string }
  children?: ReactNode
}

// En-tete commun des sections de l'accueil : etiquette, titre, description
// courte et lien vers la page complete. Apparait au scroll.
export function EnTeteSection({ etiquette, titre, description, lien }: EnTeteSectionProps) {
  return (
    <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{etiquette}</p>
        <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{titre}</h2>
        {description && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {lien && (
        <Link
          to={lien.to}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {lien.libelle}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </Reveal>
  )
}
