// src/features/synthese/pages/SynthesePage.tsx

import { BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"

export function SynthesePage() {
  return (
    <div>
      <PageHeader
        titre="Synthèse annuelle"
        description="Tableau de bord synthétique de l'activité par établissement."
      />

      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-page-bg)] py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <BarChart3 size={28} className="text-[var(--color-text-secondary)]" />
        </div>
        <div className="text-center">
          <h3 className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Fonctionnalité bientôt disponible
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[var(--color-text-secondary)]">
            La synthèse annuelle permettra de consulter les compteurs, graphiques et formulaires narratifs par établissement.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">En développement</Badge>
      </div>
    </div>
  )
}
