// src/features/espace-public/pages/EtablissementsPage.tsx
import { useState } from "react"
import { Building2, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicEtablissements } from "@/features/espace-public/api/usePublicEtablissements"
import { useDebounce } from "@/hooks/useDebounce"
import { EmptyState } from "@/components/shared/EmptyState"

// Page Etablissements de la vitrine publique (section 6.2).
// Liste publique des etablissements membres avec recherche instantanee.
export function EtablissementsPage() {
  const [recherche, setRecherche] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)

  const { data, isLoading } = usePublicEtablissements({
    recherche: rechercheDebounced || undefined,
    limit: 24,
  })

  const etablissements = data?.data ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Établissements membres
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Découvrez les établissements de l'Université de Fianarantsoa
          et leurs domaines de compétence.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mx-auto mt-8 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un établissement..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Grille d'etablissements */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-5">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          : etablissements.map((etab) => (
              <Card
                key={etab.id}
                className="transition-colors hover:bg-accent/50"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    {etab.logo_url ? (
                      <img
                        src={etab.logo_url}
                        alt={etab.nom}
                        className="h-10 w-10 rounded object-contain"
                      />
                    ) : (
                      <Building2 size={28} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-medium text-foreground">
                      {etab.nom}
                    </p>
                    {etab.sigle && (
                      <p className="text-xs text-muted-foreground">
                        {etab.sigle}
                      </p>
                    )}
                    {etab.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {etab.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && etablissements.length === 0 && (
        <EmptyState
          icone={Building2}
          titre="Aucun établissement trouvé"
          description={
            recherche
              ? "Aucun établissement ne correspond à votre recherche."
              : "Aucun établissement n'est actuellement disponible."
          }
        />
      )}
    </div>
  )
}
