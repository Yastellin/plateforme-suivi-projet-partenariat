// src/features/export/pages/ExportPage.tsx
import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ExportPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Export de donnees</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exportez les donnees de la plateforme en PDF ou Excel.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Download size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="font-heading text-sm font-semibold text-foreground">Fonctionnalite bientot disponible</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            L'export de donnees permettra de generer des rapports PDF et des tableurs Excel pour les partenariats, projets et conventions.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">En developpement</Badge>
      </div>
    </div>
  )
}
