// src/features/export/components/ExportButton.tsx
import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportModal } from "@/features/export/components/ExportModal"

interface ExportButtonProps {
  ressource: "projets" | "conventions"
  filtres?: Record<string, string | number | undefined>
  className?: string
}

// Bouton d'export qui ouvre un modal de selection du format (section 7.1 :
// "Export PDF/Excel depuis une liste filtree").
export function ExportButton({ ressource, filtres, className }: ExportButtonProps) {
  const [modalOuvert, setModalOuvert] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setModalOuvert(true)} className={className}>
        <Download size={16} />
        Exporter
      </Button>
      <ExportModal
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        ressource={ressource}
        filtres={filtres}
      />
    </>
  )
}
