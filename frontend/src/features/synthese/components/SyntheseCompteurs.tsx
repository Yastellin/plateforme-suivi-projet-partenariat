// src/features/synthese/components/SyntheseCompteurs.tsx
import { Users, Handshake, GraduationCap, FolderKanban } from "lucide-react"
import type { SyntheseEtablissement } from "@/types/api"

export function SyntheseCompteurs({ synthese }: { synthese: SyntheseEtablissement }) {
  const compteurs = [
    { icone: Handshake, label: "Partenaires", valeur: synthese.nombre_partenaires },
    { icone: Users, label: "Conventions actives", valeur: synthese.conventions_actives },
    { icone: GraduationCap, label: "Cotutelles", valeur: synthese.nombre_cotutelles },
    { icone: FolderKanban, label: "Projets actifs", valeur: synthese.projets_actifs },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {compteurs.map((c) => (
        <div key={c.label} className="rounded-md border border-border p-4">
          <c.icone size={18} className="mb-2 text-muted-foreground" />
          <p className="font-mono text-2xl font-semibold">{c.valeur}</p>
          <p className="text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  )
}