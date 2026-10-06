// src/features/export/pages/ExportPage.tsx

import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"

export function ExportPage() {
  return (
    <div>
      <PageHeader
        titre="Export de données"
        description="Exportez les données de la plateforme en PDF ou Excel."
      />

      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] bg-[var(--color-page-bg)] py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <Download size={28} className="text-[var(--color-text-secondary)]" />
        </div>
        <div className="text-center">
          <h3 className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Fonctionnalité bientôt disponible
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[var(--color-text-secondary)]">
            L'export de données permettra de générer des rapports PDF et des tableurs Excel pour les partenariats, projets et conventions.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">En développement</Badge>
      </div>
    </div>
  )
}
