// src/features/tableau-de-bord/components/CompteursGlobaux.tsx
import { Handshake, Users, FolderKanban, FileText } from "lucide-react"
import type { CompteursTableauDeBord } from "@/types/api"

export function CompteursGlobaux({ compteurs }: { compteurs: CompteursTableauDeBord }) {
  const cartes = [
    { icone: Handshake, label: "Partenaires", valeur: compteurs.nombre_partenaires },
    { icone: Users, label: "Partenariats", valeur: compteurs.nombre_partenariats },
    { icone: FolderKanban, label: "Cotutelles", valeur: compteurs.nombre_cotutelles },
    { icone: FileText, label: "Conventions actives", valeur: compteurs.conventions_actives },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cartes.map((c) => (
        <div key={c.label} className="rounded-md border border-border p-4">
          <c.icone size={18} className="mb-2 text-muted-foreground" />
          <p className="font-mono text-2xl font-semibold">{c.valeur}</p>
          <p className="text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  )
}