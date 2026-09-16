// src/features/archives/pages/ArchivesPage.tsx
import { useState } from "react"
import { Archive } from "lucide-react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { ArchivesFiltres } from "@/features/archives/components/ArchivesFiltres"
import { useArchives } from "@/features/archives/api/useArchives"
import { useDebounce } from "@/hooks/useDebounce"
import type { TypeArchive } from "@/types/api"

// Champ affiche comme titre principal, different selon le type d'entite
const CHAMP_TITRE: Record<TypeArchive, string> = {
  partenaires: "nom",
  partenariats: "intitule",
  projets: "nom",
  conventions: "titre",
  cotutelles: "nom_doctorant",
}

export function ArchivesPage() {
  const [type, setType] = useState<TypeArchive>("partenaires")
  const [recherche, setRecherche] = useState("")
  const rechercheDebouncee = useDebounce(recherche, 300)

  const { data, isLoading } = useArchives<Record<string, unknown>>(type, { recherche: rechercheDebouncee || undefined })

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Archives</h1>

      <ArchivesFiltres
        type={type}
        recherche={recherche}
        onChangementType={setType}
        onChangementRecherche={setRecherche}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Archive} titre="Aucun element archive" message="Rien n'a ete archive dans cette categorie pour l'instant." />
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((item) => {
            const id = item.id as string
            const titre = String(item[CHAMP_TITRE[type]] ?? "Sans titre")
            return (
              <Link
                key={id}
                to={`/presidence/${type}/${id}`}
                className="rounded-md border border-border p-3 transition-colors hover:bg-accent"
              >
                {titre}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}