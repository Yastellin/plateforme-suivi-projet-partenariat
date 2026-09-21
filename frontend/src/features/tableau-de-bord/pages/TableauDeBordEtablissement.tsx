// src/features/tableau-de-bord/pages/TableauDeBordEtablissement.tsx
import { useAuth } from "@/hooks/useAuth"
import { CompteursGlobaux } from "@/features/tableau-de-bord/components/CompteursGlobaux"
import { GraphiqueStatuts } from "@/features/tableau-de-bord/components/GraphiqueStatuts"
import { EcheancierListe } from "@/features/tableau-de-bord/components/EcheancierListe"
import { useTableauDeBord } from "@/features/tableau-de-bord/api/useTableauDeBord"
import { Skeleton } from "@/components/ui/skeleton"

// Tableau de bord scope au perimetre de l'etablissement connecte
// (section 5 du prompt). Meme structure que la Presidence mais sans
// le graphique comparatif (qui est global) et filtre par etablissement.
export function TableauDeBordEtablissement() {
  const { utilisateur } = useAuth()
  const { data: compteurs, isLoading } = useTableauDeBord()

  if (isLoading || !compteurs) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue de l&apos;{utilisateur?.etablissement_nom ?? "établissement"}
        </p>
      </div>

      <CompteursGlobaux compteurs={compteurs} />

      <div className="grid gap-6 lg:grid-cols-2">
        <GraphiqueStatuts compteurs={compteurs} />
        <div className="rounded-md border border-border p-4">
          <h3 className="mb-3 font-heading text-sm font-semibold">
            Échéances à venir
          </h3>
          <EcheancierListe />
        </div>
      </div>
    </div>
  )
}
