// src/features/partenaires/components/PartenaireFiltres.tsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FacetedFilters } from "@/components/shared/FacetedFilters"
import type { FacetteOptions } from "@/components/shared/FacetedFilters"

export interface ValeursFiltresPartenaire {
  recherche: string
  statut: string[]
  visibilite: string[]
}

interface PartenaireFiltresProps {
  valeurs: ValeursFiltresPartenaire
  onChangement: (valeurs: ValeursFiltresPartenaire) => void
}

const FACETTES: FacetteOptions[] = [
  {
    id: "statut",
    libelle: "Statut",
    options: [
      { valeur: "ACTIF", label: "Actif" },
      { valeur: "SUSPENDU", label: "Suspendu" },
    ],
  },
  {
    id: "visibilite",
    libelle: "Visibilite",
    options: [
      { valeur: "PUBLIC", label: "Public" },
      { valeur: "PRIVE", label: "Prive" },
    ],
  },
]

export function PartenaireFiltres({ valeurs, onChangement }: PartenaireFiltresProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher par nom..."
          value={valeurs.recherche}
          onChange={(e) => onChangement({ ...valeurs, recherche: e.target.value })}
          className="pl-8"
          aria-label="Rechercher un partenaire par nom"
        />
      </div>
      <FacetedFilters
        facettes={FACETTES}
        selection={{ statut: valeurs.statut, visibilite: valeurs.visibilite }}
        onChangement={(selection) =>
          onChangement({ ...valeurs, statut: selection.statut ?? [], visibilite: selection.visibilite ?? [] })
        }
      />
    </div>
  )
}
