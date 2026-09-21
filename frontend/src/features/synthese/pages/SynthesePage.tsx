// src/features/synthese/pages/SynthesePage.tsx
import { BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SynthesePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Synthese annuelle</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tableau de bord synthetique de l'activite par etablissement.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <BarChart3 size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="font-heading text-sm font-semibold text-foreground">Fonctionnalite bientot disponible</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            La synthese annuelle permettra de consulter les compteurs, graphiques et formulaires narratifs par etablissement.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">En developpement</Badge>
      </div>
    </div>
  )
}